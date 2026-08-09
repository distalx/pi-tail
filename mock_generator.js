import fs from 'node:fs';
import path from 'node:path';

const LOG_FILE = 'test_log.log';

async function generate_logs() {
    console.log(`Starting mock generator... writing to ${LOG_FILE}`);

    const events = [
        { event: 'turn_start', timestamp: () => new Date().toISOString(), data: { turn_id: '123' } },
        { event: 'tool_execution_start', timestamp: () => new Date().toISOString(), data: { tool: 'bash', command: 'ls' } },
        { event: 'assistant_message', timestamp: () => new Date().toISOString(), data: { content: 'Hello, I am processing your request.' } },
    ];

    let i = 0;
    while (true) {
        const event_template = events[i % events.length];
        const log_entry = JSON.stringify({
            timestamp: event_template.timestamp(),
            event: event_template.event,
            ...event_template.data
        }) + '\n';

        fs.appendFileSync(LOG_FILE, log_entry);
        console.log(`Appended: ${event_template.event}`);

        i++;
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

generate_logs().catch(err => console.error('Generator error:', err));
