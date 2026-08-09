# ACTIVE_TASK: Phase 8 - Layer 2 Data Parsing Refactor

## Objective

Refactor the DOM construction logic in `public/app.js` to eliminate hardcoded payload parsing. Layer 2 (Raw Telemetry) must render the complete `data` object as a unified, recursive, and interactive tree structure, ensuring consistent visual behavior across all event types.

## Target File

- `public/app.js`

## Execution Steps

**1. Remove Deprecated Logic**

- Delete the `is_large_payload` function and its internal `large_keys` array entirely.

**2. Rewrite the Recursive Renderer (`render_data`)**

- Modify `render_data(data)` to act as a pure recursive traverser.
- The function must iterate through `Object.entries(data)`.
- **Condition A (Objects/Arrays):** If the value is an object or array (and not null), construct a `<details>` element.
    - Set the `<summary>` text to the current key.
    - Create a `.details-body` container.
    - Recursively execute `render_data(value)` and append the resulting nodes into the `.details-body`.
- **Condition B (Primitives):** If the value is a primitive (string, number, boolean, or null), construct a standard `div` row displaying the key and value.

**3. Update Event Block Assembly**

- In `create_event_block`, ensure the Layer 2 construction directly passes `data.data` to the newly refactored `render_data` function without intermediate stringification.

## Verification Protocol

Before concluding the turn, you must verify the syntax integrity of the modified file by executing the following bash command:
`node --check public/app.js`

Output the exact terminal trace into the chat context to prove verification.
