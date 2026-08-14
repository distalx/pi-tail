const timeline = document.getElementById("timeline");
const status_el = document.getElementById("connection-status");
const log_list_el = document.getElementById("log-list");
const current_log_title = document.getElementById("current-log-title");
const theme_toggle_btn = document.getElementById("theme-toggle");
const log_filter_el = document.getElementById("log-filter");
const pause_toggle_btn = document.getElementById("pause-toggle");

const ICON_SUN = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sun" viewBox="0 0 16 16">
  <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
</svg>`;
const ICON_MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-stars" viewBox="0 0 16 16">
  <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/>
  <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>
</svg>`;

const ICON_PAUSE = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>`;
const ICON_PLAY = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.596 8.697l-6.363 5.692c-.54.592-.54.126-.54-.126V4.308c0-.654.54-.654.54-.126L11.596 8.697z"/></svg>`;

const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
</svg>`;
const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard-check" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
</svg>`;

let is_paused = false;
let event_queue = [];
let active_event_source = null;

/**
 * Initializes the application theme based on localStorage.
 */
function init_theme() {
    const saved_theme = localStorage.getItem("theme");
    if (saved_theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        theme_toggle_btn.innerHTML = ICON_SUN;
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        theme_toggle_btn.innerHTML = ICON_MOON;
    }

    theme_toggle_btn.onclick = () => {
        const current_theme =
            document.documentElement.getAttribute("data-theme");
        const new_theme = current_theme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", new_theme);
        theme_toggle_btn.innerHTML =
            new_theme === "dark" ? ICON_SUN : ICON_MOON;
        localStorage.setItem("theme", new_theme);
    };

    // Initialize pause toggle button
    pause_toggle_btn.innerHTML = ICON_PAUSE;
    pause_toggle_btn.onclick = () => {
        is_paused = !is_paused;
        pause_toggle_btn.innerHTML = is_paused ? ICON_PLAY : ICON_PAUSE;

        if (!is_paused) {
            // Flush queue: Process all cached events in order
            while (event_queue.length > 0) {
                const data = event_queue.shift();
                const block = create_event_block(data);

                // Still respect current filter when flushing queue
                const filter_text = log_filter_el.value.toLowerCase();
                if (
                    filter_text &&
                    !block.textContent.toLowerCase().includes(filter_text)
                ) {
                    block.style.display = "none";
                }

                timeline.prepend(block);
            }
        }
    };
}

/**
 * Escapes HTML characters to prevent XSS and malformed DOM layout.
 */
function escape_html(text) {
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
function parse_markdown(raw_text) {
    let html = escape_html(raw_text);

    // Code Blocks: ```language\ncode\n``` -> <pre><code class="language-lang">code</code></pre>
    html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
    });

    // Inline Code: `code` -> <code>code</code>
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Line breaks are natively handled by 'white-space: pre-wrap' in CSS.
    return html;
}

function render_data(data) {
    const container = document.createElement("div");
    container.className = "event-content";

    if (data === null || typeof data !== "object") {
        const row = document.createElement("div");
        row.textContent = String(data);
        container.appendChild(row);
        return container;
    }

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === "object" && value !== null) {
            // Condition A: Objects/Arrays - Create a collapsible tree node
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            summary.textContent = key;

            const body = document.createElement("div");
            body.className = "details-body";

            // Recursively render the nested value and append it to the details body
            body.appendChild(render_data(value));

            details.appendChild(summary);
            details.appendChild(body);
            container.appendChild(details);
        } else {
            // Condition B: Primitives - Create a standard key-value row
            const row = document.createElement("div");
            row.style.marginBottom = "0.3rem";
            row.innerHTML = `<span style="color: #8b949e; font-weight: bold;">${key}:</span> ${escape_html(String(value))}`;
            container.appendChild(row);
        }
    }

    return container;
}

/**
 * Extracts key information from a log entry conforming to the new pi-logger JSONL schema.
 */
function parse_log_entry(data) {
    const event = data.event_type;
    const payload = data.payload || {};
    const model = data.model;
    const cwd = data.cwd;

    let col2 = "unknown";
    let col3 = "";
    let full_text = "";

    switch (event) {
        // Session Events
        case "session_start":
            col2 = "session";
            col3 = `Reason: ${payload.reason || "new"}`;
            if (payload.previous_session_file) {
                col3 += ` [from: ${payload.previous_session_file}]`;
            }
            full_text = `Session started.\nReason: ${payload.reason || "new"}\nWorking Directory: ${cwd || "N/A"}\nModel: ${model || "N/A"}`;
            break;

        case "session_shutdown":
            col2 = "session";
            col3 = `Shutdown: ${payload.reason || "normal"}`;
            full_text = `Session shutdown.\nReason: ${payload.reason || "normal"}${payload.target_session_file ? `\nTarget Session File: ${payload.target_session_file}` : ""}`;
            break;

        // Agent Runs
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

        // Prompt & Inputs
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
            if (payload.source) {
                col3 += ` [source: ${payload.source}]`;
            }
            full_text = input_text;
            break;

        case "user_bash":
            col2 = "bash";
            const bash_cmd = payload.command || "";
            col3 =
                bash_cmd.substring(0, 80) + (bash_cmd.length > 80 ? "..." : "");
            full_text = `User Bash Execution:\n${bash_cmd}`;
            break;

        // Turns
        case "turn_start":
            col2 = "turn";
            const turn_start_idx = payload.turn_index ?? "N/A";
            col3 = `Turn Start [Index: ${turn_start_idx}]`;
            full_text = `Turn ${turn_start_idx} started at timestamp ${payload.timestamp || "N/A"}.`;
            break;

        case "turn_end":
            col2 = "turn";
            const turn_end_idx = payload.turn_index ?? "N/A";
            const tool_results = payload.tool_result_count ?? 0;
            col3 = `Turn End [Index: ${turn_end_idx}, Tool Results: ${tool_results}]`;
            full_text = `Turn ${turn_end_idx} ended.\nTool results produced in turn: ${tool_results}`;
            break;

        // Messages
        case "message_start": {
            const role = payload.role || "assistant";
            col2 =
                role === "assistant"
                    ? "message"
                    : role === "user"
                      ? "user"
                      : "out";
            const summary = payload.content_summary || {};
            const preview =
                summary.text || summary.thinking || "(streaming started)";
            col3 =
                preview.substring(0, 80) + (preview.length > 80 ? "..." : "");
            full_text = preview;
            break;
        }

        case "message_end": {
            const role = payload.role || "assistant";
            const content = payload.content || {};

            if (content.thinking && !content.text) {
                col2 = "think";
                col3 =
                    content.thinking.substring(0, 80) +
                    (content.thinking.length > 80 ? "..." : "");
                full_text = content.thinking;
            } else {
                col2 =
                    role === "assistant"
                        ? "message"
                        : role === "user"
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
        }

        // Tools
        case "tool_execution_start": {
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
        }

        case "tool_execution_end": {
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
        }

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

        // Provider & Network
        case "after_provider_response":
            col2 = payload.status >= 400 ? "error" : "provider";
            col3 = `HTTP ${payload.status}`;
            full_text = `Provider HTTP Response: ${payload.status}\nHeaders:\n${JSON.stringify(payload.headers, null, 2)}`;
            break;

        // Configuration Changes
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

        // Session Compaction & Branching
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

        // Metrics
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

function create_event_block(data) {
    const parsed = parse_log_entry(data);

    const block = document.createElement("div");
    block.className = "event-block animate-in";

    // Row view (Compact)
    const row = document.createElement("div");
    row.className = "event-row";

    const col1 = document.createElement("div");
    col1.className = "col-1";
    col1.textContent = parsed.col1;

    const col2 = document.createElement("div");
    col2.className = `col-2 type-${parsed.col2}`;
    col2.textContent = parsed.col2;

    const col3 = document.createElement("div");
    col3.className = "col-3";
    col3.textContent = parsed.col3;

    row.appendChild(col1);
    row.appendChild(col2);
    row.appendChild(col3);
    block.appendChild(row);

    // Detailed view (Dual Layer)
    const details_container = document.createElement("div");
    details_container.className = "event-details";

    // Layer 1: Human-Readable Full Text
    const full_text_el = document.createElement("div");
    full_text_el.className = "event-full-text";
    full_text_el.innerHTML = parse_markdown(parsed.full_text);
    details_container.appendChild(full_text_el);

    // Layer 2: Raw Telemetry (Collapsible)
    const raw_details = document.createElement("details");
    const raw_summary = document.createElement("summary");
    raw_summary.textContent = "▶ Raw Telemetry";

    // Copy Button Integration
    const copy_btn = document.createElement("button");
    copy_btn.className = "copy-btn";
    copy_btn.setAttribute("aria-label", "Copy JSON");
    copy_btn.innerHTML = ICON_COPY;

    copy_btn.onclick = (e) => {
        e.stopPropagation(); // Prevent toggling the details element
        navigator.clipboard
            .writeText(JSON.stringify(data.payload || {}, null, 2))
            .then(() => {
                copy_btn.innerHTML = ICON_CHECK;
                setTimeout(() => {
                    copy_btn.innerHTML = ICON_COPY;
                }, 2000);
            })
            .catch((err) => console.error("Copy failed:", err));
    };

    raw_summary.appendChild(copy_btn);
    raw_details.appendChild(raw_summary);

    raw_details.appendChild(render_data(data.payload || {}));
    details_container.appendChild(raw_details);

    block.appendChild(details_container);

    // Toggle logic
    row.onclick = () => {
        const is_visible = details_container.style.display === "block";
        details_container.style.display = is_visible ? "none" : "block";
    };

    return block;
}

function connect_to_log(filename) {
    // 1. Terminate existing connection
    if (active_event_source) {
        active_event_source.close();
    }

    // 2. Clear timeline to prevent data merging
    timeline.innerHTML = "";
    current_log_title.textContent = filename;

    // 3. Initiate new EventSource connection
    const event_source = new EventSource(
        `/stream?file=${encodeURIComponent(filename)}`,
    );

    event_source.onopen = () => {
        status_el.textContent = "Connected";
        status_el.className = "status connected";
    };

    event_source.onerror = (err) => {
        console.error("SSE Connection Error:", err);
        status_el.textContent = "Disconnected";
        status_el.className = "status disconnected";
    };

    event_source.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (is_paused) {
                event_queue.push(data);
                return;
            }

            const block = create_event_block(data);

            // Apply active filter to new blocks before appending
            const filter_text = log_filter_el.value.toLowerCase();
            if (
                filter_text &&
                !block.textContent.toLowerCase().includes(filter_text)
            ) {
                block.style.display = "none";
            }

            timeline.prepend(block);

            // Node Culling: prevent DOM bloat
            if (timeline.children.length > 500) {
                timeline.removeChild(timeline.lastChild);
            }
        } catch (e) {
            console.error("Error parsing SSE message:", e);
        }
    };

    active_event_source = event_source;
}

async function load_log_list() {
    try {
        const response = await fetch("/api/logs");
        if (!response.ok) throw new Error("Failed to fetch logs list");

        const files = await response.json();

        files.forEach((file) => {
            const item = document.createElement("div");
            item.className = "log-item";
            item.textContent = file.name;
            item.title = file.name;

            item.onclick = () => {
                // Update active visual state
                document
                    .querySelectorAll(".log-item")
                    .forEach((el) => el.classList.remove("active"));
                item.classList.add("active");

                connect_to_log(file.name);
            };

            log_list_el.appendChild(item);
        });

        // Auto-connect to the most recent log if available
        if (files.length > 0) {
            const latest = files[0];
            const first_item = log_list_el.firstElementChild;
            if (first_item) {
                first_item.classList.add("active");
                first_item.click();
            }
        }
    } catch (e) {
        console.error("Error loading logs list:", e);
        log_list_el.innerHTML =
            '<div class="log-item" style="color: #da3633;">Failed to load logs</div>';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    init_theme();
    load_log_list();

    // Real-time filtering logic
    log_filter_el.oninput = () => {
        const search_term = log_filter_el.value.toLowerCase();
        const blocks = document.querySelectorAll(".event-block");

        blocks.forEach((block) => {
            const is_match = block.textContent
                .toLowerCase()
                .includes(search_term);
            block.style.display = is_match ? "block" : "none";
        });
    };
});
