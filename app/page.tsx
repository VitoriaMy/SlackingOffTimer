"use client";

import { useEffect, useMemo, useState } from "react";
import { computeRatio, formatMinutes, isWorkWindow } from "@/lib/time";
import { loadSchedule, loadStats, saveSchedule, upsertTodayStat } from "@/lib/storage";
import { DailyStat, WorkSchedule, defaultSchedule } from "@/lib/types";

const dateKey = (d: Date): string => d.toISOString().slice(0, 10);

export default function HomePage() {
  const [schedule, setSchedule] = useState<WorkSchedule>(defaultSchedule);
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  useEffect(() => {
    setSchedule(loadSchedule());
    setStats(loadStats());
  }, []);

  useEffect(() => {
    const onBlur = () => stopSession();
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  });

  const today = dateKey(new Date());
  const todayStat = stats.find((s) => s.date === today) ?? { date: today, fishMinutes: 0, workMinutes: 480 };
  const ratio = computeRatio(todayStat.fishMinutes, todayStat.workMinutes);

  const sevenDays = useMemo(() => {
    return [...stats].slice(-7);
  }, [stats]);

  const startSession = () => {
    if (isTracking) return;
    if (!isWorkWindow(new Date(), schedule)) return;
    setSessionStart(Date.now());
    setIsTracking(true);
  };

  const stopSession = () => {
    if (!isTracking || !sessionStart) return;
    const durationMinutes = Math.max(1, Math.round((Date.now() - sessionStart) / 60000));
    const updated = upsertTodayStat({
      ...todayStat,
      fishMinutes: todayStat.fishMinutes + durationMinutes
    });
    setStats(updated);
    setSessionStart(null);
    setIsTracking(false);
  };

  const save = () => {
    saveSchedule(schedule);
    alert("已保存工作制度");
  };

  return (
    <main>
      <h1>摸鱼计时器（在线 MVP）</h1>
      <p className="small">说明：Web 版本无法监听手机解锁，当前以“页面活跃会话”近似统计。</p>

      <section className="card">
        <h2>今日概览</h2>
        <p>今日摸鱼：{formatMinutes(todayStat.fishMinutes)}</p>
        <p>摸鱼占比：{ratio}%</p>
        <p>状态：{isTracking ? "计时中" : "待机"}</p>
        <div className="row">
          <button onClick={startSession}>开始摸鱼会话</button>
          <button className="secondary" onClick={stopSession}>结束会话</button>
        </div>
      </section>

      <section className="card">
        <h2>工作制度设置</h2>
        <div className="row">
          <label>
            上班时间
            <input
              type="time"
              value={schedule.startTime}
              onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
            />
          </label>
          <label>
            下班时间
            <input
              type="time"
              value={schedule.endTime}
              onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
            />
          </label>
        </div>
        <div className="row">
          <label>
            午休开始
            <input
              type="time"
              value={schedule.lunchStart ?? ""}
              onChange={(e) => setSchedule({ ...schedule, lunchStart: e.target.value })}
            />
          </label>
          <label>
            午休结束
            <input
              type="time"
              value={schedule.lunchEnd ?? ""}
              onChange={(e) => setSchedule({ ...schedule, lunchEnd: e.target.value })}
            />
          </label>
        </div>
        <button onClick={save}>保存设置</button>
      </section>

      <section className="card">
        <h2>近 7 天趋势</h2>
        {sevenDays.length === 0 ? (
          <p className="small">暂无数据，先开始一次会话。</p>
        ) : (
          <ul>
            {sevenDays.map((item) => (
              <li key={item.date}>
                {item.date}：{formatMinutes(item.fishMinutes)}（{computeRatio(item.fishMinutes, item.workMinutes)}%）
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
