import Icons from '@expo/vector-icons/AntDesign';
import { Layout } from "@/components/layout";
import { rs } from "@/core/responsive";
import DevNav from "./_devNav";
import { StatusCard } from "@/components/statusCard";

// 当前运行环境变量是开发环境还是生产环境
const isDev = __DEV__;


export default function HomePage() {
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
        title: "Home",
      }}
    >
      <StatusCard />
      {isDev ? <DevNav /> : null}
    </Layout>
  );
}

