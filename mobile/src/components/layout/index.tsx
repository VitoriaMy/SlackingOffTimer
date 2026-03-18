import { ReactNode, useMemo } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import Icons from '@expo/vector-icons/AntDesign';
import { rfs } from "@/core/responsive";
import { theme } from "@/core/theme";
import styles from "./index.styles";

interface NavProps {
  children: React.ReactNode;
  to: string;
}

type LayoutProps = {
  // title?: string;
  // leftAction?: HeaderAction;
  // rightAction?: HeaderAction;
  children: ReactNode;
  header?: {
    showLeft?: boolean;
    left?: NavProps;
    title?: React.ReactNode;
    right?: NavProps;
  }
};

export function Layout({
  header: {
    showLeft = true,
    left,
    title,
    right
  } = {},
  children,
}: LayoutProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        {showLeft ? (
          <Link style={[styles.navLink, styles.left]}
            href={left?.to || "/"}
          >
            {left?.children || <Icons name="left" size={rfs(22)} color={theme.colors.primary} />}
          </Link>
        ) : (
          <View style={[styles.navLink, styles.left]} />
        )}
        <Text style={styles.headerTitle} >{title}</Text>
        {
          right ? (<Link style={[styles.navLink, styles.right]}
            href={right.to}
          >
            {right.children}
          </Link>) : null
        }
      </View>
      {children}
    </SafeAreaView>
  );
}
