import { useEffect, useRef } from 'react';

export function useGameLoop(
  callback: () => void,
  interval: number,
  enabled: boolean
) {
  const savedCallback = useRef(callback);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Update callback when it changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    function gameLoop(timestamp: number) {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      accumulatorRef.current += deltaTime;

      while (accumulatorRef.current >= interval) {
        savedCallback.current();
        accumulatorRef.current -= interval;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = 0;
      accumulatorRef.current = 0;
    };
  }, [interval, enabled]);
}
