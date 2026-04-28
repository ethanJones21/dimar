"use client";

import { useEffect } from "react";
import { Mic, Loader2, X } from "lucide-react";
import type { VoiceState } from "@/hooks/useVoiceSearch";

interface Props {
  state: VoiceState;
  onCancel: () => void;
}

export function VoiceSearchModal({ state, onCancel }: Props) {
  const open = state !== "idle";

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const isListening = state === "listening" || state === "preparing";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-5 min-w-[260px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <X size={16} />
        </button>

        {isListening ? (
          <div className="relative flex items-center justify-center w-20 h-20">
            <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/30 animate-ping" />
            <span className="absolute inset-2 rounded-full bg-red-50 dark:bg-red-900/20" />
            <Mic
              size={36}
              className={`relative text-red-500 transition-opacity ${state === "preparing" ? "opacity-50" : "opacity-100"}`}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-20 h-20">
            <Loader2 size={40} className="text-primary animate-spin" />
          </div>
        )}

        <p className="text-base font-medium text-zinc-700 dark:text-zinc-300 tracking-wide">
          {state === "processing"
            ? "Transcribiendo..."
            : state === "preparing"
              ? "Preparando..."
              : "Escuchando..."}
        </p>

        {isListening && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 -mt-2">
            Habla ahora, para automáticamente al terminar
          </p>
        )}
      </div>
    </div>
  );
}
