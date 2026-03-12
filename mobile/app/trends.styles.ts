import { StyleSheet } from "react-native";
import { rs } from "@/core/responsive";
import { theme } from "@/core/theme";

const styles = StyleSheet.create({
  container: {
    gap: rs(18),
    paddingTop: rs(6),
  },
  cards: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rs(10),
    marginBottom: rs(30),
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: rs(20),
  },
});

export default styles;
