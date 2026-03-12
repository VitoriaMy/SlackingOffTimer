import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: rs(20),
    paddingBottom: rs(20),
    gap: rs(14),
  },
  header: {
    height: rs(44),
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  navLink: {
    position: "absolute",
    top: "50%",
    width: rs(28),
    height: rs(28),
    marginTop: -rs(14),
    alignItems: "center",
    justifyContent: "center",
  },
  headerLeft: {
    left: 0,
  },
  headerRight: {
    right: 0,
  },
  headerTitle: {
    fontSize: rfs(18),
    color: theme.colors.primary,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
});

export default styles;
