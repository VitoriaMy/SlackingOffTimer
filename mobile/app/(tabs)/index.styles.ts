import { StyleSheet } from "react-native";
import { rfs, rs } from "@/src/core/responsive";
import { theme } from "@/src/core/theme";

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: rs(26),
    paddingBottom: rs(28),
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: rs(8),
  },
  loadingTitle: {
    fontSize: rfs(26),
    color: theme.colors.primary,
    fontWeight: "700",
  },
  loadingSub: {
    fontSize: rfs(14),
    color: theme.colors.muted,
  },
  water: {
    width: "100%",
    height: rs(130),
    borderRadius: rs(20),
    overflow: "hidden",
  },
  statusCard: {
    alignItems: "center",
    gap: rs(6),
  },
  durationHero: {
    fontSize: rfs(54),
    lineHeight: rfs(56),
    fontWeight: "700",
    color: theme.colors.primary,
    letterSpacing: -2.8,
    textAlign: "center",
  },
  statusText: {
    fontSize: rfs(13),
    color: theme.colors.muted,
    letterSpacing: 0.3,
    fontWeight: "600",
  },
  quickActions: {
    marginTop: rs(4),
    flexDirection: "row",
    gap: rs(8),
  },
  quickButton: {
    minWidth: rs(88),
    borderRadius: 999,
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    backgroundColor: theme.colors.surfaceSoft,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: rs(5),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickButtonText: {
    fontSize: rfs(12),
    color: theme.colors.primary,
    fontWeight: "600",
  },
  button: {
    marginTop: rs(6),
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: rs(16),
    paddingVertical: rs(8),
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: rfs(13),
  },
});

export default styles;
