import { StyleSheet } from "react-native";
import { rfs, rs } from "@/src/core/responsive";
import { theme } from "@/src/core/theme";

const styles = StyleSheet.create({
  scrollContent: {
    gap: rs(16),
  },
  section: {
    gap: rs(8),
  },
  sectionTitle: {
    fontSize: rfs(14),
    fontWeight: "700",
    color: theme.colors.text,
  },
  tabs: {
    flexDirection: "row",
    gap: rs(8),
    marginBottom: rs(2),
  },
  tab: {
    backgroundColor: "#eef2f7",
    borderRadius: 999,
    paddingHorizontal: rs(10),
    paddingVertical: rs(6),
  },
  tabActive: {
    backgroundColor: theme.colors.accent,
  },
  tabText: {
    color: theme.colors.subtle,
    fontSize: rfs(12),
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  listContent: {
    gap: rs(8),
  },
  li: {
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
  liCol: {
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    backgroundColor: "#f5f7fa",
    gap: rs(6),
  },
  liHead: {
    fontSize: rfs(13),
    color: theme.colors.text,
    fontWeight: "700",
  },
  summaryLine: {
    fontSize: rfs(12),
    color: theme.colors.subtle,
  },
  empty: {
    borderRadius: theme.radius.item,
    backgroundColor: "#f5f7fa",
    padding: rs(12),
    color: theme.colors.muted,
    fontSize: rfs(13),
  },
  recordTime: {
    color: theme.colors.text,
    fontSize: rfs(12),
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: rs(8),
    paddingVertical: rs(2),
    backgroundColor: "#e7ecf3",
    color: theme.colors.primary,
    fontSize: rfs(12),
    fontWeight: "700",
  },
});

export default styles;
