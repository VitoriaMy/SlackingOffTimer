import { ReactNode } from "react";
import { Text, View } from "react-native";
import styles from "./index.styles";

type SettingRowProps = {
  label: string;
  children: ReactNode;
  more?: ReactNode;
};

export function SettingRow({ label, children, more }: SettingRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        {more ? <View>{more}</View> : null}
      </View>
      <View>{children}</View>
    </View>
  );
}
