import { useEffect } from "react";

export const useChartStateSave = (chart, saveChartStateDebounced) => {
  useEffect(() => {
    const chartInstance = chart.current;
    if (!chartInstance || !saveChartStateDebounced) return;

    const timeScale = chartInstance.timeScale();
    const chartStateSaveHandler = () => {
      saveChartStateDebounced();
    };
    timeScale.subscribeVisibleTimeRangeChange(chartStateSaveHandler);

    return () => {
      if (chartInstance && chartStateSaveHandler) {
        const timeScale = chartInstance.timeScale();
        timeScale.unsubscribeVisibleTimeRangeChange(chartStateSaveHandler);
      }
    };
  }, [chart, saveChartStateDebounced]);
};

