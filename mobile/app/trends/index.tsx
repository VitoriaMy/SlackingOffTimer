import Icons from '@expo/vector-icons/AntDesign';
import { Layout } from "@/components/layout";
import { rs } from "@/core/responsive";

// 当前运行环境变量是开发环境还是生产环境


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
      123
    </Layout>
  );
}

