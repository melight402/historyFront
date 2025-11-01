const STORAGE_KEY = 'tradingFront_selectedSymbol';

export const saveSelectedSymbol = (symbol) => {
  try {
    localStorage.setItem(STORAGE_KEY, symbol);
  } catch (error) {
    console.warn('Failed to save selected symbol to localStorage:', error);
  }
};

export const loadSelectedSymbol = (defaultSymbol = 'BTCUSDT') => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || defaultSymbol;
  } catch (error) {
    console.warn('Failed to load selected symbol from localStorage:', error);
    return defaultSymbol;
  }
};

