import { useEffect, useRef } from "react";

export const usePlaybackControl = (
  isPlaying,
  playbackSpeed,
  playbackQueueRef,
  addCandle,
  loadNextCandles,
  lastCandleTimeRef,
  onDateTimeUpdate,
  lastLoadedTimeRef
) => {
  const playbackIntervalRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      
      const updateLastCandleTime = () => {
        if (lastCandleTimeRef.current && onDateTimeUpdate) {
          const lastCandleDate = new Date(lastCandleTimeRef.current * 1000);
          if (!isNaN(lastCandleDate.getTime())) {
            onDateTimeUpdate(lastCandleDate);
          }
        }
      };
      
      setTimeout(updateLastCandleTime, 150);
      
      playbackQueueRef.current = [];
      return;
    }

    if (!lastCandleTimeRef.current) {
      return;
    }

    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }

    if (!lastLoadedTimeRef.current) {
      playbackQueueRef.current = [];
    }
    
    const intervalMs = 1000 / playbackSpeed;
    
    playbackIntervalRef.current = setInterval(() => {
      if (playbackQueueRef.current.length > 0) {
        const candle = playbackQueueRef.current.shift();
        addCandle(candle);
      } else {
        loadNextCandles();
      }
    }, intervalMs);

    if (playbackQueueRef.current.length === 0) {
      loadNextCandles();
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, addCandle, loadNextCandles, lastCandleTimeRef, onDateTimeUpdate, playbackQueueRef, lastLoadedTimeRef]);

  useEffect(() => {
    if (!isPlaying) {
      playbackQueueRef.current = [];
    }
  }, [isPlaying, playbackQueueRef]);

  useEffect(() => {
    if (!isPlaying) {
      lastLoadedTimeRef.current = null;
    }
  }, [isPlaying, lastLoadedTimeRef]);

  return playbackIntervalRef;
};

