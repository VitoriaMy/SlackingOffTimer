import { MoodSwitch } from "@/components/MoodSwitch";


export function ComponentsPage() {
    return <div>
        <MoodSwitch checked={true} onClick={() => { }} />
        <MoodSwitch checked={false} onClick={() => { }} />
    </div>
}