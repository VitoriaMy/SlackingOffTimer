import { memo } from "react";
import {
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import styles from "./index.style";

interface CardProps {
  label: string;
  value: string;
  style?: StyleProp<ViewStyle>;
}

export const Card = memo(function Card({ label, value, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={[styles.label]}>{label}</Text>
      <Text style={[styles.value]}>{value}</Text>
    </View>
  );
});
