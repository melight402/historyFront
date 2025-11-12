import { useEffect } from "react";

export const useChartLineToolRiskSync = (chartRef, risk, symbol) => {
  useEffect(() => {
    const currentChart = chartRef?.current;
    if (!currentChart) {
      return;
    }

    try {
      const exported = currentChart.exportLineTools();
      if (exported && exported !== "[]") {
        const tools = JSON.parse(exported);
        tools.forEach((tool) => {
          if (tool.toolType === "LongShortPosition") {
            const updatedTool = {
              ...tool,
              options: {
                ...tool.options,
                risk: parseFloat(risk) || 0,
                symbol:
                  symbol ||
                  ((typeof window !== "undefined" && window.__CURRENT_SYMBOL) ||
                    ""),
              },
            };
            currentChart.applyLineToolOptions(updatedTool);
          }
        });
      }
    } catch {
      void 0;
    }
  }, [chartRef, risk, symbol]);
};


