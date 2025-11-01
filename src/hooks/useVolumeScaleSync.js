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
    if (!chart.current) return;

    const timeScale = chart.current.timeScale();
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
      if (chart.current && timeRangeChangeHandler) {
        const timeScale = chart.current.timeScale();
        timeScale.unsubscribeVisibleTimeRangeChange(timeRangeChangeHandler);
      }
    };
  }, [chart, updateVolumeScale]);

  return { updateVolumeScale };
};

