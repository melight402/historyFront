import { useCallback, useRef } from "react";
import { getIntervalMs } from "../utils/intervalHelpers";

export const usePlaybackDataLoader = (symbol, interval, lastCandleTimeRef) => {
  const isLoadingRef = useRef(false);
  const lastLoadedTimeRef = useRef(null);
  const playbackQueueRef = useRef([]);

  const loadNextCandles = useCallback(async () => {
    if (isLoadingRef.current) return;
    
    if (!lastCandleTimeRef.current) {
      return;
    }

    const intervalMs = getIntervalMs(interval);
    if (intervalMs === 0) {
      return;
    }

    const startTime = lastLoadedTimeRef.current || (lastCandleTimeRef.current * 1000);
    const startTimeMs = startTime + intervalMs;
    const endTime = Date.now();
    
    if (startTimeMs >= endTime) {
      return;
    }

    isLoadingRef.current = true;
    
    try {
      const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=1500&startTime=${startTimeMs}&endTime=${endTime}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const klineData = await response.json();
      
      if (Array.isArray(klineData) && klineData.length > 0) {
        const convertedData = klineData
          .map((kline) => {
            if (!Array.isArray(kline) || kline.length < 6) {
              return null;
            }
            const date = new Date(kline[0]);
            const open = parseFloat(kline[1]);
            const high = parseFloat(kline[2]);
            const low = parseFloat(kline[3]);
            const close = parseFloat(kline[4]);
            const volume = parseFloat(kline[5]);

            if (!(date instanceof Date) || isNaN(date.getTime())) {
              return null;
            }

            if (!isFinite(open) || isNaN(open) || open <= 0 ||
                !isFinite(high) || isNaN(high) || high <= 0 ||
                !isFinite(low) || isNaN(low) || low <= 0 ||
                !isFinite(close) || isNaN(close) || close <= 0) {
              return null;
            }

            if (high < low || !isFinite(volume) || isNaN(volume) || volume < 0) {
              return null;
            }

            return {
              time: date.getTime() / 1000,
              open: open,
              high: high,
              low: low,
              close: close,
              volume: volume,
            };
          })
          .filter(d => d !== null);

        if (convertedData.length > 0) {
          playbackQueueRef.current = [...playbackQueueRef.current, ...convertedData];
          const lastCandle = convertedData[convertedData.length - 1];
          lastLoadedTimeRef.current = lastCandle.time * 1000;
        }
      }
    } catch {
      void 0;
    } finally {
      isLoadingRef.current = false;
    }
  }, [symbol, interval, lastCandleTimeRef]);

  return { loadNextCandles, playbackQueueRef, lastLoadedTimeRef };
};

