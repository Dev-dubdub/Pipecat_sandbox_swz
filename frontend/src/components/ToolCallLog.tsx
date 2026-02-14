import type { ToolCallEntry } from "../hooks/useToolCalls";

interface ToolCallLogProps {
  toolCalls: ToolCallEntry[];
  onClear?: () => void;
}

function formatArgs(args: Record<string, unknown>): string {
  try {
    return JSON.stringify(args, null, 0).slice(0, 200);
  } catch {
    return "{}";
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString();
}

export function ToolCallLog({ toolCalls, onClear }: ToolCallLogProps) {
  return (
    <div className="tool-call-log">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>Tool Calls (log only)</h3>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            disabled={toolCalls.length === 0}
          >
            Clear
          </button>
        )}
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          maxHeight: 200,
          overflowY: "auto",
        }}
      >
        {toolCalls.length === 0 ? (
          <li style={{ color: "#888" }}>
            No tool calls yet. Start a conversation and invoke tools.
          </li>
        ) : (
          toolCalls.map((entry) => (
            <li
              key={entry.id}
              style={{
                padding: "4px 0",
                borderBottom: "1px solid #eee",
                fontFamily: "monospace",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#666" }}>
                [{formatTime(entry.timestamp)}]
              </span>{" "}
              <strong>{entry.name}</strong>({formatArgs(entry.args)})
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
