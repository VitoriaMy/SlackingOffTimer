import { MoodSwitch } from "@/components/MoodSwitch";
import { Layout } from "@/components/layout";

export function ComponentsPage() {
    return <Layout
        header={{
            title: '组件展示'
        }}
    >
        <MoodSwitch checked={true} onClick={() => { }} />
        <MoodSwitch checked={false} onClick={() => { }} />
    </Layout>
}