import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

export default StyleSheet.create({
	card: {
		width: rs(146),
		height: rs(110),
		paddingHorizontal: rs(18),
		paddingVertical: rs(16),
		borderRadius: rs(20),
		backgroundColor: theme.colors.defaultBg,
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	label: {
		fontSize: rfs(14),
		lineHeight: rfs(18),
		color: theme.colors.font,
	},
	value: {
		fontSize: rfs(24),
		lineHeight: rfs(28),
		fontWeight: "700",
		color: theme.colors.primary,
	},
});
