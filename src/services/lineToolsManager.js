const LINE_TOOLS_STORAGE_PREFIX = 'tradingFront_lineTools_';


const getLineToolsStorageKey = (symbol) => {
  return `${LINE_TOOLS_STORAGE_PREFIX}${symbol}`;
};


export const saveLineToolsToStorage = (symbol, lineToolsJson) => {
  try {
    const key = getLineToolsStorageKey(symbol);
    if (lineToolsJson && lineToolsJson.trim() !== '' && lineToolsJson !== '[]') {
      localStorage.setItem(key, lineToolsJson);
    }
  } catch {
    void 0;
  }
};


export const loadLineToolsFromStorage = (symbol) => {
  try {
    const key = getLineToolsStorageKey(symbol);
    const saved = localStorage.getItem(key);
    if (saved && saved.trim() !== '' && saved !== '[]') {
      JSON.parse(saved);
      return saved;
    }
    return null;
  } catch {
    return null;
  }
};


export const removeLineToolsFromStorage = (symbol) => {
  try {
    const key = getLineToolsStorageKey(symbol);
    localStorage.removeItem(key);
  } catch {
    void 0;
  }
};


export const removeAllLineToolsFromStorage = () => {
  try {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(LINE_TOOLS_STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
  } catch {
    void 0;
  }
};


export const exportLineToolsFromChart = (chart) => {
  if (!chart) return null;
  
  try {
    const exported = chart.exportLineTools();
    if (exported && exported.trim() !== '' && exported !== '[]') {
      JSON.parse(exported);
      return exported;
    }
    return null;
  } catch {
    return null;
  }
};


export const importLineToolsToChart = (chart, lineToolsJson) => {
  if (!chart || !lineToolsJson) return false;
  
  try {
    JSON.parse(lineToolsJson);
    chart.removeAllLineTools();
    chart.importLineTools(lineToolsJson);
    return true;
  } catch {
    return false;
  }
};


export const persistLineToolsFromChart = (chart, symbol) => {
  if (!chart || !symbol) return;
  
  const exported = exportLineToolsFromChart(chart);
  saveLineToolsToStorage(symbol, exported);
};


export const restoreLineToolsToChart = (chart, symbol) => {
  if (!chart || !symbol) return false;
  
  const saved = loadLineToolsFromStorage(symbol);
  if (saved) {
    return importLineToolsToChart(chart, saved);
  }
  
  return false;
};

