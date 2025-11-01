import React, { useState } from "react";
import { INTERVALS } from "../../constants";
import { createSelectStyle, createContainerStyle } from "../../utils";
import "../../styles/styles.css";

const PlaybackTimeframeDropdown = ({ timeframe = "3m", onTimeframeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerStyle = createContainerStyle({ position: "relative" });
  const selectStyle = createSelectStyle("80px");

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value) => {
    if (onTimeframeChange) {
      onTimeframeChange(value);
    }
    setIsOpen(false);
  };

  return (
    <div style={containerStyle} className="playback-timeframe-dropdown-container">
      <button
        onClick={handleToggle}
        style={{
          ...selectStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="playback-timeframe-button"
      >
        <span>{timeframe}</span>
        <span className="playback-timeframe-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="playback-timeframe-dropdown">
          {INTERVALS.map((interval) => (
            <div
              key={interval.value}
              onClick={() => handleSelect(interval.value)}
              className={`playback-timeframe-option ${
                timeframe === interval.value ? "selected" : ""
              }`}
            >
              {interval.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaybackTimeframeDropdown;

