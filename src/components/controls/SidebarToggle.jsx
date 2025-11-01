import React from "react";
import { createButtonStyle } from "../../utils";
import "../../styles/styles.css";

const SidebarToggle = ({ isOpen = true, onToggle }) => {
  const buttonStyle = createButtonStyle();

  const handleClick = () => {
    if (onToggle) {
      onToggle(!isOpen);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={buttonStyle}
      className="sidebar-toggle-button"
      title={isOpen ? "Скрыть сайдбар" : "Показать сайдбар"}
    >
      {isOpen ? "◀" : "▶"}
    </button>
  );
};

export default SidebarToggle;

