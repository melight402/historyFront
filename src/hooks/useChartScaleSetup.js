import { useCallback } from "react";
import { setHorizontalScale, addRightPadding } from "../utils/chartHelpers";
import { loadChartState } from "../services/localStorageUtils";

export const useChartScaleSetup = (chart, candlestickSeries, currentIntervalRef, volumeAreaHeight, isRestoringStateRef) => {
  const setupInitialChartScale = useCallback((candlestickData, currentSymbolRef) => {
    if (!chart.current || !candlestickSeries.current) return;

    const timeScale = chart.current?.timeScale();
    const priceScale = chart.current?.priceScale('right');
    
    if (timeScale) {
      const savedState = loadChartState(currentSymbolRef.current, currentIntervalRef.current);
      
      requestAnimationFrame(() => {
        if (!chart.current || !timeScale) {
          return;
        }

        let hasSavedState = false;
        try {
          if (savedState) {
            isRestoringStateRef.current = true;
            
            if (savedState.logicalRange && savedState.logicalRange.from != null && savedState.logicalRange.to != null) {
            timeScale.setVisibleLogicalRange(savedState.logicalRange);
            hasSavedState = true;
            } else if (savedState.timeRange && savedState.timeRange.from != null && savedState.timeRange.to != null) {
            timeScale.setVisibleRange(savedState.timeRange);
            hasSavedState = true;
            }
            
            if (priceScale && savedState.priceScale) {
              const options = {};
              if (savedState.priceScale.autoScale !== undefined) {
                options.autoScale = savedState.priceScale.autoScale;
              }
              if (savedState.priceScale.scaleMargins) {
                options.scaleMargins = savedState.priceScale.scaleMargins;
              }
              
              if (Object.keys(options).length > 0) {
                priceScale.applyOptions(options);
              }
              
              if (!savedState.priceScale.autoScale && savedState.priceRange && 
                  savedState.priceRange.from !== null && savedState.priceRange.to !== null) {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    try {
                      if (chart.current && priceScale) {
                        priceScale.applyOptions({
                          autoScale: false,
                          scaleMargins: savedState.priceScale.scaleMargins || {
                            top: 0.1,
                            bottom: volumeAreaHeight
                          }
                        });
                        
                        requestAnimationFrame(() => {
                          if (chart.current && priceScale) {
                            try {
                              priceScale.setVisibleRange({
                                minValue: Math.min(savedState.priceRange.from, savedState.priceRange.to),
                                maxValue: Math.max(savedState.priceRange.from, savedState.priceRange.to)
                              });
                            } catch {
                              void 0;
                            }
                          }
                        });
                      }
                    } catch {
                      void 0;
                    }
                  });
                });
              } else if (!savedState.priceScale.autoScale) {
                requestAnimationFrame(() => {
                  try {
                    if (chart.current && priceScale) {
                      priceScale.applyOptions({
                        autoScale: false,
                        scaleMargins: savedState.priceScale.scaleMargins || {
                          top: 0.1,
                          bottom: volumeAreaHeight
                        }
                      });
                    }
                  } catch {
                    void 0;
                  }
                });
              }
            }
            
            if (!hasSavedState) {
              const candleCount = currentIntervalRef.current === '5m' ? 120 : 50;
              setHorizontalScale(chart.current, candleCount, candlestickData);
            }
          } else {
            const candleCount = currentIntervalRef.current === '5m' ? 120 : 50;
            setHorizontalScale(chart.current, candleCount, candlestickData);
            hasSavedState = false;
          }
        } catch {
          const candleCount = currentIntervalRef.current === '5m' ? 120 : 50;
          setHorizontalScale(chart.current, candleCount, candlestickData);
          hasSavedState = false;
          void 0;
        }

        requestAnimationFrame(() => {
          try {
            if (chart.current) {
              const rightPriceScale = chart.current.priceScale("right");
              if (rightPriceScale && (!savedState || !savedState.priceScale || savedState.priceScale.autoScale !== false)) {
                rightPriceScale.applyOptions({
                  autoScale: false,
                });
              }
              
              if (!hasSavedState) {
                requestAnimationFrame(() => {
                  addRightPadding(chart.current, candlestickSeries.current, 100);
                });
              }
              
              if (!hasSavedState && chart.current) {
                isRestoringStateRef.current = false;
              }
            }
          } catch {
            void 0;
            if (chart.current) {
              isRestoringStateRef.current = false;
            }
          }
        });
      });
    }
  }, [chart, candlestickSeries, currentIntervalRef, volumeAreaHeight, isRestoringStateRef]);

  const setupPriceScaleOptions = useCallback(() => {
    if (!chart.current) return;

    const volumeTop = 1 - volumeAreaHeight;

    chart.current.applyOptions({
      rightPriceScale: {
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: volumeAreaHeight,
        },
      },
      leftPriceScale: {
        visible: false,
        scaleMargins: {
          top: volumeTop,
          bottom: 0,
        },
        autoScale: true,
      },
    });

    const leftPriceScale = chart.current.priceScale("left");
    if (leftPriceScale) {
      leftPriceScale.applyOptions({
        scaleMargins: {
          top: volumeTop,
          bottom: 0,
        },
        autoScale: true,
      });
    }
  }, [chart, volumeAreaHeight]);

  return { setupInitialChartScale, setupPriceScaleOptions };
};

