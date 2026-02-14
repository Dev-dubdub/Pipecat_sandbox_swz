import { useCallback } from "react";
import {
  PipecatClientAudio,
  usePipecatClientTransportState,
} from "@pipecat-ai/client-react";

interface VoiceSessionProps {
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export function VoiceSession({ onConnect, onDisconnect }: VoiceSessionProps) {
  const transportState = usePipecatClientTransportState();

  const handleConnect = useCallback(async () => {
    try {
      await onConnect();
    } catch (err) {
      console.error("Connection failed:", err);
    }
  }, [onConnect]);

  const handleDisconnect = useCallback(async () => {
    try {
      await onDisconnect();
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  }, [onDisconnect]);

  const isConnected =
    transportState === "ready" || transportState === "connected";
  const isConnecting =
    transportState === "connecting" || transportState === "authenticating";

  return (
    <div className="voice-session">
      <h3>Voice Session</h3>
      <PipecatClientAudio />
      <p>Status: {transportState}</p>
      <button
        type="button"
        onClick={handleConnect}
        disabled={isConnected || isConnecting}
      >
        Start Conversation
      </button>
      <button type="button" onClick={handleDisconnect} disabled={!isConnected}>
        End Conversation
      </button>
    </div>
  );
}
