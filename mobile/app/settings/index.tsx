import { Layout } from "@/components/layout";
import { Text } from "react-native";
import { SettingRow } from '@/components/SettingRow';
import { MoodSwitch } from "@/components/MoodSwitch";
// 当前运行环境变量是开发环境还是生产环境


export default function HomePage() {

 

  return (
    <Layout
      header={{
        title: "trends",
      }}
    >
      <SettingRow label="通知设置"
        more={
          <MoodSwitch
            checked={true}
            onPress={() => { }}
          />
        }
      >
        <Text>开启</Text>
      </SettingRow>
          <SettingRow label="通知设置"
        more={
          <MoodSwitch
            checked={false}
            onPress={() => { }}
          />
        }
      >
        <Text>开启</Text>
      </SettingRow>
    </Layout>
  );
}

