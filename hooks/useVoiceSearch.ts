"use client";

import { useState, useRef, useCallback } from "react";

// Web Speech API types (not in standard TS DOM lib)
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  0: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionErrorEvent {
  error: string;
}

export type VoiceState = "idle" | "preparing" | "listening" | "processing";

type ErrorType = "permission" | "unsupported" | "network";

export function useVoiceSearch(
  onResult: (transcript: string) => void,
  onError?: (type: ErrorType) => void,
) {
  const [state, setState] = useState<VoiceState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const startWhisperRef = useRef<() => Promise<void>>(async () => {});
  onResultRef.current = onResult;
  onErrorRef.current = onError;

  const w = typeof window !== "undefined"
    ? (window as Window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition })
    : null;

  const supported =
    w !== null &&
    (typeof w.SpeechRecognition !== "undefined" ||
      typeof w.webkitSpeechRecognition !== "undefined" ||
      typeof MediaRecorder !== "undefined");

  const startNative = useCallback(() => {
    const win = window as Window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition };
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SR) return false;

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "es-PE";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onaudiostart = () => setState("listening");

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setState("idle");
      onResultRef.current(transcript);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setState("idle");
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        onErrorRef.current?.("permission");
      } else if (e.error === "network") {
        if (typeof MediaRecorder !== "undefined") {
          startWhisperRef.current();
        } else {
          onErrorRef.current?.("network");
        }
      } else if (e.error !== "aborted" && e.error !== "no-speech") {
        onErrorRef.current?.("unsupported");
      }
    };

    recognition.onend = () => {
      setState((s) => (s === "listening" || s === "preparing" ? "idle" : s));
    };

    setState("preparing");
    recognition.start();
    return true;
  }, []);

  const startWhisper = useCallback(async () => {
    setState("preparing");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState("idle");
      onErrorRef.current?.("permission");
      return;
    }

    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    // Silence detection via Web Audio API
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    audioCtx.createMediaStreamSource(stream).connect(analyser);
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    let silenceStart: number | null = null;
    let hasSoundStarted = false;
    let animFrame: number;

    const checkSilence = () => {
      analyser.getByteFrequencyData(freqData);
      const avg = freqData.reduce((a, b) => a + b, 0) / freqData.length;

      if (avg > 12) {
        hasSoundStarted = true;
        silenceStart = null;
      } else if (hasSoundStarted) {
        if (silenceStart === null) silenceStart = Date.now();
        else if (Date.now() - silenceStart > 1200) {
          if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
          }
          return;
        }
      }
      animFrame = requestAnimationFrame(checkSilence);
    };

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      cancelAnimationFrame(animFrame);
      audioCtx.close();
      stream.getTracks().forEach((t) => t.stop());
      setState("processing");

      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob, "audio.webm");

      try {
        const res = await fetch("/api/transcribe", { method: "POST", body: formData });
        const data = (await res.json()) as { transcript?: string };
        if (data.transcript) {
          onResultRef.current(data.transcript);
        }
      } catch {
        onErrorRef.current?.("network");
      } finally {
        setState("idle");
      }
    };

    setState("listening");
    recorder.start();
    checkSilence();

    // Fallback: máximo 10s si la detección de silencio falla
    setTimeout(() => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    }, 10000);
  }, []);
  startWhisperRef.current = startWhisper;

  const start = useCallback(async () => {
    if (state !== "idle") return;

    const win = window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    const hasNative = !!(win.SpeechRecognition ?? win.webkitSpeechRecognition);

    if (hasNative) {
      startNative();
    } else if (typeof MediaRecorder !== "undefined") {
      await startWhisper();
    } else {
      onErrorRef.current?.("unsupported");
    }
  }, [state, startNative, startWhisper]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return { state, supported, start, stop };
}
