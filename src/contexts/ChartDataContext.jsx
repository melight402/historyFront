import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import { getIntervalMs } from "../utils/intervalHelpers";

const ChartDataContext = createContext(null);

export const ChartDataProvider = ({ children }) => {
  const [chartData, setChartData] = useState({});
  const onLastCandleUpdateRefs = useRef({});
  const currentSymbolRefs = useRef({});
  const currentIntervalRefs = useRef({});
  const instanceIdRefs = useRef({});

  const fetchWithRetry = useCallback(async (url, maxRetries = 3, retryDelay = 1000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        if (err.name === 'AbortError' || attempt === maxRetries - 1) {
          throw err;
        }
        
        if (err instanceof TypeError && (
          err.message.includes('Failed to fetch') ||
          err.message.includes('network') ||
          err.message.includes('connection')
        )) {
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw err;
      }
    }
  }, []);


  const loadChartData = useCallback((key, symbol, interval, limit, endTime = null) => {
    instanceIdRefs.current[key] = Symbol();
    
    const actualLimit = Math.min(limit, 1500);
    let url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${actualLimit}`;
    
    if (endTime instanceof Date && !isNaN(endTime.getTime())) {
      const intervalMs = getIntervalMs(interval);
      if (intervalMs > 0) {
        const endTimeMs = endTime.getTime();
        const startTimeMs = endTimeMs - (actualLimit * intervalMs);
        url += `&startTime=${startTimeMs}&endTime=${endTimeMs}`;
      }
    }

    setChartData(prev => ({
      ...prev,
      [key]: { data: null, loaded: false, error: null }
    }));

    currentSymbolRefs.current[key] = symbol;
    currentIntervalRefs.current[key] = interval;
    onLastCandleUpdateRefs.current[key] = null;

    fetchWithRetry(url, 3, 1000)
      .then((klineData) => {
        if (!Array.isArray(klineData)) {
          throw new Error('Invalid data format');
        }

        const convertedData = klineData
          .map((kline) => {
            if (!Array.isArray(kline) || kline.length < 6) {
              return null;
            }
            const date = new Date(kline[0]);
            const open = parseFloat(kline[1]);
            const high = parseFloat(kline[2]);
            const low = parseFloat(kline[3]);
            const close = parseFloat(kline[4]);
            const volume = parseFloat(kline[5]);

            if (!(date instanceof Date) || isNaN(date.getTime())) {
              return null;
            }

            if (!isFinite(open) || isNaN(open) || open <= 0 ||
                !isFinite(high) || isNaN(high) || high <= 0 ||
                !isFinite(low) || isNaN(low) || low <= 0 ||
                !isFinite(close) || isNaN(close) || close <= 0) {
              return null;
            }

            if (high < low || !isFinite(volume) || isNaN(volume) || volume < 0) {
              return null;
            }

            return {
              date: date,
              open: open,
              high: high,
              low: low,
              close: close,
              volume: volume,
            };
          })
          .filter(d => d !== null);

        if (convertedData.length === 0) {
          throw new Error('No valid data points after filtering');
        }

        setChartData(prev => ({
          ...prev,
          [key]: { data: convertedData, loaded: true, error: null }
        }));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          void 0;
        }
        setChartData(prev => ({
          ...prev,
          [key]: { data: null, loaded: true, error: err.message || 'Failed to load market data' }
        }));
      });
  }, [fetchWithRetry]);

  const getChartData = useCallback((key) => {
    return chartData[key] || { data: null, loaded: false, error: null };
  }, [chartData]);

  const setOnLastCandleUpdate = useCallback((key, callback) => {
    onLastCandleUpdateRefs.current[key] = callback;
  }, []);

  const cleanup = useCallback((key) => {
    onLastCandleUpdateRefs.current[key] = null;
    delete currentSymbolRefs.current[key];
    delete currentIntervalRefs.current[key];
    delete instanceIdRefs.current[key];
  }, []);

  return (
    <ChartDataContext.Provider value={{
      loadChartData,
      getChartData,
      setOnLastCandleUpdate,
      cleanup
    }}>
      {children}
    </ChartDataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChartData = (key, symbol, interval, limit = 500, endTime = null) => {
  const context = useContext(ChartDataContext);
  
  if (!context) {
    throw new Error('useChartData must be used within ChartDataProvider');
  }

  const { loadChartData, getChartData, setOnLastCandleUpdate, cleanup } = context;

  useEffect(() => {
    if (!endTime || !(endTime instanceof Date) || isNaN(endTime.getTime())) {
      return;
    }
    
    const endTimeStamp = endTime.getTime();
    const dataKey = `${key}-${symbol}-${interval}-${endTimeStamp}`;
    loadChartData(dataKey, symbol, interval, limit, endTime);

    return () => {
      cleanup(dataKey);
    };
  }, [key, symbol, interval, limit, endTime, loadChartData, cleanup]);

  const endTimeStamp = endTime instanceof Date && !isNaN(endTime.getTime()) ? endTime.getTime() : null;
  const dataKey = endTimeStamp !== null ? `${key}-${symbol}-${interval}-${endTimeStamp}` : `${key}-${symbol}-${interval}`;
  const currentChartData = getChartData(dataKey);

  return {
    data: currentChartData.data,
    loaded: currentChartData.loaded,
    error: currentChartData.error,
    setOnLastCandleUpdate: (callback) => setOnLastCandleUpdate(dataKey, callback),
  };
};

