import React from "react";
import { createContainerStyle } from "../../utils";
import "../../styles/styles.css";

const SymbolDisplay = ({ symbol }) => {
  const containerStyle = createContainerStyle({
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#ffffff",
  });

  return (
    <div style={containerStyle} className="symbol-display">
      {symbol}
    </div>
  );
};

export default SymbolDisplay;

