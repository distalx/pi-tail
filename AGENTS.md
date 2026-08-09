# pi-tail Project Context & Guidelines

## 1. Technology Stack & Versions
*   **Backend:** Node.js (ESM modules using `import`/`export`).
*   **Frontend:** Vanilla JavaScript, HTML5, CSS3.
*   **Dependencies:** Zero external npm dependencies. Rely strictly on native Node.js modules (`node:fs`, `node:path`, `node:http`, `node:util`). Do not generate package configurations for build tools like Webpack, Vite, or Babel.

## 2. Code Style & Conventions
*   **Naming:** Strictly enforce `snake_case` for all variable and function declarations across both the frontend and backend codebases.
*   **Documentation & Comments:** When documenting functions, system architecture, or logic flows, prioritize describing the exact execution mechanism. Do not use analogies. If a metaphor is absolutely necessary to convey a complex concept in a comment, you must explicitly acknowledge its limitations.
*   **Logic Flow:** Prefer early returns and guard clauses over deeply nested `if`/`else` blocks.

## 3. Directory Architecture
*   **Root Directory (`./`):** Contains all Node.js backend execution logic (e.g., `server.js`, `index.js`).
*   **Bin Directory (`./bin/`):** Contains the CLI executable (`pi-tail.js`) used for global command-line execution.
*   **Public Directory (`./public/`):** Contains all static client-side assets (`index.html`, `app.js`, `style.css`). The backend server must serve these files directly to incoming client requests.
*   **Target Data:** The target JSONL telemetry files are located in the user's active workspace at `.pi/logs/` (resolved via `process.cwd()`).

## 4. Verification Workflows
*   **Syntax Checking:** After writing or modifying any JavaScript file, execute `node --check <filename>` via the `bash` tool to verify syntax integrity before concluding your turn.
*   **Endpoint Validation:** When modifying the SSE endpoint or server initialization logic, briefly start the server using the `bash` tool and execute a `curl` request to verify the port binds correctly and the endpoint returns a `200` status before terminating the test process.

## 5. Version Control Constraints
*   **No Commits:** You are strictly forbidden from executing `git add`, `git commit`, or any other version control state-saving mechanisms. You may execute `git status` or `git diff` to inspect the working tree, but the human operator will handle all final commits.
