import React, { useState } from "react";
import { takeScreenshot } from "../../utils/screenshot";
import { openPosition } from "../../utils/api";
import { calculatePositionQuantity, calculateTakeProfitPrice, calculateEntryPtCoins, calculateEntryPtUSDT } from "../../utils/positionCalculations";
import { roundQuantityToStepSize } from "../../utils/tickSizeCache";
import "../../styles/styles.css";

const ExportPositionData = ({ 
  chart5mRef, 
  symbol, 
  risk,
  selectedDateTime,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const getLastPositionTool = () => {
    if (!chart5mRef.current) {
      return null;
    }

    let lastTool = null;
    let lastTimestamp = 0;

    const exportedTools = chart5mRef.current.exportLineTools();
    const tools = JSON.parse(exportedTools);

    const positionTools = tools.filter(
      (tool) => tool.toolType === "LongShortPosition"
    );

    positionTools.forEach((tool) => {
      const points = tool.points;
      if (points && points.length >= 3) {
        const timestamp = Math.max(
          points[0].timestamp,
          points[1].timestamp,
          points[2].timestamp
        );
        if (timestamp > lastTimestamp) {
          lastTimestamp = timestamp;
          lastTool = tool;
        }
      }
    });

    return lastTool;
  };

  const extractPositionData = () => {
    if (!chart5mRef.current) {
      return [];
    }

    const allPositions = [];

    const exportedTools = chart5mRef.current.exportLineTools();
    const tools = JSON.parse(exportedTools);

    const positionTools = tools.filter(
      (tool) => tool.toolType === "LongShortPosition"
    );

    positionTools.forEach((tool) => {
      const points = tool.points;
      if (points && points.length >= 3) {
        const entryPrice = points[0].price;
        const stopLossPrice = points[1].price;
        const takeProfitPrice = points[2].price;

        const isLong = entryPrice > stopLossPrice;
        const direction = isLong ? "Long" : "Short";
        const riskValue = parseFloat(risk) || 0;
        const entryPtCoinsValue = calculateEntryPtCoins(riskValue, entryPrice, stopLossPrice, direction);
        const entryPtUSDTValue = calculateEntryPtUSDT(entryPrice, entryPtCoinsValue);

        allPositions.push({
          id: tool.id,
          symbol: symbol,
          direction: direction,
          entryPrice: entryPrice,
          stopLoss: stopLossPrice,
          takeProfit: takeProfitPrice,
          entryPtUSDT: entryPtUSDTValue,
          entryPtCoins: entryPtCoinsValue,
        });
      }
    });

    return allPositions;
  };

  const handleExport = async () => {
    const lastTool = getLastPositionTool();

    let finalEntryPrice = null;
    let finalStopLoss = null;
    let finalDirection = null;
    let finalTakeProfit = null;

    if (lastTool && lastTool.points && lastTool.points.length >= 3) {
      const points = lastTool.points;
      finalEntryPrice = points[0].price;
      finalStopLoss = points[1].price;
      finalTakeProfit = points[2].price;
      finalDirection = finalEntryPrice > finalStopLoss ? "Long" : "Short";
    } else {
      alert("Нет позиций для экспорта. Убедитесь, что на графиках созданы инструменты 'Длинная/короткая позиция'");
      return;
    }

    const riskValue = parseFloat(risk);
    if (!risk || isNaN(riskValue) || riskValue <= 0) {
      alert("Ошибка: Риск должен быть больше нуля. Введите значение риска в USDT.");
      return;
    }

    const positions = extractPositionData();
    
    if (positions.length === 0) {
      alert("Нет позиций для экспорта");
      return;
    }

    const calculatedQuantity = calculatePositionQuantity(
      riskValue,
      finalEntryPrice,
      finalStopLoss
    );

    const roundedQuantity = roundQuantityToStepSize(calculatedQuantity, symbol);

    if (!roundedQuantity || roundedQuantity <= 0) {
      const priceDifference = Math.abs(finalEntryPrice - finalStopLoss);
      alert(`Количество позиции равно нулю (Quantity: 0.00).\n\nПричина: рассчитанное количество ${calculatedQuantity.toFixed(6)} слишком мало для минимального шага размера позиции.\n\nТекущие значения:\n- Риск: ${riskValue} USDT\n- Цена входа: ${finalEntryPrice}\n- Стоп-лосс: ${finalStopLoss}\n- Разница: ${priceDifference.toFixed(2)}\n\nРешение: увеличьте риск или уменьшите разницу между ценой входа и стоп-лоссом.`);
      return;
    }

    setIsExporting(true);

    try {
      const finalTakeProfitPrice = finalTakeProfit || calculateTakeProfitPrice(
        finalEntryPrice,
        finalStopLoss,
        "3",
        finalDirection
      );

      const screenshotBlob = await takeScreenshot();

      const positionSide = finalDirection === "Long" ? "LONG" : "SHORT";

      const dateTime = selectedDateTime ? new Date(selectedDateTime).toISOString() : new Date().toISOString();

      const positionUsdt = Math.round((finalEntryPrice * roundedQuantity) * 100) / 100;

      const positionData = {
        dateTime: dateTime,
        positionSide: positionSide,
        price: finalEntryPrice,
        quantity: roundedQuantity,
        positionUsdt: positionUsdt,
        stopLossPrice: finalStopLoss,
        takeProfitPrice: finalTakeProfitPrice,
        symbol: symbol,
        tvx: "level_breakout",
        risk: riskValue,
        lineToolId: lastTool ? lastTool.id : null,
      };

      await openPosition(positionData, screenshotBlob);

      localStorage.setItem(`lastOpenPosition_${symbol}`, JSON.stringify(positionData));

      alert("Позиция успешно открыта");
    } catch (error) {
      alert(`Ошибка при открытии позиции: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="export-button"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? "Открытие..." : "Открыть позицию"}
    </button>
  );
};

export default ExportPositionData;
