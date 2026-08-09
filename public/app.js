const timeline = document.getElementById("timeline");
const status_el = document.getElementById("connection-status");
const log_list_el = document.getElementById("log-list");
const current_log_title = document.getElementById("current-log-title");
const theme_toggle_btn = document.getElementById("theme-toggle");

const ICON_SUN = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sun" viewBox="0 0 16 16">
  <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
</svg>`;
const ICON_MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-stars" viewBox="0 0 16 16">
  <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/>
  <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>
</svg>`;

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

document.addEventListener("DOMContentLoaded", () => {
    init_theme();
    load_log_list();
});
