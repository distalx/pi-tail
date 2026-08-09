# pi-tail

`pi-tail` is a lightweight, zero-dependency real-time web visualizer for monitoring `pi` coding agent telemetry logs. It scans your active workspace for `.pi/logs/`, starts a local background server, and streams live JSONL events directly into a responsive, scannable browser dashboard via Server-Sent Events (SSE).

![pi-tail Dashboard Preview](https://raw.githubusercontent.com/distalx/pi-tail/main/assets/screenshot.png)

## Features

- **Zero Dependencies:** Built entirely with native Node.js modules (`node:http`, `node:fs`, `node:path`, `node:util`). No heavy build tools, frameworks, or external libraries required.
- **Real-Time Streaming:** Automatically detects file updates and streams new byte deltas instantly without full-page reloads.
- **Interactive Sidebar:** Switch between multiple historical log sessions instantly.
- **Dual-Layer UI:** Scannable three-column flexbox rows (Sequence, Action Type, Text Summary) with interactive click-to-toggle raw JSON trees and collapsible payload sections.
- **DOM Memory Protection:** Automatic node culling keeps memory footprint low during long-running agent executions.
- **Customizable Port:** Easily run on alternative ports if port 3000 is occupied.

---


## Installation & Usage

You don't even need to install `pi-tail` globally! Navigate to any project directory where `pi-logger` has initialized telemetry logs (`.pi/logs/`), and run it directly using `npx`:

```bash
npx pi-tail

```

This will spin up a local server and output a clickable link in your terminal:

```bash
[pi-tail] Visualizer running at http://localhost:3000

```

### Custom Ports

If port `3000` is currently in use, pass the `--port` (or `-p`) flag to specify a different port:

```bash
npx pi-tail --port 4000
# or
npx pi-tail -p 8080

```

*(Optional)* If you prefer to install it globally for offline or frequent usage:

```bash
npm install -g pi-tail
pi-tail

```

---

## Architecture Overview

- **`bin/pi-tail.js`**: The CLI entrypoint that parses arguments using native Node.js utilities and boots the web server.
- **`server.js`**: Manages static asset delivery, exposes the `/api/logs` directory scanner, and handles connection-specific `fs.watch` file-tailing via SSE.
- **`public/`**: Contains the client-side single-page dashboard (`index.html`, `app.js`, `style.css`) responsible for rendering telemetry timelines.

---

## License

MIT
