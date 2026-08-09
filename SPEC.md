# SPEC.md: pi-tail

## Task Description

Build a lightweight, zero-dependency Node.js CLI tool and background web server to monitor `pi` coding agent telemetry logs in real-time.

## Objective

Create a global terminal utility (`pi-tail`) that watches JSON Lines (`.log`) files located in the user's active workspace (`.pi/logs/`) and broadcasts appended lines to a browser interface using Server-Sent Events (SSE). The system must run independently of the `pi` agent so that logs remain accessible even if the agent process terminates, and it must support historical log viewing and file switching.

## Architecture

### 1. The CLI & Backend Server (Node.js)

- **CLI Entrypoint (`bin/pi-tail.js`)**: Act as the global binary execution file. Parse command-line arguments (like `--port`) using Node's native `node:util` `parseArgs`, and instantiate the web server.
- **Data Source**: Dynamically resolve the target `.pi/logs/` directory based on the execution context (`process.cwd()`) to identify available `pi_log_<uuid>.log` files.
- **Log Discovery API**: Expose an HTTP `GET` route at `/api/logs` that reads the target logs directory and returns a JSON array of all available `.log` files, sorted descending by modification timestamp (`mtimeMs`).
- **Client-Directed Streaming**: The server must support historical state loading. The `/stream` endpoint must accept a `?file=` query parameter. Upon connection, execute an initial read of the entire file from byte zero to capture the historical state, then seamlessly transition into a dedicated `fs.watch` process for that specific client connection to stream new byte deltas.
- **File Watching Mechanism**: Utilize native Node.js modules (`node:fs` and `node:path`) to watch the targeted file for changes.
- **Delta Streaming**: When an OS interrupt fires indicating the file size has increased, read only the newly appended bytes (using `fs.createReadStream` with explicit `start` and `end` positions).
- **SSE Broadcast**: Expose an HTTP endpoint using the `text/event-stream` content type to push the new JSON lines directly to connected clients.
- **Static File Serving**: Serve the frontend assets (`index.html`, `app.js`, `style.css`) from the `public/` directory via standard HTTP `GET` requests, safely resolved via `import.meta.url`.

### 2. The Frontend Client (Vanilla JS / HTML / CSS)

- **Zero Dependencies**: Do not use Webpack, React, or any build tools. Standard HTML, CSS, and JS only.
- **Sidebar Navigation**: Implement a left sidebar that executes a `fetch()` to `/api/logs` on load and renders a clickable list of available log files.
- **State Reset**: Clicking a file in the sidebar must manually terminate the existing `EventSource` connection using `.close()`, clear all child nodes from the main timeline container to prevent data merging, and initiate a new `EventSource` connection targeted at the newly selected file.
- **DOM Construction**: Parse incoming JSON objects and dynamically generate UI elements using native DOM manipulation (`document.createElement`) to represent the timeline. Prepend new nodes so the newest data appears at the top.
- **Payload Management**: Utilize native HTML `<details>` and `<summary>` tags to collapse large data objects (like `rendered_system_prompt`), keeping the timeline scannable. Extract top-level keys to display in the `<summary>` string to reduce required clicks.
- **Node Culling**: Implement a mechanism to remove the oldest child nodes if the timeline exceeds 500 elements to prevent DOM bloat and browser memory exhaustion.

## Implementation Phases (Historical & Upcoming)

### Phase 1 - 7: Foundation & UI Layout

- Server initialization, directory scanning, SSE delta streaming, and semantic three-column flexbox layout creation. _(Completed)_

### Phase 8: Layer 2 Data Parsing Refactor (Current)

- Deprecate the rigid `large_keys` array in `render_data`.
- Refactor Layer 2 to ingest and render the complete `data` object as a unified, configurable JSON tree to ensure consistency across varying event payloads (`before_agent_start`, `tool_execution_start`, etc.).

### Phase 9: Layer 1 Markdown Integration

- Implement a lightweight, zero-dependency markdown parser for the `full_text_el` in Layer 1 to format AI outputs and system prompts cleanly.

### Phase 10: Atom One Theming & Animations

- Extract hardcoded CSS hex values into `:root` and `[data-theme="dark"]` variables.
- Map the Atom One Light/Dark palette and implement a `localStorage` backed theme toggle.
- Add CSS `@keyframes` for smooth insertion of new `.event-block` elements.

### Phase 11: Extended Quality of Life Features

- Implement auto-scroll pausing, client-side filtering, and payload copy-to-clipboard functionality.

## Coding Conventions & DX Guidelines

- **Strict Naming**: Use `snake_case` exclusively for all variable and function declarations.
- **Clarity Over Metaphor**: When discussing AI behavior or documenting the underlying code, prioritize describing the exact execution mechanism rather than using analogies. If a metaphor is absolutely necessary for communication within the code comments, explicitly acknowledge its limitations.
- **Context Segregation**: Do not inject ephemeral task instructions into this file. Use an `ACTIVE_TASK.md` file to isolate current objectives to maintain a focused context window.
- **Strict Pre-Flight Output**: Before finalizing any code modification, utilize native Node.js tooling (`node --check <file>`, `node --test`, or `node --watch`) via the bash tool. You must explicitly output the terminal execution trace into the chat to prove verification.
- **Version Control Constraints**: The agent is strictly forbidden from executing `git add`, `git commit`, or any other version control state-saving mechanisms. The agent may execute `git status` or `git diff` to inspect the working tree, but the human operator will handle all final commits manually.
