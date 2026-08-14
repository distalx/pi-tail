import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Anchor PUBLIC_DIR relative to this file's location, not process.cwd()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");

function resolve_logs_dir() {
    const paths = [
        path.join(process.cwd(), ".pi", "logs"),
        path.join(process.cwd(), "..", ".pi", "logs"),
    ];

    for (const p of paths) {
        if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
            return p;
        }
    }
    return null;
}

function stream_file_contents(res, file_path, start_byte = 0) {
    const stats = fs.statSync(file_path);
    const end_byte = stats.size - 1;

    if (start_byte > end_byte) return start_byte;

    const stream = fs.createReadStream(file_path, {
        start: start_byte,
        end: end_byte,
    });

    let buffer = "";
    stream.on("data", (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep the last potentially incomplete line

        for (const line of lines) {
            if (line.trim()) {
                try {
                    const parsed = JSON.parse(line);
                    res.write(`data: ${JSON.stringify(parsed)}\n\n`);
                } catch (e) {
                    console.error("Error parsing log line:", e);
                }
            }
        }
    });

    return stats.size;
}

export function start_server(options = {}) {
    const PORT = options.port || 3000;

    const server = http.createServer((req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);

        if (url.pathname === "/api/logs") {
            const logs_dir = resolve_logs_dir();
            if (!logs_dir) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Logs directory not found" }));
                return;
            }

            try {
                const files = fs
                    .readdirSync(logs_dir)
                    .filter(
                        (f) => f.startsWith("session-") && f.endsWith(".jsonl"),
                    )
                    .map((f) => {
                        const stats = fs.statSync(path.join(logs_dir, f));
                        return {
                            name: f,
                            mtimeMs: stats.mtimeMs,
                        };
                    })
                    .sort((a, b) => b.mtimeMs - a.mtimeMs);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(files));
            } catch (e) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: e.message }));
            }
            return;
        }

        if (url.pathname === "/stream") {
            const file_name = url.searchParams.get("file");
            if (!file_name) {
                res.writeHead(400);
                res.end('Missing "file" query parameter');
                return;
            }

            const logs_dir = resolve_logs_dir();
            if (!logs_dir) {
                res.writeHead(500);
                res.end("Logs directory not found");
                return;
            }

            const file_path = path.join(logs_dir, file_name);
            if (!fs.existsSync(file_path)) {
                res.writeHead(404);
                res.end("Log file not found");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            });

            let last_size = stream_file_contents(res, file_path);

            const watcher = fs.watch(file_path, (event) => {
                if (event === "change") {
                    const current_size = fs.statSync(file_path).size;
                    if (current_size > last_size) {
                        stream_file_contents(res, file_path, last_size);
                        last_size = current_size;
                    } else if (current_size < last_size) {
                        last_size = current_size;
                    }
                }
            });

            req.on("close", () => {
                watcher.close();
            });

            return;
        }

        // Static file serving
        let filePath = path.join(
            PUBLIC_DIR,
            url.pathname === "/" ? "index.html" : url.pathname,
        );

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end("Not Found");
                return;
            }

            const ext = path.extname(filePath);
            const contentType =
                {
                    ".html": "text/html",
                    ".js": "text/javascript",
                    ".css": "text/css",
                }[ext] || "text/plain";

            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
        });
    });

    server.listen(PORT, () => {
        console.log(
            `\x1b[32m[pi-tail] Visualizer running at http://localhost:${PORT}\x1b[0m`,
        );
    });
}
