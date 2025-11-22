import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ChartSection from "./components/chart/ChartSection";
import DrawingToolsSelector from "./components/controls/DrawingToolsSelector";
import DeleteTools from "./components/controls/DeleteTools";
import ExportPositionData from "./components/chart/ExportPositionData";
import ClosePositionButton from "./components/chart/ClosePositionButton";
import RiskInput from "./components/controls/RiskInput";
import ProfitLossSelector from "./components/controls/ProfitLossSelector";
import TradeNoteInput from "./components/controls/TradeNoteInput";
import SymbolsSidebar from "./components/sidebar/SymbolsSidebar";
import PlaybackSpeedSlider from "./components/controls/PlaybackSpeedSlider";
import PlaybackToggle from "./components/controls/PlaybackToggle";
import PlaybackTimeframeDropdown from "./components/controls/PlaybackTimeframeDropdown";
import TVXSelector from "./components/controls/TVXSelector";
import DateTimePicker from "./components/controls/DateTimePicker";
import SidebarToggle from "./components/controls/SidebarToggle";
import SymbolDisplay from "./components/controls/SymbolDisplay";
import { ChartDataProvider } from "./contexts/ChartDataContext";
import { useDeleteKeyHandler } from "./hooks/useDeleteKeyHandler";
import { useChartDeleteToolsHandlers } from "./hooks/useChartDeleteToolsHandlers";
import { useChartLineToolRiskSync } from "./hooks/useChartLineToolRiskSync";
import { useChartLineToolSymbolSync } from "./hooks/useChartLineToolSymbolSync";
import {
  loadSelectedSymbol,
  saveSelectedSymbol,
  loadRisk,
  saveRisk,
  loadTVXValue,
  saveTVXValue,
  loadSelectedDateTime,
  saveSelectedDateTime,
  loadSidebarOpen,
  saveSidebarOpen,
  loadPlaybackSpeed,
  savePlaybackSpeed,
  loadPlaybackTimeframe,
  savePlaybackTimeframe,
} from "./services/localStorageUtils";
import "./styles/styles.css";
import { BINANCE_FUTURES_STEP_SIZES } from "./constants/binanceStepSizes";

if (typeof window !== 'undefined') {
  window.__BINANCE_STEP_SIZES = BINANCE_FUTURES_STEP_SIZES;
}

const App = () => {
  const [symbol, setSymbol] = useState(() => loadSelectedSymbol("BTCUSDT"));
  const [drawingTool, setDrawingTool] = useState(null);
  const [risk, setRisk] = useState(() => loadRisk(1));
  const [tvxValue, setTVXValue] = useState(() => loadTVXValue("level_breakout"));
  const [profitLoss, setProfitLoss] = useState("profit");
  const [tradeNote, setTradeNote] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__CURRENT_RISK = risk;
    }
  }, [risk]);

  const chart5mRef = useRef(null);
  useChartLineToolSymbolSync(chart5mRef, symbol);

  const handleChart5mReady = useCallback((chart) => {
    chart5mRef.current = chart;
  }, []);

  const [playbackSpeed, setPlaybackSpeed] = useState(() => loadPlaybackSpeed(1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTimeframe, setPlaybackTimeframe] = useState(() => loadPlaybackTimeframe("5m"));
  const [selectedDateTime, setSelectedDateTime] = useState(() => loadSelectedDateTime());
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => loadSidebarOpen());
  
  const effectiveEndTime = selectedDateTime;

  useEffect(() => {
    saveSelectedSymbol(symbol);
  }, [symbol]);

  useEffect(() => {
    if (selectedDateTime) {
      saveSelectedDateTime(selectedDateTime);
    }
  }, [selectedDateTime]);

  useEffect(() => {
    saveSidebarOpen(isSidebarOpen);
  }, [isSidebarOpen]);

  useEffect(() => {
    savePlaybackSpeed(playbackSpeed);
  }, [playbackSpeed]);

  useEffect(() => {
    savePlaybackTimeframe(playbackTimeframe);
  }, [playbackTimeframe]);

  useEffect(() => {
    saveTVXValue(tvxValue);
  }, [tvxValue]);


  useEffect(() => {
    saveRisk(risk);
    if (typeof window !== "undefined") {
      window.__CURRENT_RISK = risk;
    }
  }, [risk]);
  useChartLineToolRiskSync(chart5mRef, risk, symbol);

  const deleteToolsHandlers = useChartDeleteToolsHandlers(chart5mRef, symbol);

  useDeleteKeyHandler(deleteToolsHandlers.onDeleteSelected);

  const topChartFirstRowLeft = useMemo(() => (
    <DateTimePicker value={selectedDateTime} onChange={setSelectedDateTime} />
  ), [selectedDateTime]);

  const topChartFirstRow = useMemo(() => (
    <>
      <TVXSelector tvxValue={tvxValue} onTVXChange={setTVXValue} />
      <DrawingToolsSelector drawingTool={drawingTool} onDrawingToolChange={setDrawingTool} />
      <SidebarToggle isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
    </>
  ), [drawingTool, isSidebarOpen, tvxValue]);

  const topChartFirstRowCenter = useMemo(() => (
    <>
      <PlaybackSpeedSlider speed={playbackSpeed} onSpeedChange={setPlaybackSpeed} />
      <PlaybackToggle isPlaying={isPlaying} onToggle={setIsPlaying} />
      <SymbolDisplay symbol={symbol} />
      <PlaybackTimeframeDropdown timeframe={playbackTimeframe} onTimeframeChange={setPlaybackTimeframe} />
    </>
  ), [playbackSpeed, isPlaying, playbackTimeframe, symbol]);

  const topChartSecondRowLeft = useMemo(() => (
    <DeleteTools {...deleteToolsHandlers} />
  ), [deleteToolsHandlers]);

  const topChartSecondRowRight = useMemo(() => (
    <>
      <RiskInput risk={risk} onRiskChange={setRisk} />
      <ProfitLossSelector value={profitLoss} onChange={setProfitLoss} />
      <TradeNoteInput value={tradeNote} onChange={setTradeNote} />
      <ClosePositionButton
        symbol={symbol}
        profitLoss={profitLoss}
        selectedDateTime={selectedDateTime}
        chartRef={chart5mRef}
        tradeNote={tradeNote}
      />
      <ExportPositionData
        chart5mRef={chart5mRef}
        symbol={symbol}
        risk={risk}
        selectedDateTime={selectedDateTime}
        tvxValue={tvxValue}
      />
    </>
  ), [symbol, risk, profitLoss, selectedDateTime, tvxValue, tradeNote]);

  return (
    <ChartDataProvider>
      <div className="app-container">
        <div className="app-main-content">
          <div className="app-top-section">
            <ChartSection 
              symbol={symbol} 
              initialInterval={playbackTimeframe}
              interval={playbackTimeframe}
              onIntervalChange={setPlaybackTimeframe}
              drawingTool={drawingTool} 
              onChartReady={handleChart5mReady}
              onDrawingToolDeactivate={() => setDrawingTool(null)}
              volumeAreaHeight={0.14}
              limit={1500}
              endTime={effectiveEndTime}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onDateTimeUpdate={setSelectedDateTime}
              firstRowLeft={topChartFirstRowLeft}
              firstRowContent={topChartFirstRow}
              firstRowCenter={topChartFirstRowCenter}
              secondRowLeft={topChartSecondRowLeft}
              secondRowRight={topChartSecondRowRight}
              chartKey="chart5m"
            />
          </div>
        </div>

        {isSidebarOpen && (
          <SymbolsSidebar 
            selectedSymbol={symbol}
            onSymbolSelect={setSymbol}
          />
        )}
      </div>
    </ChartDataProvider>
  );
};

export default App;