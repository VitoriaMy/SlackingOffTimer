import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SettingsStoreProvider } from "@/store";
import { RootLayoutContent } from "@/components/RootLayoutContent";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <SettingsStoreProvider>
        <RootLayoutContent>
          <Stack screenOptions={{ headerShown: false }} />
        </RootLayoutContent>
      </SettingsStoreProvider>
    </GestureHandlerRootView>
  );
}
