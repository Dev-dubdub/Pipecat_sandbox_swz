import { useCallback, useState } from "react";

export interface ToolCallEntry {
  id: string;
  name: string;
  args: Record<string, unknown>;
  timestamp: string;
}

export function useToolCalls() {
  const [toolCalls, setToolCalls] = useState<ToolCallEntry[]>([]);

  const addToolCall = useCallback(
    (name: string, args: Record<string, unknown>) => {
      const entry: ToolCallEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        args,
        timestamp: new Date().toISOString(),
      };
      setToolCalls((prev) => [...prev, entry]);
    },
    []
  );

  const clearToolCalls = useCallback(() => {
    setToolCalls([]);
  }, []);

  return { toolCalls, addToolCall, clearToolCalls };
}
