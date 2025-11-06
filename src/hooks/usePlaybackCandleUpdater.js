import { useCallback } from "react";

export const usePlaybackCandleUpdater = (chart, candlestickSeries, volumeSeries, lastCandleTimeRef) => {
  const addCandle = useCallback((candle) => {
    if (!chart.current || !candlestickSeries.current || !volumeSeries.current) {
      return;
    }

    try {
      candlestickSeries.current.update({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      });

      volumeSeries.current.update({
        time: candle.time,
        value: candle.volume,
        color: candle.close >= candle.open ? "#26a69a80" : "#ef535080",
      });

      lastCandleTimeRef.current = candle.time;
    } catch {
      void 0;
    }
  }, [chart, candlestickSeries, volumeSeries, lastCandleTimeRef]);

  return { addCandle };
};

