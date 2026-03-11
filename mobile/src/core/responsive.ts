import { Dimensions, PixelRatio } from "react-native";

const BASE_WIDTH = 375;
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.2;

function getScaleFactor(): number {
  const { width } = Dimensions.get("window");
  const raw = width / BASE_WIDTH;
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, raw));
}

export function rs(size: number): number {
  return PixelRatio.roundToNearestPixel(size * getScaleFactor());
}

export function rfs(size: number): number {
  return PixelRatio.roundToNearestPixel(size * Math.min(1.1, getScaleFactor()));
}
