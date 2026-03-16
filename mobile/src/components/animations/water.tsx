import type { StyleProp, ViewStyle } from "react-native";
import waterAnimation from "~/animations/water.json";
import { UniversalLottie } from "./UniversalLottie";

export function WaterAnimation({
	style,
	isRunning = true,
}: {
	style?: StyleProp<ViewStyle>;
	isRunning?: boolean;
}) {
	return (
		<UniversalLottie
			source={waterAnimation}
			dotLottieSource={require("~/animations/water.json")}
			loop={isRunning}
			autoplay={isRunning}
			style={style}
			onLoadError={() => {
				console.warn("Water animation failed to load");
			}}
		/>
	);
}
