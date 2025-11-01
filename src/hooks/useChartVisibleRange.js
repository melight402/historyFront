import { useCallback } from "react";

export const useChartVisibleRange = (chart) => {
  const getVisibleRanges = useCallback(() => {
    try {
      const timeScale = chart.current?.timeScale();
      if (timeScale) {
        return {
          visibleRange: timeScale.getVisibleRange(),
          visibleLogicalRange: timeScale.getVisibleLogicalRange(),
        };
      }
    } catch {
      void 0;
    }
    return { visibleRange: null, visibleLogicalRange: null };
  }, [chart]);

  const restoreVisibleRanges = useCallback((visibleRange, visibleLogicalRange) => {
    requestAnimationFrame(() => {
      try {
        const timeScale = chart.current?.timeScale();
        if (timeScale && visibleLogicalRange && visibleLogicalRange.from != null && visibleLogicalRange.to != null) {
          timeScale.setVisibleLogicalRange(visibleLogicalRange);
        } else if (timeScale && visibleRange && visibleRange.from != null && visibleRange.to != null) {
          timeScale.setVisibleRange(visibleRange);
        }
      } catch {
        void 0;
      }
    });
  }, [chart]);

  return { getVisibleRanges, restoreVisibleRanges };
};

