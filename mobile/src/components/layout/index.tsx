import { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { rfs } from "@/src/core/responsive";
import { theme } from "@/src/core/theme";
import styles from "./index.styles";

type HeaderAction = {
  children: ReactNode;
  onPress: () => void;
};

type PageLayoutProps = {
  title?: string;
  leftAction?: HeaderAction;
  rightAction?: HeaderAction;
  showBack?: boolean;
  children: ReactNode;
};

export function PageLayout({ title, leftAction, rightAction, showBack = true, children }: PageLayoutProps) {
  const router = useRouter();
  const showHeader = Boolean(title || leftAction || rightAction);
  const shouldShowBack = Boolean(showHeader && title && showBack && !leftAction);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showHeader ? (
          <View style={styles.header}>
            {leftAction ? (
              <Pressable style={[styles.navLink, styles.headerLeft]} onPress={leftAction.onPress}>
                {leftAction.children}
              </Pressable>
            ) : shouldShowBack ? (
              <Pressable style={[styles.navLink, styles.headerLeft]} onPress={() => router.push("/(tabs)/index")}>
                <Ionicons name="arrow-back" size={rfs(22)} color={theme.colors.primary} />
              </Pressable>
            ) : null}

            {title ? <Text style={styles.headerTitle}>{title}</Text> : null}

            {rightAction ? (
              <Pressable style={[styles.navLink, styles.headerRight]} onPress={rightAction.onPress}>
                {rightAction.children}
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
