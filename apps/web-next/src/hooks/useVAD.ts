import { useRef, useEffect, useCallback, useState } from "react";

const VOICE_THRESHOLD = 0.018;
const SILENCE_DURATION = 1200;
const MIN_DURATION = 400;
const MAX_DURATION = 25000;

interface UseVADOptions {
  onAudioReady: (blob: Blob) => void;
  onVoiceStart?: () => void;
  onSilence?: () => void;
  enabled: boolean;
}

export function useVAD({
  onAudioReady,
  onVoiceStart,
  onSilence,
  enabled,
}: UseVADOptions) {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const lastVoiceRef = useRef(0);
  const startTimeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [rmsLevel, setRmsLevel] = useState(0);
  const [micDenied, setMicDenied] = useState(false);

  const stopRecording = useCallback(() => {
    if (!recorderRef.current || !isRecordingRef.current) return;
    isRecordingRef.current = false;
    setIsRecording(false);
    recorderRef.current.stop();
    onSilence?.();
  }, [onSilence]);

  const startRecording = useCallback(() => {
    if (isRecordingRef.current || !streamRef.current) return;
    isRecordingRef.current = true;
    setIsRecording(true);
    startTimeRef.current = Date.now();
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const duration = Date.now() - startTimeRef.current;
      if (duration < MIN_DURATION) return;
      const blob = new Blob(chunksRef.current, { type: mimeType });
      onAudioReady(blob);
    };
    recorder.start(100);
    recorderRef.current = recorder;
    onVoiceStart?.();

    setTimeout(() => {
      if (isRecordingRef.current) stopRecording();
    }, MAX_DURATION);
  }, [onAudioReady, onVoiceStart, stopRecording]);

  useEffect(() => {
    if (!enabled) {
      // Clean up when disabled
      cancelAnimationFrame(rafRef.current);
      if (isRecordingRef.current) {
        isRecordingRef.current = false;
        setIsRecording(false);
        recorderRef.current?.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      return;
    }

    let cancelled = false;
    const data = new Uint8Array(256);

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        analyserRef.current = analyser;

        const tick = () => {
          if (cancelled) return;
          analyser.getByteTimeDomainData(data);
          const rms =
            Math.sqrt(
              data.reduce((sum, v) => sum + (v - 128) ** 2, 0) / data.length,
            ) / 128;

          setRmsLevel(rms);

          if (rms > VOICE_THRESHOLD) {
            lastVoiceRef.current = Date.now();
            if (!isRecordingRef.current) startRecording();
          } else if (
            isRecordingRef.current &&
            Date.now() - lastVoiceRef.current > SILENCE_DURATION
          ) {
            stopRecording();
          }

          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(() => {
        setMicDenied(true);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (isRecordingRef.current) {
        isRecordingRef.current = false;
        setIsRecording(false);
        recorderRef.current?.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    };
  }, [enabled, startRecording, stopRecording]);

  return { isRecording, rmsLevel, micDenied };
}
