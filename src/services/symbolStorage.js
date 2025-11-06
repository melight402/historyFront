const STORAGE_KEY = 'tradingFront_selectedSymbol';

export const saveSelectedSymbol = (symbol) => {
  try {
    localStorage.setItem(STORAGE_KEY, symbol);
  } catch {
    void 0;
  }
};

export const loadSelectedSymbol = (defaultSymbol = 'BTCUSDT') => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || defaultSymbol;
  } catch {
    return defaultSymbol;
  }
};

