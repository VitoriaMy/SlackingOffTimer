import { Navigate, Link } from "react-router-dom";
import { usei18n } from "@/hooks/usei18n";
import { Layout } from "@/components/layout";
import { Animations } from "@/components/animations";
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
        },
      }}
    >
      <div className={styles.page}>
        <Animations />
        <StatusCard />
      </div>
      <div>
        <div><Link to="/animations">动画控制演示</Link></div>
        <div><Link to="/components">组件展示</Link></div>
      </div>
    </Layout>
  );
}
