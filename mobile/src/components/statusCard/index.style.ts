import { StyleSheet } from 'react-native';
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

export default StyleSheet.create({
	statusCard: {
		marginTop: 0,
		flexDirection: "column",
		alignItems: "center",
		gap: rs(6),
	},
	time: {},
	timeText: {
		fontSize: rfs(54),
		lineHeight: rfs(56),
		fontWeight: "700",
	},
	status: {},
	statusText: {
		fontSize: rfs(14),
		lineHeight: rfs(20),
		color: theme.colors.font,
	},
	triggerButton: {
		marginTop: rs(8),
		paddingHorizontal: rs(14),
		paddingVertical: rs(8),
		borderWidth: 0,
		borderRadius: rs(999),
		backgroundColor: theme.colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	triggerButtonText: {
		color: theme.colors.white,
		fontSize: rfs(13),
		fontWeight: "600",
		textAlign: "center",
	},
});