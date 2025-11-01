export const getPositionToolData = (chartRef, lineToolId) => {
  if (!chartRef || !chartRef.current) {
    return null;
  }

  try {
    const exportedTools = chartRef.current.exportLineTools();
    const tools = JSON.parse(exportedTools);

    const positionTool = tools.find(
      (tool) => tool.toolType === "LongShortPosition" && tool.id === lineToolId
    );

    if (positionTool && positionTool.points && positionTool.points.length >= 3) {
      return {
        stopLossPrice: positionTool.points[1].price,
        takeProfitPrice: positionTool.points[2].price,
      };
    }
  } catch (error) {
    console.warn("Ошибка при извлечении данных инструмента:", error);
  }

  return null;
};

