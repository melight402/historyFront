import { useEffect } from "react";

export const useChartDataSync = (
  chart,
  candlestickSeries,
  volumeSeries,
  data,
  loaded,
  symbol,
  interval,
  currentSymbolRef,
  currentIntervalRef,
  dataUpdateTimeoutRef,
  updateChartData,
  restoreLineTools,
  isPlayingRef = null,
  hasPlaybackStartedRef = null
) => {

  useEffect(() => {
    if (!loaded || !data || !data.length || !chart.current || !candlestickSeries.current || !volumeSeries.current) {
      return;
    }

    if (currentSymbolRef.current !== symbol || currentIntervalRef.current !== interval) {
      if (hasPlaybackStartedRef) {
        hasPlaybackStartedRef.current = false;
      }
      return;
    }

    if (data.length < 1) {
      return;
    }

    if (isPlayingRef && isPlayingRef.current) {
      return;
    }

    if (hasPlaybackStartedRef && hasPlaybackStartedRef.current) {
      return;
    }

    if (dataUpdateTimeoutRef.current) {
      clearTimeout(dataUpdateTimeoutRef.current);
    }

    dataUpdateTimeoutRef.current = setTimeout(() => {
      if (currentSymbolRef.current === symbol && currentIntervalRef.current === interval && 
          chart.current && candlestickSeries.current && volumeSeries.current && 
          data && data.length >= 1) {
        if ((!isPlayingRef || !isPlayingRef.current) && 
            (!hasPlaybackStartedRef || !hasPlaybackStartedRef.current)) {
          updateChartData(data);
        }
      }
      
      if ((!isPlayingRef || !isPlayingRef.current) && 
          (!hasPlaybackStartedRef || !hasPlaybackStartedRef.current)) {
        restoreLineTools(data, loaded, updateChartData);
      }
    }, 0);

    return () => {
      if (dataUpdateTimeoutRef.current) {
        clearTimeout(dataUpdateTimeoutRef.current);
      }
    };
  }, [data, loaded, updateChartData, symbol, interval, restoreLineTools, chart, candlestickSeries, volumeSeries, currentSymbolRef, currentIntervalRef, dataUpdateTimeoutRef, isPlayingRef, hasPlaybackStartedRef]);
};

