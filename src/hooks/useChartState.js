import { useRef, useCallback } from "react";
import { saveChartState } from "../services/localStorageUtils";

export const useChartState = (chart, candlestickSeries, currentSymbolRef, currentIntervalRef, isRestoringStateRef) => {
  const saveChartStateTimeoutRef = useRef(null);

  const saveChartStateDebounced = useCallback(() => {
    if (!chart?.current || !currentSymbolRef.current || !currentIntervalRef.current || isRestoringStateRef?.current) {
      return;
    }

    if (saveChartStateTimeoutRef.current) {
      clearTimeout(saveChartStateTimeoutRef.current);
    }

    saveChartStateTimeoutRef.current = setTimeout(() => {
      try {
        if (!chart.current || !candlestickSeries?.current || isRestoringStateRef?.current) {
          return;
        }

        const timeScale = chart.current.timeScale();
        if (!timeScale) return;

        const logicalRange = timeScale.getVisibleLogicalRange();
        if (!logicalRange) {
          return;
        }

        const timeRange = timeScale.getVisibleRange();

        const state = {};
        if (logicalRange && typeof logicalRange.from === 'number' && typeof logicalRange.to === 'number' && 
            !isNaN(logicalRange.from) && !isNaN(logicalRange.to)) {
          state.logicalRange = logicalRange;
        }
        if (timeRange && timeRange.from != null && timeRange.to != null) {
          state.timeRange = timeRange;
        }

        if (state.logicalRange || state.timeRange) {
          saveChartState(currentSymbolRef.current, currentIntervalRef.current, state);
        }
      } catch {
        void 0;
      }
    }, 500);
  }, [chart, candlestickSeries, currentSymbolRef, currentIntervalRef, isRestoringStateRef]);

  return { saveChartStateDebounced };
};

