import React, { useState } from "react";
import ChartControls from "../controls/ChartControls";
import { PriceChart } from "./PriceChart";
import "../../styles/styles.css";

const ChartSection = ({ symbol, initialInterval = "1h", interval: externalInterval = null, onIntervalChange = null, drawingTool = null, onChartReady = null, onDrawingToolDeactivate = null, firstRowLeft = null, firstRowContent = null, firstRowCenter = null, secondRowLeft = null, secondRowCenter = null, secondRowRight = null, volumeAreaHeight = 0.07, limit = 500, chartKey = "chart1h", endTime = null, isPlaying = false, playbackSpeed = 1, onDateTimeUpdate = null }) => {
  const [internalInterval, setInternalInterval] = useState(initialInterval);
  const interval = externalInterval !== null ? externalInterval : internalInterval;
  const setInterval = onIntervalChange || setInternalInterval;
  const containerRef = React.useRef(null);
  const controlsRef = React.useRef(null);
  const [chartHeight, setChartHeight] = React.useState(400);

  React.useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current && controlsRef.current) {
        const controlsHeight = controlsRef.current.offsetHeight || 50;
        const marginBottom = 0;
        const availableHeight = containerRef.current.clientHeight - controlsHeight - marginBottom;
        setChartHeight(Math.max(200, availableHeight));
      }
    };

    const timeoutId = setTimeout(updateHeight, 0);
    
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    const controlsObserver = new ResizeObserver(updateHeight);
    const controlsElement = controlsRef.current;
    if (controlsElement) {
      controlsObserver.observe(controlsElement);
    }
    
    window.addEventListener("resize", updateHeight);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      if (controlsElement) {
        controlsObserver.disconnect();
      }
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div ref={containerRef} className="chart-section-container">
      <div ref={controlsRef} className="chart-section-controls">
        <ChartControls
          firstRowLeft={firstRowLeft}
          firstRowContent={firstRowContent}
          firstRowCenter={firstRowCenter}
          secondRowLeft={secondRowLeft}
          secondRowCenter={secondRowCenter}
          secondRowRight={secondRowRight}
        />
      </div>
      <div className="chart-section-chart-wrapper">
        <PriceChart symbol={symbol} interval={interval} height={chartHeight} drawingTool={drawingTool} onChartReady={onChartReady} onDrawingToolDeactivate={onDrawingToolDeactivate} volumeAreaHeight={volumeAreaHeight} limit={limit} chartKey={chartKey} endTime={endTime} isPlaying={isPlaying} playbackSpeed={playbackSpeed} onDateTimeUpdate={onDateTimeUpdate} />
      </div>
    </div>
  );
};

export default ChartSection;

