import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { SettingsStoreProvider } from "@/store/settingsStore";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#2a2a3c" />
      {/* <SettingsStoreProvider> */}
        <Stack screenOptions={{ headerShown: false }} />
      {/* </SettingsStoreProvider> */}
    </GestureHandlerRootView>
  );
}
