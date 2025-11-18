import { useCallback } from "react";
import { createChart, ColorType, CrosshairMode } from "trading-charts-with-tools";

const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", { weekday: "short" });

const pad = (value) => String(value).padStart(2, "0");

const toDateFromTime = (time) => {
  if (typeof time === "number" && Number.isFinite(time)) {
    return new Date(time * 1000);
  }

  if (time && typeof time === "object") {
    const { year, month, day } = time;
    if (typeof year === "number" && typeof month === "number" && typeof day === "number") {
      return new Date(year, month - 1, day);
    }
  }

  return null;
};

const formatTimeWithWeekday = (time) => {
  const date = toDateFromTime(time);
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const weekday = weekdayFormatter.format(date);

  return `${year}-${month}-${day} ${hours}:${minutes} ${weekday}`;
};

export const useChartCreation = (chartContainerRef, chart, height, volumeAreaHeight) => {
  const createChartInstance = useCallback((width) => {
    if (!chartContainerRef.current || chart.current) return null;

    return createChart(chartContainerRef.current, {
      width: width,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: "#191c27" },
        textColor: "#9EAAC7",
        fontSize: 16,
      },
      grid: {
        vertLines: {
          color: "rgba(56, 62, 85, 0.5)",
        },
        horzLines: {
          color: "rgba(56, 62, 85, 0.5)",
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#9EAAC7",
          width: 1,
        },
        horzLine: {
          color: "#9EAAC7",
          width: 1,
        },
      },
      rightPriceScale: {
        borderColor: "#383E55",
        textColor: "#FFFFFF",
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: volumeAreaHeight,
        },
      },
      leftPriceScale: {
        visible: false,
        scaleMargins: {
          top: 1 - volumeAreaHeight,
          bottom: 0,
        },
      },
      timeScale: {
        borderColor: "#383E55",
        timeVisible: true,
        secondsVisible: false,
      },
      localization: {
        locale: "ru-RU",
        timeFormatter: formatTimeWithWeekday,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,
        },
        axisDoubleClickReset: true,
        mouseWheel: true,
        pinch: true,
      },
    });
  }, [chartContainerRef, chart, height, volumeAreaHeight]);

  return { createChartInstance };
};

