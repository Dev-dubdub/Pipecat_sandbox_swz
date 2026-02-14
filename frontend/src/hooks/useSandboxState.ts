import { useCallback, useState } from "react";

const STORAGE_KEYS = {
  systemPrompt: "sandbox_system_prompt",
  activityPrompt: "sandbox_activity_prompt",
  mode: "sandbox_mode",
  sttProvider: "sandbox_stt_provider",
  llmProvider: "sandbox_llm_provider",
  ttsProvider: "sandbox_tts_provider",
  s2sProvider: "sandbox_s2s_provider",
} as const;

const DEFAULT_SYSTEM_PROMPT =
  "You are a friendly voice assistant for kids. Keep responses short, clear, and age-appropriate.";
const DEFAULT_ACTIVITY_PROMPT = "";
const DEFAULT_MODE = "three_tier";

export type SandboxMode = "three_tier" | "s2s";

export interface SandboxState {
  systemPrompt: string;
  activityPrompt: string;
  mode: SandboxMode;
  sttProvider: string;
  llmProvider: string;
  ttsProvider: string;
  s2sProvider: string;
}

export interface SandboxStateActions {
  setSystemPrompt: (value: string) => void;
  setActivityPrompt: (value: string) => void;
  setMode: (value: SandboxMode) => void;
  setSttProvider: (value: string) => void;
  setLlmProvider: (value: string) => void;
  setTtsProvider: (value: string) => void;
  setS2sProvider: (value: string) => void;
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      return JSON.parse(stored) as T;
    }
  } catch {
    // ignore
  }
  return defaultValue;
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function useSandboxState(): SandboxState & SandboxStateActions {
  const [systemPrompt, setSystemPromptState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.systemPrompt, DEFAULT_SYSTEM_PROMPT)
  );
  const [activityPrompt, setActivityPromptState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.activityPrompt, DEFAULT_ACTIVITY_PROMPT)
  );
  const [mode, setModeState] = useState<SandboxMode>(() =>
    loadFromStorage(STORAGE_KEYS.mode, DEFAULT_MODE)
  );
  const [sttProvider, setSttProviderState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.sttProvider, "deepgram")
  );
  const [llmProvider, setLlmProviderState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.llmProvider, "openai")
  );
  const [ttsProvider, setTtsProviderState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.ttsProvider, "cartesia")
  );
  const [s2sProvider, setS2sProviderState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.s2sProvider, "openai_realtime")
  );

  const setSystemPrompt = useCallback((value: string) => {
    setSystemPromptState(value);
    saveToStorage(STORAGE_KEYS.systemPrompt, value);
  }, []);

  const setActivityPrompt = useCallback((value: string) => {
    setActivityPromptState(value);
    saveToStorage(STORAGE_KEYS.activityPrompt, value);
  }, []);

  const setMode = useCallback((value: SandboxMode) => {
    setModeState(value);
    saveToStorage(STORAGE_KEYS.mode, value);
  }, []);

  const setSttProvider = useCallback((value: string) => {
    setSttProviderState(value);
    saveToStorage(STORAGE_KEYS.sttProvider, value);
  }, []);

  const setLlmProvider = useCallback((value: string) => {
    setLlmProviderState(value);
    saveToStorage(STORAGE_KEYS.llmProvider, value);
  }, []);

  const setTtsProvider = useCallback((value: string) => {
    setTtsProviderState(value);
    saveToStorage(STORAGE_KEYS.ttsProvider, value);
  }, []);

  const setS2sProvider = useCallback((value: string) => {
    setS2sProviderState(value);
    saveToStorage(STORAGE_KEYS.s2sProvider, value);
  }, []);

  return {
    systemPrompt,
    activityPrompt,
    mode,
    sttProvider,
    llmProvider,
    ttsProvider,
    s2sProvider,
    setSystemPrompt,
    setActivityPrompt,
    setMode,
    setSttProvider,
    setLlmProvider,
    setTtsProvider,
    setS2sProvider,
  };
}
