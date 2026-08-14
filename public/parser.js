/**
 * Escapes HTML characters to prevent XSS and malformed DOM layout.
 */
export function escape_html(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Lightweight Markdown parser for Layer 1 display.
 */
export function parse_markdown(raw_text) {
    let html = escape_html(raw_text);

    // Code Blocks: ```language\ncode\n``` -> <pre><code class="language-lang">code</code></pre>
    html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
    });

    // Inline Code: `code` -> <code>code</code>
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    return html;
}

/**
 * Extracts key information from a log entry conforming to the new pi-logger JSONL schema.
 */
export function parse_log_entry(data) {
    const event = data.event_type;
    const payload = data.payload || {};
    const model = data.model;
    const cwd = data.cwd;

    let col2 = "unknown";
    let col3 = "";
    let full_text = "";

    switch (event) {
        case "session_start":
            col2 = "session";
            col3 = `Reason: ${payload.reason || "new"}`;
            if (payload.previous_session_file)
                col3 += ` [from: ${payload.previous_session_file}]`;
            full_text = `Session started.\nReason: ${payload.reason || "new"}\nWorking Directory: ${cwd || "N/A"}\nModel: ${model || "N/A"}`;
            break;
        case "session_shutdown":
            col2 = "session";
            col3 = `Shutdown: ${payload.reason || "normal"}`;
            full_text = `Session shutdown.\nReason: ${payload.reason || "normal"}${payload.target_session_file ? `\nTarget Session File: ${payload.target_session_file}` : ""}`;
            break;
        case "agent_start":
            col2 = "agent";
            col3 = "Agent run started";
            full_text = "Agent run started.";
            break;
        case "agent_end":
            col2 = "agent";
            col3 = `Agent run ended [Turns: ${payload.turn_count ?? 0}, Messages: ${payload.message_count ?? 0}]`;
            full_text = `Agent run ended.\nTotal turns: ${payload.turn_count ?? 0}\nTotal messages: ${payload.message_count ?? 0}`;
            break;
        case "agent_settled":
            col2 = "agent";
            col3 = "Agent settled";
            full_text =
                "Agent settled (all pending background and turn work completed).";
            break;
        case "before_agent_start":
            col2 = "user";
            const prompt_text = payload.prompt || "";
            col3 =
                prompt_text.substring(0, 80) +
                (prompt_text.length > 80 ? "..." : "");
            full_text = prompt_text;
            if (payload.rendered_system_prompt) {
                full_text += `\n\n---\n**Rendered System Prompt:**\n${payload.rendered_system_prompt}`;
            }
            break;
        case "input":
            col2 = "input";
            const input_text = payload.text || "";
            col3 =
                input_text.substring(0, 80) +
                (input_text.length > 80 ? "..." : "");
            if (payload.source) col3 += ` [source: ${payload.source}]`;
            full_text = input_text;
            break;
        case "user_bash":
            col2 = "bash";
            const bash_cmd = payload.command || "";
            col3 =
                bash_cmd.substring(0, 80) + (bash_cmd.length > 80 ? "..." : "");
            full_text = `User Bash Execution:\n${bash_cmd}`;
            break;
        case "turn_start":
            col2 = "turn";
            col3 = `Turn Start [Index: ${payload.turn_index ?? "N/A"}]`;
            full_text = `Turn ${payload.turn_index ?? "N/A"} started at timestamp ${payload.timestamp || "N/A"}.`;
            break;
        case "turn_end":
            col2 = "turn";
            col3 = `Turn End [Index: ${payload.turn_index ?? "N/A"}, Tool Results: ${payload.tool_result_count ?? 0}]`;
            full_text = `Turn ${payload.turn_index ?? "N/A"} ended.\nTool results produced in turn: ${payload.tool_result_count ?? 0}`;
            break;
        case "message_start":
            const role = payload.role || "assistant";
            col2 =
                role === "assistant"
                    ? "message"
                    : role === "user"
                      ? "user"
                      : "out";
            const preview =
                payload.content_summary?.text ||
                payload.content_summary?.thinking ||
                "(streaming started)";
            col3 =
                preview.substring(0, 80) + (preview.length > 80 ? "..." : "");
            full_text = preview;
            break;
        case "message_end":
            const role_end = payload.role || "assistant";
            const content = payload.content || {};
            if (content.thinking && !content.text) {
                col2 = "think";
                col3 =
                    content.thinking.substring(0, 80) +
                    (content.thinking.length > 80 ? "..." : "");
                full_text = content.thinking;
            } else {
                col2 =
                    role_end === "assistant"
                        ? "message"
                        : role_end === "user"
                          ? "user"
                          : "out";
                const text = content.text || content.thinking || "No content";
                col3 = text.substring(0, 80) + (text.length > 80 ? "..." : "");
                full_text = text;
            }
            if (payload.performance) {
                full_text += `\n\n---\n*Prefill:* ${payload.performance.prefill_ms}ms | *Gen:* ${payload.performance.generation_ms}ms | *TPS:* ${payload.performance.output_tps ?? "N/A"}`;
            }
            break;
        case "tool_execution_start":
            col2 = payload.tool_name || "tool";
            const args = payload.args || {};
            const arg_str =
                typeof args === "string"
                    ? args
                    : args.command || args.path || JSON.stringify(args);
            col3 =
                arg_str.substring(0, 80) + (arg_str.length > 80 ? "..." : "");
            full_text = `Tool Call: ${payload.tool_name} (ID: ${payload.tool_call_id})\nArgs:\n${JSON.stringify(args, null, 2)}`;
            break;
        case "tool_execution_end":
            col2 = payload.is_error ? "error" : "out";
            const result_text =
                payload.result_raw ||
                payload.result_summary ||
                (payload.is_error ? "Tool failed" : "Success");
            col3 =
                (payload.is_error ? "[Error] " : "") +
                (result_text.substring(0, 70) +
                    (result_text.length > 70 ? "..." : ""));
            full_text = result_text;
            break;
        case "tool_call":
            col2 = "toolCall";
            const call_input = payload.input
                ? JSON.stringify(payload.input)
                : "{}";
            col3 = `${payload.tool_name}: ${call_input}`.substring(0, 80);
            full_text = `LLM Tool Call: ${payload.tool_name}\nInput:\n${JSON.stringify(payload.input, null, 2)}`;
            break;
        case "tool_result":
            col2 = payload.is_error ? "error" : "out";
            col3 = `Result: ${payload.tool_name} [${payload.content_length ?? 0} chars]`;
            full_text = `Tool Result returned to LLM for ${payload.tool_name}.\nContent length: ${payload.content_length} characters\nError: ${payload.is_error}`;
            break;
        case "after_provider_response":
            col2 = payload.status >= 400 ? "error" : "provider";
            col3 = `HTTP ${payload.status}`;
            full_text = `Provider HTTP Response: ${payload.status}\nHeaders:\n${JSON.stringify(payload.headers, null, 2)}`;
            break;
        case "model_select":
            col2 = "system";
            col3 = `Model: ${payload.previous_model || "none"} -> ${payload.model}`;
            full_text = `Model changed to: ${payload.model}\nPrevious Model: ${payload.previous_model}\nSource: ${payload.source}`;
            break;
        case "thinking_level_select":
            col2 = "system";
            col3 = `Thinking level: ${payload.previous_level || "none"} -> ${payload.level}`;
            full_text = `Thinking level switched to ${payload.level} (was ${payload.previous_level}).`;
            break;
        case "session_before_compact":
            col2 = "system";
            col3 = `Compacting context [reason: ${payload.reason}, tokens: ${payload.tokens_before ?? "N/A"}]`;
            full_text = `Compaction started.\nReason: ${payload.reason}\nTokens before: ${payload.tokens_before}\nBranch entries: ${payload.branch_entry_count}`;
            break;
        case "session_compact":
            col2 = "system";
            col3 = `Context compacted [reason: ${payload.reason}, tokens: ${payload.tokens_before ?? "N/A"} -> ${payload.tokens_after ?? "N/A"}]`;
            full_text = `Compaction completed.\nReason: ${payload.reason}\nTokens before: ${payload.tokens_before}\nTokens after: ${payload.tokens_after}\nRetrying turn: ${payload.will_retry}`;
            break;
        case "session_tree":
            col2 = "system";
            col3 = `Tree navigation [Leaf: ${payload.old_leaf_id || "none"} -> ${payload.new_leaf_id}]`;
            full_text = `Branch navigated.\nOld Leaf: ${payload.old_leaf_id}\nNew Leaf: ${payload.new_leaf_id}`;
            break;
        case "metrics_snapshot":
            col2 = "metrics";
            const cost_str =
                payload.cost?.total !== undefined
                    ? `$${payload.cost.total.toFixed(4)}`
                    : "$0";
            const total_tokens = payload.tokens?.total ?? 0;
            col3 = `Snapshot [Tokens: ${total_tokens}, Cost: ${cost_str}, Turns: ${payload.turn_count ?? 0}]`;
            full_text = `Metrics Snapshot:\nTokens: ${JSON.stringify(payload.tokens, null, 2)}\nCost: ${JSON.stringify(payload.cost, null, 2)}\nTool Error Rate: ${payload.tool_error_rate}\nAvg TPS: ${payload.avg_output_tps}`;
            break;
        default:
            col2 = event || "unknown";
            const raw_str = JSON.stringify(payload);
            col3 =
                raw_str.substring(0, 80) + (raw_str.length > 80 ? "..." : "");
            full_text = raw_str;
            break;
    }

    return {
        col1: data.seq !== undefined ? data.seq : "",
        col2: col2,
        col3: col3,
        full_text: full_text,
    };
}
