import { useRef, useCallback } from "react";
import { useChartDataProcessor } from "./useChartDataProcessor";
import { useChartScaleSetup } from "./useChartScaleSetup";
import { useChartVisibleRange } from "./useChartVisibleRange";
import { useChartSeriesUpdater } from "./useChartSeriesUpdater";

export const useChartDataUpdates = (
  chart,
  candlestickSeries,
  volumeSeries,
  volumeDataRef,
  isInitialRender,
  lastCandleTimeRef,
  currentSymbolRef,
  currentIntervalRef,
  isRestoringStateRef,
  isUpdatingDataRef,
  volumeAreaHeight
) => {
  const dataUpdateTimeoutRef = useRef(null);
  const { processChartData } = useChartDataProcessor(currentSymbolRef);
  const { setupInitialChartScale, setupPriceScaleOptions } = useChartScaleSetup(chart, candlestickSeries, currentIntervalRef, volumeAreaHeight, isRestoringStateRef);
  const { getVisibleRanges, restoreVisibleRanges } = useChartVisibleRange(chart);
  const { updateSeriesData } = useChartSeriesUpdater(chart, candlestickSeries, volumeSeries, volumeDataRef, lastCandleTimeRef, volumeAreaHeight, currentSymbolRef, currentIntervalRef);

  const updateChartData = useCallback(async (data) => {
    if (!chart.current || !candlestickSeries.current || !volumeSeries.current) {
      isUpdatingDataRef.current = false;
      return;
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      isUpdatingDataRef.current = false;
      return;
    }

    if (isUpdatingDataRef.current) {
      return;
    }

    isUpdatingDataRef.current = true;

    try {
      const { candlestickData, volumeData, priceFormat } = await processChartData(data);

      if (candlestickData.length === 0 || volumeData.length === 0) {
        isUpdatingDataRef.current = false;
        return;
      }

      const { visibleRange, visibleLogicalRange } = getVisibleRanges();

      requestAnimationFrame(() => {
        if (!chart.current || !candlestickSeries.current || !volumeSeries.current) {
          isUpdatingDataRef.current = false;
          return;
        }

        const success = updateSeriesData(candlestickData, volumeData, priceFormat);
        if (!success) {
          isUpdatingDataRef.current = false;
          return;
        }

        if (isInitialRender.current) {
          setupInitialChartScale(candlestickData, currentSymbolRef);
          
          setTimeout(() => {
            isRestoringStateRef.current = false;
            isUpdatingDataRef.current = false;
            isInitialRender.current = false;
          }, 100);
        } else {
          restoreVisibleRanges(visibleRange, visibleLogicalRange);
          isUpdatingDataRef.current = false;
        }
      });
    } catch (error) {
      console.error("Error updating chart data:", error);
      isUpdatingDataRef.current = false;
    }
  }, [chart, candlestickSeries, volumeSeries, volumeDataRef, isInitialRender, lastCandleTimeRef, currentSymbolRef, currentIntervalRef, isRestoringStateRef, isUpdatingDataRef, volumeAreaHeight, processChartData, getVisibleRanges, restoreVisibleRanges, updateSeriesData, setupInitialChartScale]);

  return { updateChartData, dataUpdateTimeoutRef };
};
