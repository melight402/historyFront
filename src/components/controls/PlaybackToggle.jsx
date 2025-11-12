import React, { useEffect } from "react";
import { createButtonStyle } from "../../utils";
import "../../styles/styles.css";

const PlaybackToggle = ({ isPlaying = false, onToggle }) => {
  const buttonStyle = createButtonStyle();

  const handleClick = () => {
    if (onToggle) {
      onToggle(!isPlaying);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code !== "Space" && event.key !== " ") {
        return;
      }

      const target = event.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      event.preventDefault();

      if (onToggle) {
        onToggle(!isPlaying);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, onToggle]);

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

