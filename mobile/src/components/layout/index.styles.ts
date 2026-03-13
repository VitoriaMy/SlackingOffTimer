import { StyleSheet } from "react-native";
import { rfs, rs } from "@/core/responsive";
import { theme } from "@/core/theme";

const styles = StyleSheet.create({
  page: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    paddingHorizontal: rs(32),
    paddingBottom: rs(24),



  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: rs(44),
    color: theme.colors.primary,
    position: "relative",
  },
  navLink: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: '-50%' }],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: rs(28),
    height: rs(28),
    fontSize: rfs(22),
    color: theme.colors.primary,
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
  headerTitle: {
    fontSize: rfs(18),
    fontWeight: "600",
    textAlign: "center",
  }

});

export default styles;
