import { Dimensions, PixelRatio } from "react-native";

const BASE_WIDTH = 375;

const MIN_SCALE = 0.85;
const MAX_SCALE = 1.2;

function computeScaleFactor(width: number): number {
  const raw = width / BASE_WIDTH;
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, raw));
}

let scaleFactor = computeScaleFactor(Dimensions.get("window").width);

Dimensions.addEventListener("change", ({ window }) => {
  scaleFactor = computeScaleFactor(window.width);
});

function getScaleFactor(): number {
  return scaleFactor;
}

// 基于设计稿宽度的适配函数，适用于大多数尺寸的元素
export function rs(size: number): number {
  return PixelRatio.roundToNearestPixel(size * getScaleFactor());
}

// 基于设计稿宽度的适配函数，适用于字体尺寸，增加了微调以适应不同屏幕密度
export function rfs(size: number): number {
  return PixelRatio.roundToNearestPixel(size * Math.min(1.1, getScaleFactor()));
}
