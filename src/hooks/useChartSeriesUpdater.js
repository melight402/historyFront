import { useCallback } from "react";
import { loadChartState } from "../services/localStorageUtils";

export const useChartSeriesUpdater = (chart, candlestickSeries, volumeSeries, volumeDataRef, lastCandleTimeRef, volumeAreaHeight, currentSymbolRef, currentIntervalRef) => {
  const updateSeriesData = useCallback((candlestickData, volumeData, priceFormat) => {
    if (!chart.current || !candlestickSeries.current || !volumeSeries.current) {
      return false;
    }

    try {
      const volumeTop = 1 - volumeAreaHeight;
      
      const savedState = currentSymbolRef?.current && currentIntervalRef?.current 
        ? loadChartState(currentSymbolRef.current, currentIntervalRef.current)
        : null;
      
      const shouldAutoScale = !savedState || !savedState.priceScale || savedState.priceScale.autoScale !== false;
      
      chart.current.applyOptions({
        rightPriceScale: {
          autoScale: shouldAutoScale,
          scaleMargins: {
            top: 0.1,
            bottom: volumeAreaHeight,
          },
        },
        leftPriceScale: {
          visible: false,
          scaleMargins: {
            top: volumeTop,
            bottom: 0,
          },
          autoScale: true,
        },
      });
      
      volumeSeries.current.applyOptions({
        scaleMargins: {
          top: volumeTop,
          bottom: 0,
        },
      });
      
      const leftPriceScale = chart.current.priceScale("left");
      if (leftPriceScale) {
        leftPriceScale.applyOptions({
          scaleMargins: {
            top: volumeTop,
            bottom: 0,
          },
          autoScale: true,
        });
      }

      if (priceFormat && typeof priceFormat.precision === 'number' && typeof priceFormat.minMove === 'number') {
        candlestickSeries.current.applyOptions({
          priceFormat: {
            type: "price",
            precision: Math.max(0, Math.min(8, priceFormat.precision)),
            minMove: Math.max(0.0000001, Math.min(1, priceFormat.minMove)),
          },
        });
      }

      if (candlestickData.length > 0 && candlestickData.every(d => 
        d && typeof d.time === 'number' && isFinite(d.time) &&
        typeof d.open === 'number' && isFinite(d.open) &&
        typeof d.high === 'number' && isFinite(d.high) &&
        typeof d.low === 'number' && isFinite(d.low) &&
        typeof d.close === 'number' && isFinite(d.close)
      )) {
        candlestickSeries.current.setData(candlestickData);
      } else {
        return false;
      }

      if (volumeData.length > 0 && volumeData.every(d => 
        d && typeof d.time === 'number' && isFinite(d.time) &&
        typeof d.value === 'number' && isFinite(d.value)
      )) {
        volumeSeries.current.setData(volumeData);
      } else {
        return false;
      }

      volumeDataRef.current = volumeData;

      if (candlestickData.length > 0) {
        lastCandleTimeRef.current = candlestickData[candlestickData.length - 1].time;
      }

      return true;
    } catch (error) {
      console.error("Error setting chart data:", error);
      return false;
    }
  }, [chart, candlestickSeries, volumeSeries, volumeDataRef, lastCandleTimeRef, volumeAreaHeight, currentSymbolRef, currentIntervalRef]);

  return { updateSeriesData };
};

