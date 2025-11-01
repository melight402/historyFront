import React, { useState } from "react";
import { takeScreenshot } from "../../utils/screenshot";
import { closePosition } from "../../utils/api";
import { getPositionToolData } from "../../utils/positionToolExtractor";
import "../../styles/styles.css";

const ClosePositionButton = ({ 
  symbol, 
  profitLoss,
  selectedDateTime,
  chartRef,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = async () => {
    if (!profitLoss) {
      alert("Выберите прибыль или убыток");
      return;
    }

    const lastOpenPositionData = localStorage.getItem(`lastOpenPosition_${symbol}`);
    if (!lastOpenPositionData) {
      alert("Не найдена открытая позиция для этого символа");
      return;
    }

    let positionData;
    try {
      positionData = JSON.parse(lastOpenPositionData);
    } catch {
      alert("Ошибка при чтении данных открытой позиции");
      return;
    }

    if (!positionData.lineToolId) {
      alert("Не найден ID инструмента в данных позиции");
      return;
    }

    const toolData = getPositionToolData(chartRef, positionData.lineToolId);
    if (!toolData) {
      alert("Не найден инструмент рисования на графике");
      return;
    }

    setIsClosing(true);

    try {
      const screenshotBlob = await takeScreenshot();

      const closeDateTime = selectedDateTime ? new Date(selectedDateTime).toISOString() : new Date().toISOString();

      const closeData = {
        symbol: positionData.symbol,
        lineToolId: positionData.lineToolId,
        dateTime: closeDateTime,
        profitLoss: profitLoss,
        stopLossPrice: toolData.stopLossPrice,
        takeProfitPrice: toolData.takeProfitPrice,
      };

      await closePosition(closeData, screenshotBlob);

      localStorage.removeItem(`lastOpenPosition_${symbol}`);

      alert(`Позиция закрыта с ${profitLoss === "profit" ? "прибылью" : "убытком"}`);
    } catch (error) {
      alert(`Ошибка при закрытии позиции: ${error.message}`);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <button
      className="export-button"
      onClick={handleClose}
      disabled={isClosing}
    >
      {isClosing ? "Закрытие..." : "Закрыть позицию"}
    </button>
  );
};

export default ClosePositionButton;

