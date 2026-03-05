import { Navigate } from "react-router-dom";
import { usei18n } from "@/hooks/usei18n";
import { Layout } from "@/components/layout";
import { HourglassSvg } from "@/components/HourglassSvg";
import { useSettingsStore } from "@/store/settingsStore";
import { SettingOutlined, BarChartOutlined } from "@ant-design/icons";
import { StatusCard } from "./statusCard";

export function HomePage() {
  const i18n = usei18n();
  const { configured } = useSettingsStore();


  if (!configured) {
    return <Navigate to="/settings" replace />;
  }


  return (
    <Layout
      header={{
        left: {
          children: <SettingOutlined />,
          to: "/settings",
        },
        title: i18n("home"),
        right: {
          children: <BarChartOutlined />,
          to: "/trends",
        }
      }}
    >
      <HourglassSvg
        percent={15}
      />
      <StatusCard />
    </Layout>
  );
}
