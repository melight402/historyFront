import { useEffect, useCallback } from "react";

export const useVolumeScaleSync = (chart, volumeSeries, volumeDataRef, volumeAreaHeight) => {
  const updateVolumeScale = useCallback(() => {
    if (!chart.current || !volumeDataRef.current.length) return;
    
    const volumeTop = 1 - volumeAreaHeight;
    
    if (volumeSeries.current) {
      volumeSeries.current.applyOptions({
        scaleMargins: {
          top: volumeTop,
          bottom: 0,
        },
      });
    }
    
    const leftPriceScale = chart.current.priceScale("left");
    if (leftPriceScale) {
      leftPriceScale.applyOptions({
        visible: false,
        scaleMargins: {
          top: volumeTop,
          bottom: 0,
        },
        autoScale: true,
        entireTextOnly: false,
      });
    }
    
    const rightPriceScale = chart.current.priceScale("right");
    if (rightPriceScale) {
      rightPriceScale.applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: volumeAreaHeight,
        },
      });
    }
  }, [chart, volumeSeries, volumeDataRef, volumeAreaHeight]);

  useEffect(() => {
    const chartInstance = chart.current;
    if (!chartInstance) return;

    const timeScale = chartInstance.timeScale();
    const timeRangeChangeHandler = () => {
      requestAnimationFrame(() => {
        updateVolumeScale();
      });
    };
    timeScale.subscribeVisibleTimeRangeChange(timeRangeChangeHandler);

    setTimeout(() => {
      updateVolumeScale();
    }, 200);

    return () => {
      if (chartInstance && timeRangeChangeHandler) {
        const timeScale = chartInstance.timeScale();
        timeScale.unsubscribeVisibleTimeRangeChange(timeRangeChangeHandler);
      }
    };
  }, [chart, updateVolumeScale]);

  return { updateVolumeScale };
};

