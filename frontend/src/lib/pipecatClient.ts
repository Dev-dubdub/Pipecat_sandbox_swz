import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";

export type OnToolCallRef = {
  current: (name: string, args: Record<string, unknown>) => void;
};

export function createPipecatClient(
  onToolCallRef: OnToolCallRef
): PipecatClient {
  const transport = new SmallWebRTCTransport({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  const client = new PipecatClient({
    transport,
    enableMic: true,
    enableCam: false,
    callbacks: {
      onLLMFunctionCallInProgress: (data: {
        function_name?: string;
        tool_call_id: string;
        arguments?: Record<string, unknown>;
      }) => {
        if (data.function_name && onToolCallRef.current) {
          onToolCallRef.current(data.function_name, data.arguments ?? {});
        }
      },
    },
  });

  return client;
}
