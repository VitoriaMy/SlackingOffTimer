import { StyleSheet } from "react-native";
import { rs } from "@/core/responsive";
import { theme } from "@/core/theme";

const styles = StyleSheet.create({
	loadingWrap: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingText: {
		color: theme.colors.font,
		fontSize: rs(16),
		fontWeight: "600",
	},
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
		gap: rs(10),
	},
	actionsRow: {
		width: rs(327),
		flexDirection: "row",
		gap: rs(12),
	},
	resetButton: {
		flex: 1,
		height: rs(60),
		borderRadius: rs(16),
		borderWidth: rs(1),
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.defaultBg,
		alignItems: "center",
		justifyContent: "center",
	},
	saveButton: {
		flex: 1,
		height: rs(60),
		borderRadius: rs(16),
		backgroundColor: theme.colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	resetButtonText: {
		color: theme.colors.primary,
		fontSize: rs(16),
		fontWeight: "700",
	},
	saveButtonText: {
		color: theme.colors.white,
		fontSize: rs(18),
		fontWeight: "700",
	},
	buttonDisabled: {
		opacity: 0.55,
	},
	hintText: {
		color: theme.colors.font,
		opacity: 0.7,
		fontSize: rs(12),
		fontWeight: "500",
	},
	bottomSpacer: {
		height: rs(6),
	},
	bottomSpacerText: {
		fontSize: rs(1),
	},
});

export default styles;
