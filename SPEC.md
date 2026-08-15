# SPEC.md: pi-tail

## Task Description

Build a lightweight, zero-dependency Node.js CLI tool and background web server to monitor `pi` coding agent telemetry logs in real-time.

## Objective

Create a global terminal utility (`pi-tail`) that watches JSON Lines (`.jsonl`) files located in the user's active workspace (`.pi/logs/`) and broadcasts appended lines to a browser interface using Server-Sent Events (SSE). The system must run independently of the `pi` agent so that logs remain accessible even if the agent process terminates, and it must support historical log viewing, file switching, chronological feeds, and hierarchical trace visualization.

## Architecture

### 1. The CLI & Backend Server (Node.js)

- **CLI Entrypoint (`bin/pi-tail.js`)**: Act as the global binary execution file. Parse command-line arguments (like `--port`) using Node's native `node:util` `parseArgs`, and instantiate the web server.
- **Data Source**: Dynamically resolve the target `.pi/logs/` directory based on the execution context (`process.cwd()`) to identify available `session-*.jsonl` files.
- **Log Discovery API**: Expose an HTTP `GET` route at `/api/logs` that reads the target logs directory and returns a JSON array of all available `.jsonl` files, sorted descending by modification timestamp (`mtimeMs`).
- **Client-Directed Streaming**: The server must support historical state loading. The `/stream` endpoint must accept a `?file=` query parameter. Upon connection, execute an initial read of the entire file from byte zero to capture the historical state, then seamlessly transition into a dedicated `fs.watch` process for that specific client connection to stream new byte deltas.
- **File Watching Mechanism**: Utilize native Node.js modules (`node:fs` and `node:path`) to watch the targeted file for changes.
- **Delta Streaming**: When an OS interrupt fires indicating the file size has increased, read only the newly appended bytes (using `fs.createReadStream` with explicit `start` and `end` positions).
- **SSE Broadcast**: Expose an HTTP endpoint using the `text/event-stream` content type to push the new JSON lines directly to connected clients.
- **Static File Serving**: Serve the frontend assets (`index.html`, `app.js`, `style.css`, etc.) from the `public/` directory via standard HTTP `GET` requests, safely resolved via `import.meta.url`.

### 2. The Frontend Client (Vanilla JS / HTML / CSS)

- **Zero Dependencies**: Do not use Webpack, React, or any build tools. Standard HTML, CSS, and JS only.
- **Sidebar Navigation**: Implement a left sidebar that executes a `fetch()` to `/api/logs` on load and renders a clickable list of available log files.
- **State Reset**: Clicking a file in the sidebar must manually terminate the existing `EventSource` connection using `.close()`, clear all child nodes from the timeline and trace containers, reset the metrics HUD, and initiate a new `EventSource` connection targeted at the newly selected file.
- **Dual-View Architecture**: Maintain an internal state variable to toggle the UI between a flat chronological feed and a hierarchical trace visualization. Avoid external URL routing (History API) to prevent 404 errors on hard refreshes.
- **Metrics HUD**: Render a sticky flexbox ribbon above the main content area that intercepts `metrics_snapshot` events to dynamically display granular token usage (Input, Output, Reasoning) and error rates in real-time.
- **Trace Visualization & Gantt Charts**: Reconstruct hierarchical execution trees in memory using `trace_id`, `span_id`, and `parent_span_id`. Render these as native HTML `<details>` blocks, calculating and applying CSS `left` and `width` percentages to create inline Gantt charts mapping execution duration. Wrap the rendering logic in a debounce utility to prevent UI thread locking during rapid SSE streams.
- **Payload Inspection**: Utilize the native HTML5 `<dialog>` element to create on-the-fly popup modals for inspecting raw JSON payloads associated with specific trace spans, avoiding complex z-index management.
- **DOM Construction (Feed View)**: Parse incoming JSON objects and dynamically generate UI elements using native DOM manipulation (`document.createElement`). Prepend new nodes so the newest data appears at the top. Utilize native HTML `<details>` and `<summary>` tags to collapse large data objects.
- **Node Culling**: Implement a mechanism to remove the oldest child nodes if the chronological timeline exceeds 500 elements to prevent DOM bloat and browser memory exhaustion.

## Coding Conventions & DX Guidelines

- **Strict Naming**: Use `snake_case` exclusively for all variable and function declarations.
- **Clarity Over Metaphor**: When discussing AI behavior or documenting the underlying code, prioritize describing the exact execution mechanism rather than using analogies. If a metaphor is absolutely necessary for communication within the code comments, explicitly acknowledge its limitations.
- **Context Segregation**: Do not inject ephemeral task instructions into this file. Use an `ACTIVE_TASK.md` file to isolate current objectives to maintain a focused context window.
- **Strict Pre-Flight Output**: Before finalizing any code modification, utilize native Node.js tooling (`node --check <file>`, `node --test`, or `node --watch`) via the bash tool. You must explicitly output the terminal execution trace into the chat to prove verification.
- **Version Control Constraints**: The agent is strictly forbidden from executing `git add`, `git commit`, or any other version control state-saving mechanisms. The agent may execute `git status` or `git diff` to inspect the working tree, but the human operator will handle all final commits manually.
