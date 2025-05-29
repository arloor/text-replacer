export function formatVolume(volume?: number): string {
  if (!volume) return "0";
  if (volume >= 100000000) {
    return `${(volume / 100000000).toFixed(2)}亿手`;
  } else if (volume >= 10000) {
    return `${(volume / 10000).toFixed(2)}万手`;
  } else {
    return `${volume}手`;
  }
}
