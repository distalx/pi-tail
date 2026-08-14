import { parse_markdown, parse_log_entry, escape_html } from "./parser.js";

export const ICONS = {
    SUN: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sun" viewBox="0 0 16 16"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/></svg>`,
    MOON: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-stars" viewBox="0 0 16 16"><path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/><path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/></svg>`,
    PAUSE: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>`,
    PLAY: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.596 8.697l-6.363 5.692c-.54.592-.54.126-.54-.126V4.308c0-.654.54-.654.54-.126L11.596 8.697z"/></svg>`,
    COPY: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></svg>`,
    CHECK: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard-check" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0"/><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/></svg>`,
};

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
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            summary.textContent = key;

            const body = document.createElement("div");
            body.className = "details-body";
            body.appendChild(render_data(value));

            details.appendChild(summary);
            details.appendChild(body);
            container.appendChild(details);
        } else {
            const row = document.createElement("div");
            row.style.marginBottom = "0.3rem";
            row.innerHTML = `<span style="color: #8b949e; font-weight: bold;">${key}:</span> ${escape_html(String(value))}`;
            container.appendChild(row);
        }
    }
    return container;
}

export function create_event_block(data) {
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

    const full_text_el = document.createElement("div");
    full_text_el.className = "event-full-text";
    full_text_el.innerHTML = parse_markdown(parsed.full_text);
    details_container.appendChild(full_text_el);

    const raw_details = document.createElement("details");
    const raw_summary = document.createElement("summary");
    raw_summary.textContent = "▶ Raw Telemetry";

    const copy_btn = document.createElement("button");
    copy_btn.className = "copy-btn";
    copy_btn.setAttribute("aria-label", "Copy JSON");
    copy_btn.innerHTML = ICONS.COPY;

    copy_btn.onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard
            .writeText(JSON.stringify(data.payload || {}, null, 2))
            .then(() => {
                copy_btn.innerHTML = ICONS.CHECK;
                setTimeout(() => {
                    copy_btn.innerHTML = ICONS.COPY;
                }, 2000);
            })
            .catch((err) => console.error("Copy failed:", err));
    };

    raw_summary.appendChild(copy_btn);
    raw_details.appendChild(raw_summary);
    raw_details.appendChild(render_data(data.payload || {}));
    details_container.appendChild(raw_details);

    block.appendChild(details_container);

    row.onclick = () => {
        const is_visible = details_container.style.display === "block";
        details_container.style.display = is_visible ? "none" : "block";
    };

    return block;
}
