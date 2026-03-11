import { Pressable, View } from "react-native";
import styles from "./index.styles";

type MoodSwitchProps = {
  checked: boolean;
  onPress?: () => void;
};

export function MoodSwitch({ checked, onPress }: MoodSwitchProps) {
  return (
    <Pressable style={styles.switch} onPress={onPress}>
      <View style={styles.line} />
      <View style={[styles.face, checked ? styles.faceChecked : null]} />
    </Pressable>
  );
}
