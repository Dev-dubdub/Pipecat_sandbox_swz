import type { SandboxStateActions } from "../hooks/useSandboxState";

interface PromptEditorProps
  extends Pick<SandboxStateActions, "setSystemPrompt" | "setActivityPrompt"> {
  systemPrompt: string;
  activityPrompt: string;
}

export function PromptEditor({
  systemPrompt,
  activityPrompt,
  setSystemPrompt,
  setActivityPrompt,
}: PromptEditorProps) {
  return (
    <div className="prompt-editor">
      <h3>Prompts</h3>
      <div>
        <label htmlFor="system-prompt">
          System Prompt (saved to localStorage)
        </label>
        <textarea
          id="system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={4}
          placeholder="Define bot personality and behavior..."
          style={{ width: "100%", fontFamily: "monospace" }}
        />
      </div>
      <div>
        <label htmlFor="activity-prompt">
          Activity Prompt (saved to localStorage)
        </label>
        <textarea
          id="activity-prompt"
          value={activityPrompt}
          onChange={(e) => setActivityPrompt(e.target.value)}
          rows={4}
          placeholder="Activity instructions the bot MUST follow (e.g., 'Make the kid say zipity zapity zoom after calling show_text()', 'Ask 3 questions about the picture')..."
          style={{ width: "100%", fontFamily: "monospace" }}
        />
      </div>
    </div>
  );
}
