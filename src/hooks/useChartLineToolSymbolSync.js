import { useEffect } from "react";

export const useChartLineToolSymbolSync = (chartRef, symbol) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__CURRENT_SYMBOL = symbol;
    }

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
                symbol: symbol || "",
                risk:
                  parseFloat(
                    (typeof window !== "undefined" && window.__CURRENT_RISK) || 0
                  ) || 0,
              },
            };
            currentChart.applyLineToolOptions(updatedTool);
          }
        });
      }
    } catch {
      void 0;
    }
  }, [chartRef, symbol]);
};


