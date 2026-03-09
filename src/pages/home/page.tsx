import { Navigate, Link } from "react-router-dom";
import { usei18n } from "@/hooks/usei18n";
import { Layout } from "@/components/layout";
import { Animations } from "@/components/animations";
import { useSettingsStore } from "@/store/settingsStore";
import { SettingOutlined, LineChartOutlined } from "@ant-design/icons";
import { StatusCard } from "./statusCard";
import styles from "./page.module.scss";

// 当前运行环境变量是开发环境还是生产环境
const isDev = import.meta.env.DEV;

export function HomePage({
  recordSlackSwitch,
  currentSwitchState,
}: {
  recordSlackSwitch: () => void;
  currentSwitchState: number;
}) {
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
        <Animations isRunning={currentSwitchState === 1} />
        <StatusCard
          recordSlackSwitch={recordSlackSwitch}
          currentSwitchState={currentSwitchState}
        />
      </div>
      {
        isDev ? <div>
          <div><Link to="/animations">动画控制演示</Link></div>
          <div><Link to="/components">组件展示</Link></div>
          <div><Link to="/status">状态页面</Link></div>
        </div> : null
      }

    </Layout>
  );
}
