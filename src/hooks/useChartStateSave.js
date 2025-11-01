import { useEffect } from "react";

export const useChartStateSave = (chart, saveChartStateDebounced) => {
  useEffect(() => {
    if (!chart.current || !saveChartStateDebounced) return;

    const timeScale = chart.current.timeScale();
    const chartStateSaveHandler = () => {
      saveChartStateDebounced();
    };
    timeScale.subscribeVisibleTimeRangeChange(chartStateSaveHandler);

    return () => {
      if (chart.current && chartStateSaveHandler) {
        const timeScale = chart.current.timeScale();
        timeScale.unsubscribeVisibleTimeRangeChange(chartStateSaveHandler);
      }
    };
  }, [chart, saveChartStateDebounced]);
};

