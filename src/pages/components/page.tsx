import { MoodSwitch } from "@/components/MoodSwitch";
import { Timer } from "@/components/timer";
import { Layout } from "@/components/layout";

export function ComponentsPage() {
    return <Layout
        header={{
            title: '组件展示'
        }}
    >
        <div>
            <p> 切换开关 </p>
            <MoodSwitch checked={true} onClick={() => { }} />
            <MoodSwitch checked={false} onClick={() => { }} />
        </div>

        <div>
            <p> 时间选择 </p>
            <Timer 
                maxTime="23:00"
                minTime="08:00"
                value="12:00"
                onChange={(value) => {
                    console.log('Selected time:', value);
                }}
            />
        </div>
    </Layout>
}