import { memo, type ReactNode } from "react";
import {
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import styles from "./index.style";

interface SettingRowProps {
  label: string;
  children: ReactNode;
  more?: ReactNode;
}

export const SettingRow = memo(function SettingRow({
  label,
  children,
  more,
}: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.rowHead}>
        <Text style={styles.label}>
          {label}
        </Text>
        {more ? <View style={styles.more}>{more}</View> : null}
      </View>
      <View style={styles.control}>{children}</View>
    </View>
  );
});
