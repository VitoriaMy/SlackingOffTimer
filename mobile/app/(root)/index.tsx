import Icons from '@expo/vector-icons/AntDesign';
import { Layout } from "@/components/layout";
import { rs } from "@/core/responsive";
import { useCurrentSlackingDuration } from "@/hooks/useCurrentSlackingDuration";
import { useIsWorkTime } from "@/hooks/useIsWorkTime";
import { useSlackRecord } from "@/hooks/useSlackRecord";
import { usei18n } from "@/hooks/usei18n";
import { StatusCard } from "@/components/statusCard";
import { Animations } from "@/components/animations";
import { Text, View } from "react-native";
import styles from "@/styles/home";
import { Redirect } from "expo-router";
import { useSettingsStore } from "@/store";

// 当前运行环境变量是开发环境还是生产环境
const isDev = __DEV__;


export default function HomePage() {
  const i18n = usei18n();
  const { configured, isLoading } = useSettingsStore();
  const { durationText, ratio } = useCurrentSlackingDuration();
  const isWorkTime = useIsWorkTime();
  const { currentSwitchState } = useSlackRecord();

  if (!isLoading && !configured) {
    return <Redirect href="/settings" />;
  }

  const checked = currentSwitchState === 1;
  const statusText = !isWorkTime ? i18n("offWork") : checked ? i18n("tracking") : i18n("standby");
  const isAnimationRunning = checked && isWorkTime;

  return (
    <Layout
      header={{
        left: {
          to: "/trends",
          children: <Icons name="bar-chart" size={rs(24)} color="black" />
        },
        right: {
          to: "/settings",
          children: <Icons name="setting" size={rs(24)} color="black" />
        },
        title: i18n("home"),
      }}
    >
      <View style={styles.home}>
        {isLoading ? <Text>{i18n("loading")}</Text> : null}
        <Animations isRunning={isAnimationRunning} progress={ratio} />
        <StatusCard
          durationText={durationText}
          statusText={statusText}
        />
      </View>
      {/* {isDev ? <DevNav /> : null} */}
    </Layout>
  );
}

