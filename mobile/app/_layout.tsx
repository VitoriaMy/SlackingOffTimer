import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SettingsStoreProvider } from "@/store/settingsStore";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsStoreProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SettingsStoreProvider>
    </GestureHandlerRootView>
  );
}
