const timeline = document.getElementById("timeline");
const status_el = document.getElementById("connection-status");
const log_list_el = document.getElementById("log-list");
const current_log_title = document.getElementById("current-log-title");

let active_event_source = null;

/**
 * Determines if a key should be rendered inside a collapsible <details> element.
 */
function is_large_payload(key) {
    const large_keys = [
        "rendered_system_prompt",
        "user_prompt",
        "tool_output",
        "context",
    ];
    return large_keys.includes(key);
}

/**
 * Recursively renders JSON data into DOM elements.
 */
function render_data(data) {
    const container = document.createElement("div");
    container.className = "event-content";

    for (const [key, value] of Object.entries(data)) {
        if (is_large_payload(key)) {
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            summary.textContent = `${key} (${typeof value === "object" ? "Object" : typeof value})`;

            const body = document.createElement("div");
            body.className = "details-body";
            body.textContent =
                typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : value;

            details.appendChild(summary);
            details.appendChild(body);
            container.appendChild(details);
        } else if (typeof value === "object" && value !== null) {
            const details = document.createElement("details");
            const summary = document.createElement("summary");

            // Summary Extraction: Add identifiers to the summary text
            let summary_text = key;
            if (value.tool_name) summary_text += ` (tool: ${value.tool_name})`;
            else if (value.status) summary_text += ` (status: ${value.status})`;
            else if (value.name) summary_text += ` (name: ${value.name})`;

            summary.textContent = summary_text;

            const body = document.createElement("div");
            body.className = "details-body";
            body.textContent = JSON.stringify(value, null, 2);

            details.appendChild(summary);
            details.appendChild(body);
            container.appendChild(details);
        } else {
            const row = document.createElement("div");
            row.style.marginBottom = "0.3rem";
            row.innerHTML = `<span style="color: #8b949e; font-weight: bold;">${key}:</span> ${value}`;
            container.appendChild(row);
        }
    }

    return container;
}

/**
 * Extracts key information from a log entry for high-level scannability.
 */
function parse_log_entry(data) {
    const event = data.event;
    const payload = data.data || {};
    let col2 = "unknown";
    let col3 = "";
    let full_text = "";

    switch (event) {
        case "session_start":
            col2 = "session";
            col3 = `Reason: ${payload.reason || "unknown"}`;

            if (payload.previous_session_file) {
                col3 += ` [from: ${payload.previous_session_file}]`;
            }

            full_text = `Execution started in: ${payload.cwd}\nModel: ${payload.model}`;
            break;
        case "session_compact":
            col2 = "system";
            col3 = `Context compacted [reason: ${payload.reason}]`;
            if (payload.will_retry) col3 += " (Retrying turn)";

            full_text = `Compaction executed.\nReason: ${payload.reason}\nTriggered by extension: ${payload.from_extension}`;
            break;
        case "session_tree":
            col2 = "system";
            col3 = `Tree navigation [Leaf: ${payload.old_leaf || "none"} -> ${payload.new_leaf}]`;

            full_text = `Branch navigated.\nNew Leaf ID: ${payload.new_leaf}`;
            break;
        case "model_select":
            col2 = "system";
            col3 = `Model changed to: ${payload.model}`;

            full_text = `Execution engine switched to ${payload.model}.`;
            break;
        case "thinking_level_select":
            col2 = "system";
            col3 = `Thinking level set to: ${payload.level}`;

            full_text = `LLM reasoning parameter updated to ${payload.level}.`;
            break;
        case "before_agent_start":
            col2 = "user";
            const prompt_text = payload.user_prompt || "";
            col3 =
                prompt_text.substring(0, 80) +
                (prompt_text.length > 80 ? "..." : "");

            full_text = prompt_text;
            break;
        case "turn_start":
            col2 = "turn";
            const turn_idx = payload.turn_index ?? "N/A";
            col3 = `Index: ${turn_idx}`;

            full_text = `Turn Index: ${turn_idx}`;
            break;
        case "input":
            col2 = "input";
            const raw_input = payload.raw_text || "";
            col3 =
                raw_input.substring(0, 80) +
                (raw_input.length > 80 ? "..." : "");

            if (payload.source) {
                col3 += ` [source: ${payload.source}]`;
            }

            full_text = raw_input;
            break;
        case "tool_execution_start":
            col2 = payload.tool_name || "tool";
            const args = payload.args || {};
            const cmd = args.command || args.path || "no-args";
            col3 = cmd.substring(0, 80) + (cmd.length > 80 ? "..." : "");

            full_text = cmd;
            break;
        case "tool_execution_end":
            col2 = "out";
            const result = payload.result || {};
            const content =
                result.content && result.content[0]
                    ? result.content[0].text
                    : "";
            col3 =
                content.substring(0, 80) + (content.length > 80 ? "..." : "");

            full_text = content;
            break;
        case "assistant_message":
            const msg_content = payload.content || [];

            const text_block = msg_content.find((m) => m.type === "text");
            const think_block = msg_content.find((m) => m.type === "thinking");
            const tool_block = msg_content.find((m) => m.type === "toolCall");

            if (text_block) {
                col2 = "message";
                const text = text_block.text || "";
                col3 = text.substring(0, 80) + (text.length > 80 ? "..." : "");
                full_text = text;
            } else if (think_block) {
                col2 = "think";
                const thinking = think_block.thinking || "";
                col3 =
                    thinking.substring(0, 80) +
                    (thinking.length > 80 ? "..." : "");
                full_text = thinking;
            } else if (tool_block) {
                col2 = tool_block.name || "toolCall";
                const targs = tool_block.arguments || {};
                const tcmd = targs.path || targs.command || "no-args";
                col3 = tcmd.substring(0, 80) + (tcmd.length > 80 ? "..." : "");
                full_text = tcmd;
            } else {
                col2 = "assistant";
                col3 = "empty";
                full_text = "No content available";
            }
            break;
        default:
            col2 = event;
            const raw = JSON.stringify(payload);
            col3 = raw.substring(0, 80) + (raw.length > 80 ? "..." : "");
            full_text = raw;
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
    block.className = "event-block";

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
    full_text_el.textContent = parsed.full_text;
    details_container.appendChild(full_text_el);

    // Layer 2: Raw Telemetry (Collapsible)
    const raw_details = document.createElement("details");
    const raw_summary = document.createElement("summary");
    raw_summary.textContent = "▶ Raw Telemetry";
    raw_details.appendChild(raw_summary);

    raw_details.appendChild(render_data(data.data || {}));
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
            const block = create_event_block(data);
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

document.addEventListener("DOMContentLoaded", load_log_list);
