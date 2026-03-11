import { Tabs } from "expo-router";
import { t } from "@/src/core/text";
import { useSettingsStore } from "@/src/store/settingsStore";

export default function TabsLayout() {
  const { language } = useSettingsStore();
  const text = t(language);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: text.tabs.home }} />
      <Tabs.Screen name="status" options={{ title: text.tabs.status }} />
      <Tabs.Screen name="trends" options={{ title: text.tabs.trends }} />
      <Tabs.Screen name="settings" options={{ title: text.tabs.settings }} />
    </Tabs>
  );
}
