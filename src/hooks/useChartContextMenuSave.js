import { useCallback } from "react";
import { persistLineToolsFromChart } from "../services/lineToolsManager";
import { saveChartState } from "../services/chartStateStorage";

const extractRangeState = (chartInstance, candlestickSeries) => {
  const state = {};
  const timeScale = chartInstance.timeScale();
  if (timeScale) {
    const logicalRange = timeScale.getVisibleLogicalRange();
    const timeRange = timeScale.getVisibleRange();
    if (
      logicalRange &&
      typeof logicalRange.from === "number" &&
      typeof logicalRange.to === "number" &&
      !Number.isNaN(logicalRange.from) &&
      !Number.isNaN(logicalRange.to)
    ) {
      state.logicalRange = logicalRange;
    }
    if (timeRange && timeRange.from != null && timeRange.to != null) {
      state.timeRange = timeRange;
    }
  }

  const priceScale = chartInstance.priceScale("right");
  if (!priceScale || !candlestickSeries.current) {
    return state;
  }

  try {
    const priceScaleOptions = priceScale.options();
    state.priceScale = {
      autoScale: priceScaleOptions?.autoScale ?? true,
      scaleMargins: priceScaleOptions?.scaleMargins,
    };
  } catch {
    return state;
  }

  try {
    const visibleRange = priceScale.getVisibleRange();
    if (visibleRange && visibleRange.minValue !== null && visibleRange.maxValue !== null) {
      state.priceRange = {
        from: visibleRange.minValue,
        to: visibleRange.maxValue,
      };
    }
  } catch {
    void 0;
  }

  return state;
};

export const useChartContextMenuSave = (chart, candlestickSeries, currentSymbolRef, currentIntervalRef) => {
  const handleContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      const chartInstance = chart.current;
      const currentSymbol = currentSymbolRef.current;
      const currentInterval = currentIntervalRef.current;
      if (!chartInstance || !currentSymbol || !currentInterval) {
        return;
      }

      persistLineToolsFromChart(chartInstance, currentSymbol);

      try {
        const state = extractRangeState(chartInstance, candlestickSeries);
        if (state.logicalRange || state.timeRange || state.priceScale || state.priceRange) {
          saveChartState(currentSymbol, currentInterval, state);
        }
      } catch {
        void 0;
      }
    },
    [chart, candlestickSeries, currentSymbolRef, currentIntervalRef]
  );

  return { handleContextMenu };
};

