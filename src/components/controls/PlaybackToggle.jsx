import React from "react";
import { createButtonStyle } from "../../utils";
import "../../styles/styles.css";

const PlaybackToggle = ({ isPlaying = false, onToggle }) => {
  const buttonStyle = createButtonStyle();

  const handleClick = () => {
    if (onToggle) {
      onToggle(!isPlaying);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={buttonStyle}
      className="playback-toggle-button"
    >
      {isPlaying ? "⏸" : "▶"}
    </button>
  );
};

export default PlaybackToggle;

