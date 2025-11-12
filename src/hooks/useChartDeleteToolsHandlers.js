import { useMemo } from "react";
import { clearAllChartStates } from "../services/localStorageUtils";
import {
  persistLineToolsFromChart,
  removeAllLineToolsFromStorage,
  removeLineToolsFromStorage,
} from "../services/lineToolsManager";

export const useChartDeleteToolsHandlers = (chartRef, symbol) => {
  return useMemo(
    () => ({
      onDeleteSelected: () => {
        if (!chartRef?.current) {
          return;
        }

        try {
          chartRef.current.removeSelectedLineTools();
          setTimeout(() => {
            const exported = chartRef.current.exportLineTools();
            if (exported && exported.trim() !== "" && exported !== "[]") {
              persistLineToolsFromChart(chartRef.current, symbol);
            } else {
              removeLineToolsFromStorage(symbol);
            }
          }, 100);
        } catch {
          void 0;
        }
      },
      onDeleteAll: () => {
        if (chartRef?.current) {
          try {
            chartRef.current.removeAllLineTools();
          } catch {
            void 0;
          }
        }

        removeAllLineToolsFromStorage();
        clearAllChartStates();
      },
    }),
    [chartRef, symbol]
  );
};


