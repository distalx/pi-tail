/**
 * Manages the in-memory reconstruction of hierarchical traces from chronological log events.
 */
export class TraceManager {
    constructor() {
        // trace_id -> { nodes: Map<span_id, Node>, roots: Array<Node> }
        this.traces = new Map();
    }

    /**
     * Clears all traces (used when switching log files).
     */
    clear() {
        this.traces.clear();
    }

    /**
     * Processes a single raw event from the JSONL stream.
     * @param {Object} data - The raw log line object
     */
    process_event(data) {
        // Only process events that are part of a trace
        if (!data.trace_id || !data.span_id) return;

        let trace = this.traces.get(data.trace_id);
        if (!trace) {
            trace = { nodes: new Map(), roots: [] };
            this.traces.set(data.trace_id, trace);
        }

        // Determine if this is a closing boundary event
        const is_end_event =
            data.event_type.endsWith("_end") ||
            data.event_type === "session_shutdown";
        // Normalize the span type name (e.g., "tool_execution_start" -> "tool_execution")
        const normalized_type = data.event_type
            .replace("_start", "")
            .replace("_end", "")
            .replace("_shutdown", "");

        let node = trace.nodes.get(data.span_id);

        if (!node) {
            // Node doesn't exist yet, create it
            node = {
                span_id: data.span_id,
                parent_span_id: data.parent_span_id,
                span_type: normalized_type,
                start_ts: data.ts,
                end_ts: null,
                payload: data.payload || {},
                children: [],
            };
            trace.nodes.set(data.span_id, node);

            // Establish parent-child relationship
            if (data.parent_span_id) {
                const parent = trace.nodes.get(data.parent_span_id);
                if (parent) {
                    parent.children.push(node);
                } else {
                    // Edge case: Child arrived before parent. Treat as temporary root.
                    trace.roots.push(node);
                }
            } else {
                trace.roots.push(node); // True root (e.g., session)
            }
        }

        // Update the node based on the event type
        if (is_end_event) {
            node.end_ts = data.ts;
            // Merge payloads to capture results, usage, and errors emitted at the end
            node.payload = { ...node.payload, ...(data.payload || {}) };
        } else if (!is_end_event && node.start_ts === data.ts) {
            // Merge payload for standalone events or the start event itself
            node.payload = { ...node.payload, ...(data.payload || {}) };
        }
    }

    /**
     * Returns an array of fully constructed trace trees.
     */
    get_traces() {
        return Array.from(this.traces.values());
    }
}
