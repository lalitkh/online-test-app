import { useEffect, useRef } from 'react';

interface UseTimerOptions {
  isRunning: boolean;
  timeLeft: number;
  onTick: () => void;
  onTimeUp: () => void;
}

export function useTimer({ isRunning, timeLeft, onTick, onTimeUp }: UseTimerOptions) {
  const onTickRef = useRef(onTick);
  const onTimeUpRef = useRef(onTimeUp);
  const timeLeftRef = useRef(timeLeft);

  // Keep refs in sync without re-creating the interval
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      if (timeLeftRef.current <= 1) {
        onTimeUpRef.current();
        clearInterval(timer);
        return;
      }
      onTickRef.current();
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
