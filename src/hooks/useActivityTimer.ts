import { useState, useEffect, useRef, useCallback } from 'react';

const useActivityTimer = (timeLimit: number | null) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit ?? 0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (timeLimit != null) {
      setTimeLeft(timeLimit);
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }, 200);
    } else {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeLimit]);

  const getStars = useCallback((wasCorrect: boolean): number => {
    if (!wasCorrect) return 0;
    if (timeLimit != null) {
      const used = timeLimit - timeLeft;
      const ratio = used / timeLimit;
      if (ratio < 0.4) return 3;
      if (ratio < 0.75) return 2;
      return 1;
    }
    if (elapsedTime <= 30) return 2;
    if (elapsedTime <= 60) return 1;
    return 0;
  }, [timeLimit, timeLeft, elapsedTime]);

  const reset = useCallback(() => {
    if (timeLimit != null) {
      setTimeLeft(timeLimit);
    }
    setElapsedTime(0);
    startTimeRef.current = Date.now();
  }, [timeLimit]);

  return { timeLeft, elapsedTime, getStars, reset };
};

export default useActivityTimer;
