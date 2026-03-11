import { Pressable, Text } from "react-native";
import styles from "./index.styles";

type BottonSwitchProps = {
  checked: boolean;
  label: string;
  onPress?: () => void;
};

export function BottonSwitch({ checked, label, onPress }: BottonSwitchProps) {
  const chars = label.split("");

  return (
    <Pressable style={[styles.button, checked ? styles.checked : null]} onPress={onPress}>
      <Text style={[styles.label, checked ? styles.labelChecked : null]}>
        {chars.map((char, index) => (
          <Text key={`${char}-${index}`} style={[styles.char, checked ? styles.labelChecked : null]}>
            {char}
          </Text>
        ))}
      </Text>
    </Pressable>
  );
}
