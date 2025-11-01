import { useCallback } from "react";

export const useChartSeriesSetup = (chart, candlestickSeries, volumeSeries, volumeAreaHeight) => {
  const setupSeries = useCallback(() => {
    if (!chart.current) return;

    candlestickSeries.current = chart.current.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
      priceScaleId: "right",
    });

    const volumeTop = 1 - volumeAreaHeight;
    
    volumeSeries.current = chart.current.addHistogramSeries({
      color: "#26a69a80",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "left",
      scaleMargins: {
        top: volumeTop,
        bottom: 0,
      },
    });
    
    const leftPriceScale = chart.current.priceScale("left");
    leftPriceScale.applyOptions({
      visible: false,
      scaleMargins: {
        top: volumeTop,
        bottom: 0,
      },
      autoScale: true,
      entireTextOnly: false,
    });
  }, [chart, candlestickSeries, volumeSeries, volumeAreaHeight]);

  return { setupSeries };
};

