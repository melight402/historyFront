import { useState, useEffect, useCallback } from "react";
import { MIN_VOLUME_USD } from "../constants";
import { formatSymbolLabel } from "../utils";

const SYMBOLS_STORAGE_KEY = "trading_symbols";
const FAVORITES_STORAGE_KEY = "trading_favorites";

const loadFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    void 0;
  }
  return new Set();
};

const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites)));
  } catch {
    void 0;
  }
};

const sortSymbolsWithFavorites = (symbolsList, favoritesSet) => {
  const favoritesList = symbolsList.filter(sym => favoritesSet.has(sym.value));
  const nonFavoritesList = symbolsList.filter(sym => !favoritesSet.has(sym.value));
  
  favoritesList.sort((a, b) => a.label.localeCompare(b.label));
  nonFavoritesList.sort((a, b) => a.label.localeCompare(b.label));
  
  return [...favoritesList, ...nonFavoritesList];
};

export function useSymbols() {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(() => loadFavorites());

  useEffect(() => {
    const loadSymbols = async () => {
      try {
        setLoading(true);
        setError(null);

        const storedSymbols = localStorage.getItem(SYMBOLS_STORAGE_KEY);
        const currentFavorites = loadFavorites();
        
        if (storedSymbols) {
          try {
            const parsed = JSON.parse(storedSymbols);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const sorted = sortSymbolsWithFavorites(parsed, currentFavorites);
              setSymbols(sorted);
              setLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem(SYMBOLS_STORAGE_KEY);
          }
        }

        const exchangeInfoUrl = "https://fapi.binance.com/fapi/v1/exchangeInfo";
        const exchangeInfoResponse = await fetch(exchangeInfoUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!exchangeInfoResponse.ok) {
          throw new Error(`HTTP error! status: ${exchangeInfoResponse.status}`);
        }

        const exchangeInfo = await exchangeInfoResponse.json();
        
        const activeSymbols = new Set(
          exchangeInfo.symbols
            .filter((symbolInfo) => {
              return (
                symbolInfo.status === 'TRADING' &&
                symbolInfo.contractType === 'PERPETUAL' &&
                (symbolInfo.symbol.endsWith("USDT") || symbolInfo.symbol.endsWith("USDC"))
              );
            })
            .map((symbolInfo) => symbolInfo.symbol)
        );

        const url = "https://fapi.binance.com/fapi/v1/ticker/24hr";

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tickerData = await response.json();

        const symbolsList = tickerData
          .filter((ticker) => {
            const quoteVolume = parseFloat(ticker.quoteVolume) || 0;
            const symbol = ticker.symbol;
            
            return (
              activeSymbols.has(symbol) &&
              quoteVolume >= MIN_VOLUME_USD &&
              (symbol.endsWith("USDT") || symbol.endsWith("USDC"))
            );
          })
          .map((ticker) => ({
              value: ticker.symbol,
              label: formatSymbolLabel(ticker.symbol),
          }));

        localStorage.setItem(SYMBOLS_STORAGE_KEY, JSON.stringify(symbolsList));
        
        const sortedSymbols = sortSymbolsWithFavorites(symbolsList, currentFavorites);
        setSymbols(sortedSymbols);
        setFavorites(currentFavorites);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load symbols");
        const fallbackSymbols = [
          { value: "BTCUSDT", label: "BTC/USDT" },
          { value: "ETHUSDT", label: "ETH/USDT" },
        ];
        const currentFavorites = loadFavorites();
        const sortedFallback = sortSymbolsWithFavorites(fallbackSymbols, currentFavorites);
        setSymbols(sortedFallback);
        setFavorites(currentFavorites);
        setLoading(false);
      }
    };

    loadSymbols();
  }, []);

  useEffect(() => {
    if (symbols.length > 0) {
      const sorted = sortSymbolsWithFavorites(symbols, favorites);
      const currentOrder = symbols.map(s => s.value).join(',');
      const sortedOrder = sorted.map(s => s.value).join(',');
      if (currentOrder !== sortedOrder) {
        setSymbols(sorted);
      }
    }
  }, [favorites]);

  const toggleFavorite = useCallback((symbolValue) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(symbolValue)) {
        newFavorites.delete(symbolValue);
      } else {
        newFavorites.add(symbolValue);
      }
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((symbolValue) => {
    return favorites.has(symbolValue);
  }, [favorites]);

  return { symbols, loading, error, toggleFavorite, isFavorite };
}

