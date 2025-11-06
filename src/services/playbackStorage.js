const STORAGE_KEYS = {
  SELECTED_DATETIME: 'historyFront_selectedDateTime',
  SIDEBAR_OPEN: 'historyFront_sidebarOpen',
  PLAYBACK_SPEED: 'historyFront_playbackSpeed',
  PLAYBACK_TIMEFRAME: 'historyFront_playbackTimeframe',
};

export const saveSelectedDateTime = (dateTime) => {
  try {
    if (dateTime instanceof Date && !isNaN(dateTime.getTime())) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_DATETIME, dateTime.toISOString());
    }
  } catch {
    void 0;
  }
};

export const loadSelectedDateTime = (defaultValue = null) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_DATETIME);
    if (saved) {
      const dateTime = new Date(saved);
      if (!isNaN(dateTime.getTime())) {
        return dateTime;
      }
    }
    return defaultValue || new Date();
  } catch {
    return defaultValue || new Date();
  }
};

export const saveSidebarOpen = (isOpen) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, JSON.stringify(isOpen));
  } catch {
    void 0;
  }
};

export const loadSidebarOpen = (defaultValue = true) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
};

export const savePlaybackSpeed = (speed) => {
  try {
    if (typeof speed === 'number' && speed >= 1 && speed <= 10) {
      localStorage.setItem(STORAGE_KEYS.PLAYBACK_SPEED, JSON.stringify(speed));
    }
  } catch {
    void 0;
  }
};

export const loadPlaybackSpeed = (defaultValue = 1) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYBACK_SPEED);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (typeof parsed === 'number' && parsed >= 1 && parsed <= 10) {
        return parsed;
      }
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
};

export const savePlaybackTimeframe = (timeframe) => {
  try {
    if (timeframe && typeof timeframe === 'string') {
      localStorage.setItem(STORAGE_KEYS.PLAYBACK_TIMEFRAME, timeframe);
    }
  } catch {
    void 0;
  }
};

export const loadPlaybackTimeframe = (defaultValue = "5m") => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYBACK_TIMEFRAME);
    if (saved) {
      return saved;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
};

