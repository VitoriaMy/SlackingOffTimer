import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

export default StyleSheet.create({
	timer: {
		minWidth: rs(96),
		height: rs(36),
		borderRadius: rs(10),
		backgroundColor: theme.colors.defaultBg,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: rs(12),
	},
	timerText: {
		fontSize: rfs(16),
		lineHeight: rfs(20),
		color: theme.colors.primary,
		fontWeight: "600",
	},
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		paddingHorizontal: rs(16),
	},
	modalCard: {
		width: "100%",
		maxWidth: rs(420),
		alignSelf: "center",
		backgroundColor: theme.colors.white,
		borderRadius: rs(12),
		padding: rs(20),
	},
	preview: {
		fontSize: rfs(24),
		lineHeight: rfs(28),
		color: theme.colors.primary,
		textAlign: "center",
		fontWeight: "700",
		marginBottom: rs(8),
	},
	panel: {
		gap: rs(14),
	},
	pickers: {
		position: "relative",
		flexDirection: "row",
		gap: rs(14),
		paddingHorizontal: rs(8),
	},
	pickerColumn: {
		flex: 1,
		gap: rs(8),
	},
	pickerTitle: {
		height: rs(20),
		lineHeight: rs(20),
		textAlign: "center",
		fontSize: rfs(12),
		color: theme.colors.font,
		fontWeight: "600",
	},
	pickerList: {
		height: rs(180),
	},
	pickerItem: {
		height: rs(36),
		alignItems: "center",
		justifyContent: "center",
	},
	pickerItemText: {
		fontSize: rfs(18),
		fontWeight: "600",
		color: "#9aa3af",
	},
	activeText: {
		color: theme.colors.primary,
	},
	selectionFrame: {
		position: "absolute",
		left: rs(8),
		right: rs(8),
		top: rs(20 + 8 + 90),
		height: rs(36),
		transform: [{ translateY: -rs(18) }],
		borderRadius: rs(10),
		borderWidth: 1,
		borderColor: "#d7dde5",
		backgroundColor: "rgba(255,255,255,0.55)",
	},
	hint: {
		marginTop: rs(6),
		textAlign: "center",
		fontSize: rfs(12),
		color: theme.colors.font,
	},
	actions: {
		marginTop: rs(12),
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: rs(8),
	},
	actionBtn: {
		minWidth: rs(72),
		borderRadius: rs(8),
		paddingHorizontal: rs(14),
		paddingVertical: rs(8),
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#eceef2",
	},
	actionPrimary: {
		backgroundColor: theme.colors.primary,
	},
	actionText: {
		fontSize: rfs(14),
		lineHeight: rfs(18),
		color: "#2e2e2e",
		fontWeight: "600",
	},
	actionPrimaryText: {
		color: theme.colors.white,
	},
});

