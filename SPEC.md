# SPEC.md: pi-tail

## Task Description

Build a lightweight, zero-dependency Node.js CLI tool and background web server to monitor `pi` coding agent telemetry logs in real-time.

## Objective

Create a global terminal utility (`pi-tail`) that watches JSON Lines (`.log`) files located in the user's active workspace (`.pi/logs/`) and broadcasts appended lines to a browser interface using Server-Sent Events (SSE). The system must run independently of the `pi` agent so that logs remain accessible even if the agent process terminates, and it must support historical log viewing and file switching.

## Architecture

### 1. The CLI & Backend Server (Node.js)

- **CLI Entrypoint (`bin/pi-tail.js`)**: Act as the global binary execution file. Parse command-line arguments (like `--port`) using Node's native `node:util` `parseArgs`, and instantiate the web server.
- **Data Source**: Dynamically resolve the target `.pi/logs/` directory based on the execution context (`process.cwd()`) to identify available `simple_log_<uuid>.log` files.
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

## Implementation Phases (Historical Reference)

### Phase 1: Server Foundation & SSE

- Initialize the `node:http` server and serve static files.
- Build a mock SSE endpoint and verify it correctly pushes dummy lines to a basic HTML page.

### Phase 2: Live File Tracking

- Implement directory-scanning logic to locate active `.log` files dynamically via `process.cwd()`.
- Connect the `fs.watch` event to the SSE broadcaster, transmitting new byte deltas.

### Phase 3: Interface Formatting

- Build the timeline interface in `public/index.html` and `public/app.js`.
- Style the event blocks to differentiate between event types and implement collapsible `<details>` views without redundant data.

### Phase 4: Historical State & Client-Directed Streams

- Refactor the backend `/stream` endpoint to accept a `?file=` parameter.
- Implement historical loading from byte zero on initial connection, followed by connection-specific file watchers.

### Phase 5: Discovery API

- Implement the `/api/logs` endpoint to expose the directory contents as a sorted JSON array.

### Phase 6: Sidebar Integration

- Build the frontend sidebar container.
- Implement the data-fetching logic and wire up the connection-reset mechanism for switching between files interactively.

### Phase 7: Semantic UI Layout & Scannability

- Refactor the DOM construction mechanism to display a three-column flexbox row consisting of a Sequence integer (`seq`), an Action identifier, and a single-line text Summary.
- Implement a data-parsing router function that evaluates the incoming `event` type to extract the highest-value identifiers (e.g., `data.tool_name` for tool executions, truncated `thinking` strings for assistant messages) for the UI columns.
- Implement an expansion mechanism by attaching an `onclick` event listener to the flexbox row, allowing users to dynamically toggle the CSS visibility state of the full, raw JSON tree beneath it.

## Coding Conventions & Guidelines

- **Strict Naming**: Use `snake_case` exclusively for all variable and function declarations.
- **Clarity Over Metaphor**: When discussing AI behavior or documenting the underlying code, prioritize describing the exact execution mechanism rather than using analogies. If a metaphor is absolutely necessary for communication within the code comments, explicitly acknowledge its limitations.
- **Modularity**: Keep the CLI execution, HTTP routing, and file-watching logic cleanly separated to maintain readability.
- **Version Control Constraints**: The agent is strictly forbidden from executing `git add`, `git commit`, or any other version control state-saving mechanisms. The agent may execute `git status` or `git diff` to inspect the working tree, but the human operator will handle all final commits manually.
