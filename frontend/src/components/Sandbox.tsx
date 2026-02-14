import { useCallback, useMemo, useRef } from "react";
import { PipecatClientProvider } from "@pipecat-ai/client-react";
import { PromptEditor } from "./PromptEditor";
import { ModeSelector } from "./ModeSelector";
import { ToolCallLog } from "./ToolCallLog";
import { VoiceSession } from "./VoiceSession";
import { useSandboxState } from "../hooks/useSandboxState";
import { useToolCalls } from "../hooks/useToolCalls";
import { createPipecatClient } from "../lib/pipecatClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7860";

export function Sandbox() {
  const state = useSandboxState();
  const { toolCalls, addToolCall, clearToolCalls } = useToolCalls();
  const onToolCallRef = useRef(addToolCall);
  onToolCallRef.current = addToolCall;

  const client = useMemo(() => createPipecatClient(onToolCallRef), []);

  const handleConnect = useCallback(async () => {
    clearToolCalls();
    await client.startBotAndConnect({
      endpoint: `${API_URL}/api/start`,
      requestData: {
        system_prompt: state.systemPrompt,
        activity_prompt: state.activityPrompt,
        mode: state.mode,
        stt_provider: state.sttProvider,
        llm_provider: state.llmProvider,
        tts_provider: state.ttsProvider,
        s2s_provider: state.s2sProvider,
      },
    });
  }, [client, state, clearToolCalls]);

  const handleDisconnect = useCallback(async () => {
    await client.disconnect();
  }, [client]);

  return (
    <PipecatClientProvider client={client}>
      <div className="sandbox">
        <h1>Pipecat PM Sandbox</h1>
        <div className="sandbox-grid">
          <section>
            <PromptEditor
              systemPrompt={state.systemPrompt}
              activityPrompt={state.activityPrompt}
              setSystemPrompt={state.setSystemPrompt}
              setActivityPrompt={state.setActivityPrompt}
            />
          </section>
          <section>
            <ModeSelector
              mode={state.mode}
              sttProvider={state.sttProvider}
              llmProvider={state.llmProvider}
              ttsProvider={state.ttsProvider}
              s2sProvider={state.s2sProvider}
              setMode={state.setMode}
              setSttProvider={state.setSttProvider}
              setLlmProvider={state.setLlmProvider}
              setTtsProvider={state.setTtsProvider}
              setS2sProvider={state.setS2sProvider}
            />
          </section>
          <section>
            <VoiceSession
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          </section>
          <section>
            <ToolCallLog toolCalls={toolCalls} onClear={clearToolCalls} />
          </section>
        </div>
      </div>
    </PipecatClientProvider>
  );
}
