import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

export default StyleSheet.create({
	settingRow: {
		gap: rs(14),
		paddingBottom: rs(14),
	},
	rowHead: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: rs(12),
	},
	label: {
		flex: 1,
		fontSize: rfs(14),
		lineHeight: rfs(20),
		color: theme.colors.font,
		fontWeight: "500",
	},
	more: {
		alignItems: "flex-end",
		justifyContent: "center",
	},
	control: {
		width: "100%",
		alignItems: "stretch",
	},
});
