import { View } from "react-native"
import { Link } from "expo-router"

export default function devNav() {
    return <View>
        <Link href="/dev" style={{ marginBottom: 10 }}>Dev</Link>
        <View><Link href="/animations">动画控制演示</Link></View>
        <View><Link href="/components">组件展示</Link></View>
        <View><Link href="/status">状态页面</Link></View>
    </View>
}