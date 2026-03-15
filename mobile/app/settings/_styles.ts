import { StyleSheet } from "react-native";
import { rs } from "@/core/responsive";
import { theme } from "@/core/theme";

const styles = StyleSheet.create({
	timeRange: {
		flexDirection: "row",
		gap: rs(16),
		width: "100%",
	},
	timeValue: {
		flex: 1,
		height: rs(62),
		borderRadius: rs(15),
		justifyContent: "center",
	},
	timeValueStatic: {
		flex: 1,
		height: rs(62),
		borderRadius: rs(15),
		backgroundColor: theme.colors.defaultBg,
		alignItems: "center",
		justifyContent: "center",
	},
	timeValueStaticText: {
		color: theme.colors.primary,
		fontSize: rs(20),
		fontWeight: "700",
	},
	footer: {
		marginTop: rs(32),
		alignItems: "center",
	},
	saveButton: {
		width: rs(327),
		height: rs(60),
		borderRadius: rs(16),
		backgroundColor: theme.colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	saveButtonText: {
		color: theme.colors.white,
		fontSize: rs(18),
		fontWeight: "700",
	},
});

export default styles;
