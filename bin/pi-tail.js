#!/usr/bin/env node

import { parseArgs } from "node:util";
import { start_server } from "../server.js";

const { values } = parseArgs({
    options: {
        port: {
            type: "string",
            short: "p",
            default: "3000",
        },
    },
    strict: false,
});

const port = parseInt(values.port, 10);

if (isNaN(port)) {
    console.error(
        `\x1b[31m[pi-tail] Error: Invalid port number provided.\x1b[0m`,
    );
    process.exit(1);
}

// Start ONLY the web server
start_server({ port });
