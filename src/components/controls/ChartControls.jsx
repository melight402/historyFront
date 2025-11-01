import React from "react";
import "../../styles/styles.css";

const ChartControls = ({ firstRowLeft, firstRowContent, firstRowCenter, secondRowLeft, secondRowCenter, secondRowRight }) => {
  return (
    <div className="chart-controls-container">
      {(firstRowLeft || firstRowContent || firstRowCenter) && (
        <div className="chart-controls-row chart-controls-row-first">
          {firstRowLeft && (
            <div className="chart-controls-first-row-left-start">
              {firstRowLeft}
            </div>
          )}
          {firstRowCenter && (
            <div className="chart-controls-first-row-center">
              {firstRowCenter}
            </div>
          )}
          {firstRowContent && (
            <div className="chart-controls-first-row-left">
              {firstRowContent}
            </div>
          )}
        </div>
      )}
      <div className="chart-controls-row chart-controls-row-second">
        {secondRowLeft && (
          <div className="chart-controls-second-row-left">
            {secondRowLeft}
          </div>
        )}
        {secondRowCenter && (
          <div className="chart-controls-second-row-center">
            {secondRowCenter}
          </div>
        )}
        {secondRowRight && (
          <div className="chart-controls-second-row-right">
            {secondRowRight}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartControls;

