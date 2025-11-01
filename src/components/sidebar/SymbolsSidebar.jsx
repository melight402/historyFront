import React, { useEffect, useRef } from "react";
import { useSymbols } from "../../hooks/useSymbols";
import { COLORS } from "../../constants";
import { symbolsSidebarStyle, symbolsSidebarHeaderStyle, symbolsSidebarTitleStyle, symbolsSidebarListStyle } from "../../styles/styles";
import "../../styles/styles.css";

const SymbolsSidebar = ({ selectedSymbol, onSymbolSelect }) => {
  const { symbols, loading, error, toggleFavorite, isFavorite } = useSymbols();
  const sidebarRef = useRef(null);
  const listRef = useRef(null);
  const selectedItemRef = useRef(null);
  const isInitialMount = useRef(true);
  const lastSelectedSymbol = useRef(null);
  const isUserScrolling = useRef(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sidebarRef.current || !sidebarRef.current.contains(document.activeElement)) {
        return;
      }

      if (loading || error || symbols.length === 0) {
        return;
      }

      const currentIndex = symbols.findIndex((sym) => sym.value === selectedSymbol);
      
      if (currentIndex === -1) {
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIndex > 0) {
          onSymbolSelect(symbols[currentIndex - 1].value);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentIndex < symbols.length - 1) {
          onSymbolSelect(symbols[currentIndex + 1].value);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [symbols, selectedSymbol, loading, error, onSymbolSelect]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    const handleScroll = () => {
      isUserScrolling.current = true;
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 150);
    };

    const listElement = listRef.current;
    listElement.addEventListener("scroll", handleScroll);

    return () => {
      listElement.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const shouldScroll = isInitialMount.current || lastSelectedSymbol.current !== selectedSymbol;
    
    if (shouldScroll && selectedItemRef.current && listRef.current && !isUserScrolling.current) {
      const itemElement = selectedItemRef.current;
      const listElement = listRef.current;
      
      const itemTop = itemElement.offsetTop;
      const itemBottom = itemTop + itemElement.offsetHeight;
      const listTop = listElement.scrollTop;
      const listBottom = listTop + listElement.clientHeight;

      if (itemTop < listTop) {
        listElement.scrollTo({
          top: itemTop - 16,
          behavior: isInitialMount.current ? "auto" : "smooth",
        });
      } else if (itemBottom > listBottom) {
        listElement.scrollTo({
          top: itemBottom - listElement.clientHeight + 16,
          behavior: isInitialMount.current ? "auto" : "smooth",
        });
      }
    }

    if (isInitialMount.current && !loading) {
      isInitialMount.current = false;
    }

    lastSelectedSymbol.current = selectedSymbol;
  }, [selectedSymbol, loading]);

  const handleSidebarClick = (e) => {
    if (sidebarRef.current && sidebarRef.current.contains(e.target)) {
      sidebarRef.current.focus();
    }
  };

  return (
    <div 
      ref={sidebarRef}
      style={symbolsSidebarStyle}
      onClick={handleSidebarClick}
      tabIndex={0}
      className="symbols-sidebar"
    >
      <div style={symbolsSidebarHeaderStyle}>
        <h3 style={symbolsSidebarTitleStyle}>Торговые пары</h3>
      </div>
      <div 
        ref={listRef}
        style={symbolsSidebarListStyle} 
        className="symbols-sidebar-scroll"
      >
        {loading ? (
          <div className="symbols-sidebar-loading">Загрузка...</div>
        ) : error ? (
          <div className="symbols-sidebar-error">Ошибка загрузки</div>
        ) : symbols.length === 0 ? (
          <div className="symbols-sidebar-loading">Нет доступных пар</div>
        ) : (
          symbols.map((sym) => {
            const isSelected = sym.value === selectedSymbol;
            const favorite = isFavorite(sym.value);

            return (
              <div
                ref={isSelected ? selectedItemRef : null}
                key={sym.value}
                className={isSelected ? "symbols-sidebar-item symbols-sidebar-item-selected" : "symbols-sidebar-item"}
                onClick={() => {
                  onSymbolSelect(sym.value);
                  if (sidebarRef.current) {
                    sidebarRef.current.focus();
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = COLORS.background.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  className="symbols-sidebar-favorite"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(sym.value);
                  }}
                  style={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontSize: '16px',
                    padding: '0 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '24px',
                  }}
                  title={favorite ? "Удалить из избранного" : "Добавить в избранное"}
                >
                  {favorite ? "⭐" : "☆"}
                </div>
                <div className="symbols-sidebar-symbol-name">{sym.label}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SymbolsSidebar;

