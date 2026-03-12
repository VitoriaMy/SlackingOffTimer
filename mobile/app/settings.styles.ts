import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

const styles = StyleSheet.create({
  scrollContent: {
    gap: rs(14),
  },
  card: {
    gap: rs(38),
    paddingTop: rs(10),
  },
  label: {
    marginTop: rs(4),
    marginBottom: rs(6),
    fontSize: rfs(13),
    color: theme.colors.muted,
    fontWeight: "600",
  },
  timeRange: {
    flexDirection: "row",
    gap: rs(16),
  },
  timeCol: {
    flex: 1,
  },
  timeRow: {
    marginTop: rs(2),
    flexDirection: "row",
    gap: rs(8),
    alignItems: "center",
  },
  timeButton: {
    height: rs(62),
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: rs(15),
    paddingHorizontal: rs(10),
    backgroundColor: theme.colors.surfaceSoft,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  timeButtonDisabled: {
    opacity: 0.5,
  },
  timeButtonText: {
    fontSize: rfs(24),
    lineHeight: rfs(26),
    color: theme.colors.primary,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  clearButton: {
    marginTop: rs(2),
    borderRadius: theme.radius.item,
    backgroundColor: "#eceef2",
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
  },
  clearButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  lunchToggle: {
    borderRadius: 999,
    backgroundColor: "#eef2f7",
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
  },
  lunchToggleOn: {
    backgroundColor: theme.colors.accent,
  },
  lunchToggleText: {
    color: theme.colors.subtle,
    fontWeight: "700",
    fontSize: rfs(12),
  },
  lunchToggleTextOn: {
    color: "#ffffff",
  },
  pickerCard: {
    marginTop: rs(8),
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.item,
    backgroundColor: theme.colors.surfaceSoft,
    padding: rs(6),
  },
  pickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: rs(8),
    paddingHorizontal: rs(6),
    paddingBottom: rs(6),
  },
  pickerCancel: {
    backgroundColor: "#7a8796",
    borderRadius: rs(8),
    paddingVertical: rs(8),
    paddingHorizontal: rs(12),
  },
  pickerConfirm: {
    backgroundColor: theme.colors.accent,
    borderRadius: rs(8),
    paddingVertical: rs(8),
    paddingHorizontal: rs(12),
  },
  pickerActionText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  dayRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: rs(8),
  },
  dayPill: {
    borderRadius: rs(16),
    flex: 1,
    height: rs(70),
    backgroundColor: "#fbfbfb",
    alignItems: "center",
    justifyContent: "center",
  },
  dayPillSelected: {
    backgroundColor: "#111111",
  },
  dayText: {
    color: "#9a9a9a",
    fontWeight: "700",
    fontSize: rfs(16),
  },
  dayTextSelected: {
    color: "#ffffff",
  },
  error: {
    color: "#dc2626",
    fontWeight: "600",
  },
  success: {
    color: "#16a34a",
    fontWeight: "600",
  },
  footer: {
    marginTop: rs(18),
    paddingTop: rs(26),
    alignItems: "center",
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: rs(16),
    width: rs(327),
    minHeight: rs(60),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: rfs(18),
  },
});

export default styles;
