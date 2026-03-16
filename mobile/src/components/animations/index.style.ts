import { StyleSheet } from "react-native";

const CONTAINER_WIDTH = 240;
const CONTAINER_HEIGHT = 400;

const FISH_STYLE_MAP = {
	1: { display: "none" as const },
	2: { bottom: 52, width: 77, height: 26 },
	3: { bottom: 56, width: 108, height: 36 },
	4: { bottom: 72, width: 115, height: 38 },
	5: { bottom: 80, width: 120, height: 40 },
	6: { bottom: 80, width: 130, height: 44 },
};

const WATER_DROP_BOTTOM_MAP = {
	1: 84,
	2: 104,
	3: 124,
	4: 144,
	5: 164,
	6: null,
};

const WATER_TRANSLATE_MAP = {
	1: 0,
	2: -400,
	3: -800,
	4: -1200,
	5: -1600,
	6: -2000,
};

export const animationStageStyles = {
	fishByStage: FISH_STYLE_MAP,
	waterDropBottomByStage: WATER_DROP_BOTTOM_MAP,
	waterTranslateByStage: WATER_TRANSLATE_MAP,
};

export default StyleSheet.create({
	container: {
		width: CONTAINER_WIDTH,
		height: CONTAINER_HEIGHT,
		position: "relative",
		overflow: "hidden",
	},
	water: {
		position: "absolute",
		top: 0,
		left: 0,
		width: CONTAINER_WIDTH,
		height: CONTAINER_HEIGHT * 6,
	},
	waterDropWrapper: {
		position: "absolute",
		top: 200,
		left: -5,
		width: CONTAINER_WIDTH,
		height: 120,
	},
	fish: {
		position: "absolute",
		left: 40,
		bottom: 24,
		width: 158,
		height: 53,
	},
});