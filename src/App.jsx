import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ChartSection from "./components/chart/ChartSection";
import DrawingToolsSelector from "./components/controls/DrawingToolsSelector";
import DeleteTools from "./components/controls/DeleteTools";
import ExportPositionData from "./components/chart/ExportPositionData";
import ClosePositionButton from "./components/chart/ClosePositionButton";
import RiskInput from "./components/controls/RiskInput";
import ProfitLossSelector from "./components/controls/ProfitLossSelector";
import SymbolsSidebar from "./components/sidebar/SymbolsSidebar";
import PlaybackSpeedSlider from "./components/controls/PlaybackSpeedSlider";
import PlaybackToggle from "./components/controls/PlaybackToggle";
import PlaybackTimeframeDropdown from "./components/controls/PlaybackTimeframeDropdown";
import DateTimePicker from "./components/controls/DateTimePicker";
import SidebarToggle from "./components/controls/SidebarToggle";
import SymbolDisplay from "./components/controls/SymbolDisplay";
import { ChartDataProvider } from "./contexts/ChartDataContext";
import {
  loadSelectedSymbol,
  saveSelectedSymbol,
  loadRisk,
  saveRisk,
  clearAllChartStates,
  loadSelectedDateTime,
  saveSelectedDateTime,
  loadSidebarOpen,
  saveSidebarOpen,
  loadPlaybackSpeed,
  savePlaybackSpeed,
  loadPlaybackTimeframe,
  savePlaybackTimeframe,
} from "./services/localStorageUtils";
import { 
  persistLineToolsFromChart, 
  removeAllLineToolsFromStorage,
  removeLineToolsFromStorage
} from "./services/lineToolsManager";
import "./styles/styles.css";
import { BINANCE_FUTURES_STEP_SIZES } from "./constants/binanceStepSizes";

if (typeof window !== 'undefined') {
  window.__BINANCE_STEP_SIZES = BINANCE_FUTURES_STEP_SIZES;
}

const App = () => {
  const [symbol, setSymbol] = useState(() => loadSelectedSymbol("BTCUSDT"));
  const [drawingTool, setDrawingTool] = useState(null);
  const [risk, setRisk] = useState(() => loadRisk(1));
  const [profitLoss, setProfitLoss] = useState("profit");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__CURRENT_RISK = risk;
    }
  }, [risk]);

  const chart5mRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__CURRENT_SYMBOL = symbol;
    }

    if (chart5mRef.current) {
      try {
        const exported = chart5mRef.current.exportLineTools();
        if (exported && exported !== '[]') {
          const tools = JSON.parse(exported);
          tools.forEach((tool) => {
            if (tool.toolType === 'LongShortPosition') {
              const updatedTool = {
                ...tool,
                options: {
                  ...tool.options,
                  symbol: symbol || '',
                  risk: parseFloat(window.__CURRENT_RISK || 0) || 0
                }
              };
              chart5mRef.current.applyLineToolOptions(updatedTool);
            }
          });
        }
      } catch {
        void 0;
      }
    }
  }, [symbol]);

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
    saveRisk(risk);
    if (typeof window !== 'undefined') {
      window.__CURRENT_RISK = risk;
    }

    if (chart5mRef.current) {
      try {
        const exported = chart5mRef.current.exportLineTools();
        if (exported && exported !== '[]') {
          const tools = JSON.parse(exported);
          tools.forEach((tool) => {
            if (tool.toolType === 'LongShortPosition') {
              const updatedTool = {
                ...tool,
                options: {
                  ...tool.options,
                  risk: parseFloat(risk) || 0,
                  symbol: symbol || window.__CURRENT_SYMBOL || ''
                }
              };
              chart5mRef.current.applyLineToolOptions(updatedTool);
            }
          });
        }
      } catch {
        void 0;
      }
    }
  }, [risk, symbol]);

  const deleteToolsHandlers = useMemo(() => ({
    onDeleteSelected: () => {
      if (chart5mRef.current) {
        try {
          chart5mRef.current.removeSelectedLineTools();
          setTimeout(() => {
            const exported = chart5mRef.current.exportLineTools();
            if (exported && exported.trim() !== '' && exported !== '[]') {
              persistLineToolsFromChart(chart5mRef.current, symbol);
            } else {
              removeLineToolsFromStorage(symbol);
            }
          }, 100);
        } catch {
          void 0;
        }
      }
    },
    onDeleteAll: () => {
      if (chart5mRef.current) {
        try {
          chart5mRef.current.removeAllLineTools();
        } catch {
          void 0;
        }
      }
      
      removeAllLineToolsFromStorage();
      clearAllChartStates();
    }
  }), [symbol]);

  const topChartFirstRowLeft = useMemo(() => (
    <DateTimePicker value={selectedDateTime} onChange={setSelectedDateTime} />
  ), [selectedDateTime]);

  const topChartFirstRow = useMemo(() => (
    <>
      <DrawingToolsSelector drawingTool={drawingTool} onDrawingToolChange={setDrawingTool} />
      <SidebarToggle isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
    </>
  ), [drawingTool, isSidebarOpen]);

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
      <ClosePositionButton
        symbol={symbol}
        profitLoss={profitLoss}
        selectedDateTime={selectedDateTime}
        chartRef={chart5mRef}
      />
      <ExportPositionData
        chart5mRef={chart5mRef}
        symbol={symbol}
        risk={risk}
        selectedDateTime={selectedDateTime}
      />
    </>
  ), [symbol, risk, profitLoss, selectedDateTime]);

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
              limit={300}
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