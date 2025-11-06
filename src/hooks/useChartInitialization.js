import { useEffect } from "react";
import { useChartCreation } from "./useChartCreation";
import { useChartSeriesSetup } from "./useChartSeriesSetup";
import { useVolumeScaleSync } from "./useVolumeScaleSync";

export const useChartInitialization = (
  chartContainerRef,
  chart,
  candlestickSeries,
  volumeSeries,
  volumeDataRef,
  height,
  volumeAreaHeight,
  onChartReadyRef
) => {
  const { createChartInstance } = useChartCreation(chartContainerRef, chart, height, volumeAreaHeight);
  const { setupSeries } = useChartSeriesSetup(chart, candlestickSeries, volumeSeries, volumeAreaHeight);
  useVolumeScaleSync(chart, volumeSeries, volumeDataRef, volumeAreaHeight);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chart.current) return;

    const onChartReady = onChartReadyRef.current;
    const containerWidth = chartContainerRef.current.clientWidth;
    
    const initializeChart = (width) => {
      if (!chartContainerRef.current || chart.current) return;

      const chartInstance = createChartInstance(width);
      if (!chartInstance) return;

      chart.current = chartInstance;
      setupSeries();

      if (onChartReady) {
        onChartReady(chart.current);
      }
    };

    if (containerWidth === 0) {
      requestAnimationFrame(() => {
        if (!chartContainerRef.current || chart.current) return;
        const width = chartContainerRef.current.clientWidth;
        if (width > 0) {
          initializeChart(width);
        }
      });
    } else {
      initializeChart(containerWidth);
    }

    const handleResize = () => {
      if (chartContainerRef.current && chart.current) {
        chart.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chart.current) {
        try {
          chart.current.removeAllLineTools();
        } catch {
          void 0;
        }
        chart.current.remove();
        chart.current = null;
        candlestickSeries.current = null;
        volumeSeries.current = null;
      }
      if (onChartReady) {
        onChartReady(null);
      }
    };
  }, [volumeAreaHeight, height, chartContainerRef, chart, candlestickSeries, volumeSeries, volumeDataRef, onChartReadyRef, createChartInstance, setupSeries]);
};
