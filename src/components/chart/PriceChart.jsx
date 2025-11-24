import React, { useEffect, useRef } from "react";
import { useChartData } from "../../contexts/ChartDataContext";
import { useChartInitialization } from "../../hooks/useChartInitialization";
import { useChartPopup } from "../../hooks/useChartPopup";
import { useChartDataUpdates } from "../../hooks/useChartDataUpdates";
import { useChartLineTools } from "../../hooks/useChartLineTools";
import { useChartDataSync } from "../../hooks/useChartDataSync";
import { usePlayback } from "../../hooks/usePlayback";
import { useChartContextMenuSave } from "../../hooks/useChartContextMenuSave";
import { useSessionHighlighting } from "../../hooks/useSessionHighlighting";
import CandlePopup from "./CandlePopup";
import "../../styles/styles.css";
import "../../styles/chartSessions.css";

const PriceChart = ({ height = 900, symbol = "BTCUSDT", interval = "1h", drawingTool = null, onChartReady = null, onDrawingToolDeactivate = null, volumeAreaHeight = 0.07, limit = 500, chartKey = "chart1h", endTime = null, isPlaying = false, playbackSpeed = 1, onDateTimeUpdate = null }) => {
  const chartContainerRef = useRef();
  const chart = useRef();
  const candlestickSeries = useRef();
  const volumeSeries = useRef();
  const volumeDataRef = useRef([]);
  const isInitialRender = useRef(true);
  const lastCandleTimeRef = useRef(null);
  const currentSymbolRef = useRef(symbol);
  const currentIntervalRef = useRef(interval);
  const prevSymbolRef = useRef(symbol);
  const prevIntervalRef = useRef(interval);
  const onChartReadyRef = useRef(onChartReady);
  const drawingToolRef = useRef(drawingTool);
  const isRestoringStateRef = useRef(false);
  const isUpdatingDataRef = useRef(false);
  const { handleSessionOverlayReady } = useSessionHighlighting(chartContainerRef);
  
  const { data, loaded, error } = useChartData(chartKey, symbol, interval, limit, endTime);

  const { popupState, setPopupState } = useChartPopup(chart, candlestickSeries, loaded, drawingToolRef);

  const { updateChartData, dataUpdateTimeoutRef } = useChartDataUpdates(
    chart,
    candlestickSeries,
    volumeSeries,
    volumeDataRef,
    isInitialRender,
    lastCandleTimeRef,
    currentSymbolRef,
    currentIntervalRef,
    isRestoringStateRef,
    isUpdatingDataRef,
    volumeAreaHeight
  );

  const { restoreLineTools } = useChartLineTools(
    chart,
    candlestickSeries,
    volumeSeries,
    symbol,
    interval,
    prevSymbolRef,
    prevIntervalRef,
    currentSymbolRef,
    currentIntervalRef,
    isInitialRender,
    drawingTool,
    drawingToolRef,
    isRestoringStateRef,
    setPopupState,
    onDrawingToolDeactivate
  );

  useChartInitialization(
    chartContainerRef,
    chart,
    candlestickSeries,
    volumeSeries,
    volumeDataRef,
    height,
    volumeAreaHeight,
    onChartReadyRef
  );

  const mergedOnChartReady = React.useCallback(
    (chartInstance) => {
      handleSessionOverlayReady(chartInstance);
      if (onChartReady) {
        onChartReady(chartInstance);
      }
    },
    [handleSessionOverlayReady, onChartReady]
  );

  React.useEffect(() => {
    onChartReadyRef.current = mergedOnChartReady;
  }, [mergedOnChartReady]);

  React.useEffect(() => {
    drawingToolRef.current = drawingTool;
  }, [drawingTool]);

  useEffect(() => {
    if (chart.current && chartContainerRef.current) {
      chart.current.applyOptions({
        height: height,
      });
    }
  }, [height]);

  const isPlayingRef = useRef(isPlaying);
  const hasPlaybackStartedRef = useRef(false);

  React.useEffect(() => {
    if (symbol !== currentSymbolRef.current || interval !== currentIntervalRef.current) {
      hasPlaybackStartedRef.current = false;
    }
  }, [symbol, interval]);
  
  React.useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying) {
      hasPlaybackStartedRef.current = true;
    }
  }, [isPlaying]);

  useChartDataSync(
    chart,
    candlestickSeries,
    volumeSeries,
    data,
    loaded,
    symbol,
    interval,
    currentSymbolRef,
    currentIntervalRef,
    dataUpdateTimeoutRef,
    updateChartData,
    restoreLineTools,
    isPlayingRef,
    hasPlaybackStartedRef
  );

  usePlayback(
    chart,
    candlestickSeries,
    volumeSeries,
    isPlaying,
    playbackSpeed,
    symbol,
    interval,
    lastCandleTimeRef,
    onDateTimeUpdate
  );

  const { handleContextMenu: handleContainerContextMenu } = useChartContextMenuSave(
    chart,
    candlestickSeries,
    currentSymbolRef,
    currentIntervalRef
  );

  return (
    <div
      ref={chartContainerRef}
      onContextMenu={handleContainerContextMenu}
      className="chart-container"
      style={{
        height: height,
        minHeight: height,
      }}
    >
      {error && (
        <div className="chart-error">
          Error loading data: {error}
        </div>
      )}
      <CandlePopup popupState={popupState} />
    </div>
  );
};

export { PriceChart };
