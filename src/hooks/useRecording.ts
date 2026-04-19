'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingState = 'idle' | 'recording' | 'stopping';

export function useRecording() {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0); // seconds elapsed
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      // Ask the user to share their screen (tab, window, or entire screen)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Merge chunks and trigger download
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        a.href = url;
        a.download = `nexus-connect-recording-${timestamp}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Cleanup stream tracks
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setState('idle');
        setDuration(0);
      };

      // If user stops sharing via browser's built-in stop button
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

      recorder.start(1000); // collect a chunk every second
      setState('recording');

      // Start live duration timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'NotAllowedError') {
        setError('Could not start recording. Please try again.');
      }
      setState('idle');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || state !== 'recording') return;
    setState('stopping');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current.stop();
  }, [state]);

  /** Format seconds → MM:SS */
  const formattedDuration = [
    String(Math.floor(duration / 60)).padStart(2, '0'),
    String(duration % 60).padStart(2, '0'),
  ].join(':');

  return {
    isRecording: state === 'recording',
    isStopping: state === 'stopping',
    duration: formattedDuration,
    error,
    startRecording,
    stopRecording,
  };
}
