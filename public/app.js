import { create_event_block, render_trace_tree, ICONS } from "./ui.js";
import { TraceManager } from "./trace_parser.js";

const timeline = document.getElementById("timeline");
const traces_view = document.getElementById("traces-view");
const status_el = document.getElementById("connection-status");
const log_list_el = document.getElementById("log-list");
const current_log_title = document.getElementById("current-log-title");
const theme_toggle_btn = document.getElementById("theme-toggle");
const view_toggle_btn = document.getElementById("view-toggle");
const log_filter_el = document.getElementById("log-filter");
const pause_toggle_btn = document.getElementById("pause-toggle");

let is_paused = false;
let event_queue = [];
let active_event_source = null;
let current_view = "feed";

// Initialize the Trace Manager
const trace_manager = new TraceManager();

function update_view_state() {
    if (current_view === "traces") {
        timeline.style.display = "none";
        traces_view.style.display = "block";
        view_toggle_btn.innerHTML = ICONS.VIEW_FEED;
        log_filter_el.style.display = "none";
    } else {
        timeline.style.display = "block";
        traces_view.style.display = "none";
        view_toggle_btn.innerHTML = ICONS.VIEW_TRACE;
        log_filter_el.style.display = "block";
    }
}

function init_theme_and_controls() {
    // --- Existing Theme Logic ---
    const saved_theme = localStorage.getItem("theme");
    if (saved_theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        theme_toggle_btn.innerHTML = ICONS.SUN;
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        theme_toggle_btn.innerHTML = ICONS.MOON;
    }

    theme_toggle_btn.onclick = () => {
        const current_theme =
            document.documentElement.getAttribute("data-theme");
        const new_theme = current_theme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", new_theme);
        theme_toggle_btn.innerHTML =
            new_theme === "dark" ? ICONS.SUN : ICONS.MOON;
        localStorage.setItem("theme", new_theme);
    };

    // --- Existing Pause Logic ---
    pause_toggle_btn.innerHTML = ICONS.PAUSE;
    pause_toggle_btn.onclick = () => {
        is_paused = !is_paused;
        pause_toggle_btn.innerHTML = is_paused ? ICONS.PLAY : ICONS.PAUSE;

        if (!is_paused) {
            while (event_queue.length > 0) {
                const data = event_queue.shift();

                // Process the queued data into the trace tree
                trace_manager.process_event(data);

                const block = create_event_block(data);
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

    // --- Internal View Toggle Logic ---
    view_toggle_btn.onclick = () => {
        // Toggle the internal state
        current_view = current_view === "feed" ? "traces" : "feed";

        // Apply the visual changes
        update_view_state();

        // Trigger trace rendering if switching to traces view
        if (current_view === "traces") {
            render_traces();
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function render_traces() {
    const traces = trace_manager.get_traces();
    render_trace_tree(traces, traces_view);
}

const debounced_render_traces = debounce(render_traces, 100);

function connect_to_log(filename) {
    if (active_event_source) active_event_source.close();

    // 1. Instantly clear both views and the in-memory tree
    timeline.innerHTML = "";
    traces_view.innerHTML = "";
    trace_manager.clear();

    current_log_title.textContent = filename;

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

            // Process data for the Trace tree
            trace_manager.process_event(data);

            // 2. Trigger a debounced re-render ONLY if the traces view is currently active
            if (current_view === "traces") {
                debounced_render_traces();
            }

            // Process data for the Timeline feed
            const block = create_event_block(data);
            const filter_text = log_filter_el.value.toLowerCase();

            if (
                filter_text &&
                !block.textContent.toLowerCase().includes(filter_text)
            ) {
                block.style.display = "none";
            }

            timeline.prepend(block);

            if (timeline.children.length > 500) {
                timeline.removeChild(timeline.lastChild);
            }
        } catch (e) {
            console.error("Error parsing SSE message:", e);
        }
    };

    active_event_source = event_source;
}

// ... [load_log_list and DOMContentLoaded functions remain exactly the same] ...

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
                document
                    .querySelectorAll(".log-item")
                    .forEach((el) => el.classList.remove("active"));
                item.classList.add("active");
                connect_to_log(file.name);
            };

            log_list_el.appendChild(item);
        });

        if (files.length > 0) {
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
    init_theme_and_controls();
    update_view_state(); // Set initial visibility based on URL
    load_log_list();

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
