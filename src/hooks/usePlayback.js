import { usePlaybackDataLoader } from "./usePlaybackDataLoader";
import { usePlaybackCandleUpdater } from "./usePlaybackCandleUpdater";
import { usePlaybackControl } from "./usePlaybackControl";

export const usePlayback = (
  chart,
  candlestickSeries,
  volumeSeries,
  isPlaying,
  playbackSpeed,
  symbol,
  interval,
  lastCandleTimeRef,
  onDateTimeUpdate = null
) => {
  const { loadNextCandles, playbackQueueRef, lastLoadedTimeRef } = usePlaybackDataLoader(symbol, interval, lastCandleTimeRef);
  const { addCandle } = usePlaybackCandleUpdater(chart, candlestickSeries, volumeSeries, lastCandleTimeRef);
  usePlaybackControl(
    isPlaying,
    playbackSpeed,
    playbackQueueRef,
    addCandle,
    loadNextCandles,
    lastCandleTimeRef,
    onDateTimeUpdate,
    lastLoadedTimeRef
  );
};
