import React, { useState, useEffect } from "react";
import { createContainerStyle } from "../../utils";
import "../../styles/styles.css";

const PlaybackSpeedSlider = ({ speed = 1, onSpeedChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerStyle = createContainerStyle();

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("touchend", handleGlobalMouseUp);
      return () => {
        window.removeEventListener("mouseup", handleGlobalMouseUp);
        window.removeEventListener("touchend", handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  const handleChange = (e) => {
    const newSpeed = parseInt(e.target.value, 10);
    if (onSpeedChange) {
      onSpeedChange(newSpeed);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const speedLabel = `${speed}x`;

  return (
    <div style={containerStyle} className="playback-speed-slider-container">
      <div className="playback-speed-slider-wrapper">
        {isDragging && (
          <div className="playback-speed-popup">{speedLabel}</div>
        )}
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={speed}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="playback-speed-slider"
        />
      </div>
    </div>
  );
};

export default PlaybackSpeedSlider;

