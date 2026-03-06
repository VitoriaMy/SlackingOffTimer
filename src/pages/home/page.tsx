import { Navigate } from "react-router-dom";
import { usei18n } from "@/hooks/usei18n";
import { Layout } from "@/components/layout";
import { HourglassSvg } from "@/components/HourglassSvg";
import { useSettingsStore } from "@/store/settingsStore";
import { SettingOutlined, LineChartOutlined } from "@ant-design/icons";
import { StatusCard } from "./statusCard";
import styles from "./page.module.scss";

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
          children: <LineChartOutlined />,
          to: "/trends",
        },
        right: {
          children: <SettingOutlined />,
          to: "/settings",
        }
      }}
    >
      <div className={styles.page}>
        <div className={styles.hourglassWrap}>
          <HourglassSvg
            percent={15}
            width={280}
            height={360}
            className={styles.hourglass}
          />
        </div>
        <StatusCard />
      </div>
    </Layout>
  );
}
