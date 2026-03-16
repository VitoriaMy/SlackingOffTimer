import type { StyleProp, ViewStyle } from "react-native";
import waterDropAnimation from "~/animations/waterdrop.json";
import { UniversalLottie } from "./UniversalLottie";

export function WaterDrapAnimation({
	style,
	isRunning = true,
}: {
	style?: StyleProp<ViewStyle>;
	isRunning?: boolean;
}) {
	return (
		<UniversalLottie
			source={waterDropAnimation}
			dotLottieSource={require("~/animations/waterdrop.json")}
			loop={isRunning}
			autoplay={isRunning}
			style={style}
			onLoadError={() => {
				console.warn("Water drop animation failed to load");
			}}
		/>
	);
}
