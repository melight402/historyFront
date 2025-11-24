import { useCallback, useRef } from "react";
import { SESSION_WINDOWS } from "../constants/sessionWindows";

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

const clampSegment = (value, min, max) => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

const buildSegments = (fromSeconds, toSeconds, sessions) => {
  if (!Number.isFinite(fromSeconds) || !Number.isFinite(toSeconds)) {
    return [];
  }

  const rangeStartMs = Math.floor(fromSeconds) * 1000;
  const rangeEndMs = Math.floor(toSeconds) * 1000;

  const startDay = new Date(rangeStartMs);
  startDay.setUTCHours(0, 0, 0, 0);
  const endDay = new Date(rangeEndMs);
  endDay.setUTCHours(0, 0, 0, 0);

  const segments = [];
  for (let day = startDay.getTime() - DAY_MS; day <= endDay.getTime() + DAY_MS; day += DAY_MS) {
    sessions.forEach((session) => {
      const sessionStart = day + session.startMinutesUtc * MINUTE_MS;
      const sessionEnd = sessionStart + session.durationMinutes * MINUTE_MS;
      if (sessionEnd <= rangeStartMs || sessionStart >= rangeEndMs) {
        return;
      }
      const startMs = clampSegment(sessionStart, rangeStartMs, rangeEndMs);
      const endMs = clampSegment(sessionEnd, rangeStartMs, rangeEndMs);
      if (endMs <= startMs) {
        return;
      }
      segments.push({
        id: session.id,
        color: session.color,
        startSeconds: startMs / 1000,
        endSeconds: endMs / 1000,
      });
    });
  }

  return segments;
};

export const useSessionHighlighting = (chartContainerRef, sessions = SESSION_WINDOWS) => {
  const cleanupRef = useRef(null);

  const handleSessionOverlayReady = useCallback(
    (chartInstance) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      const container = chartContainerRef.current;
      if (!chartInstance || !container) {
        return;
      }

      const overlay = document.createElement("div");
      overlay.className = "chart-session-overlay";
      container.appendChild(overlay);

      const timeScale = chartInstance.timeScale();
      if (!timeScale) {
        overlay.remove();
        return;
      }

      let rafId = null;

      const renderOverlay = () => {
        rafId = null;
        overlay.replaceChildren();
        const range = timeScale.getVisibleRange();
        if (!range || range.from == null || range.to == null) {
          return;
        }
        const segments = buildSegments(range.from, range.to, sessions);
        segments.forEach((segment) => {
          const left = timeScale.timeToCoordinate(segment.startSeconds);
          const right = timeScale.timeToCoordinate(segment.endSeconds);
          if (left == null || right == null) {
            return;
          }
          const block = document.createElement("div");
          block.className = "chart-session-block";
          block.style.backgroundColor = segment.color;
          const start = Math.min(left, right);
          const width = Math.abs(right - left);
          block.style.left = `${start}px`;
          block.style.width = `${width}px`;
          overlay.appendChild(block);
        });
      };

      const scheduleRender = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(renderOverlay);
      };

      scheduleRender();

      const handleRangeChange = () => {
        scheduleRender();
      };

      timeScale.subscribeVisibleTimeRangeChange(handleRangeChange);

      const resizeObserver = new ResizeObserver(scheduleRender);
      resizeObserver.observe(container);

      cleanupRef.current = () => {
        timeScale.unsubscribeVisibleTimeRangeChange(handleRangeChange);
        resizeObserver.disconnect();
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        overlay.remove();
      };
    },
    [chartContainerRef, sessions]
  );

  return { handleSessionOverlayReady };
};

