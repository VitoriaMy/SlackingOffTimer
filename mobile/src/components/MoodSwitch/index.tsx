import { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import Svg, { Circle, Defs, Mask, Path, Rect } from "react-native-svg";
import styles from "./index.style";
import { rs } from "@/core/responsive";
import { theme } from "@/core/theme";


type MoodSwitchProps = {
  checked: boolean;
  onClick?: () => void;
  onPress?: () => void;
  disabled?: boolean;
};

function FaceIcon({ happy }: { happy: boolean }) {
  const maskId = useRef(
    `mood-switch-face-${Math.random().toString(36).slice(2)}`,
  );

  const keyPath = useMemo(() => {
    if (happy) {
      return "M11 14 A3 3 0 0 1 8.4 12.5";
    }
    return "M11 14 A3 3 0 0 0 8.4 15.5";
  }, [happy]);

  const fillColor = happy ? theme.colors.primary : theme.colors.font; // 金色表示开心，银色表示不开心

  return (
    <Svg style={styles.faceIcon} viewBox="0 0 22 22">
      <Defs>
        <Mask
          id={maskId.current}
          x="0"
          y="0"
          width="22"
          height="22"
          maskUnits="userSpaceOnUse"
        >
          <Rect x="0" y="0" width="22" height="22" fill="#fff" />
          <Circle cx="7.7" cy="8.4" r="1.4" fill="#000" />
          <Circle cx="14.3" cy="8.4" r="1.4" fill="#000" />
          <Path
            d={keyPath}
            stroke="#000"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={keyPath}
            stroke="#000"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
            transform="matrix(-1 0 0 1 22 0)"
          />
        </Mask>
      </Defs>
      <Circle
        cx="11"
        cy="11"
        r="10"
        fill={fillColor}
        mask={`url(#${maskId.current})`}
      />
    </Svg>
  );
}

export const MoodSwitch = memo(function MoodSwitch({
  checked,
  onPress,
  disabled,
}: MoodSwitchProps) {
  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: checked ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [checked, progress]);

  const translateX = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-rs(10), rs(27)],
      }),
    [progress],
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      style={styles.switch}
    >
      <View style={[styles.lineIcon, checked && styles.lineIconChecked]} />
      <Animated.View
        style={[styles.faceIconView, { transform: [{ translateX }] }]}
      >
        <FaceIcon
          happy={checked}
        />
      </Animated.View>
    </Pressable>
  );
});
