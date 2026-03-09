import { Layout } from "@/components/layout";
import styles from "./style.module.scss";
import { useSettingsStore } from "@/store/settingsStore";

export function ConfigPage() {
    const { configured, schedule, language } = useSettingsStore();
    
    return <Layout
        header={{
            title: '配置'
        }}
    >
        <button className={styles.button}
         onClick={() => {
            console.log('Current configuration:', {
                configured,
                schedule,
                language
            });
         }}
        > 输出当前配置 </button>
    </Layout>
}