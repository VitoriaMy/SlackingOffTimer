import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** 动画帧控制 Hook
 * @description 通过 requestAnimationFrame 实现动画播放控制
 * @param callback 回调函数，每一帧都会调用一次，参数为当前运行周期的进度百分比整数（0-99）
 * @param duration 动画持续时间，单位为毫秒
 */
export function useAnimationFrame(
  callback: (spendTime: number) => void,
  duration: number,
) {
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const animate = useCallback(
    (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }
      const spendTime = time - startTimeRef.current;
      const progress = Math.min(Math.round((spendTime / duration) * 100), 100);
      callback(spendTime);
      if (progress < 100) {
        requestRef.current = requestAnimationFrame(animate);
      }
    },
    [callback, duration],
  );
}


export function useTotalFrames(src: string) {
  const [totalFrames, setTotalFrames] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await fetch(src).then((r) => r.json());
      // Lottie 标准：总帧数 = op - ip
      const ip = Number(data?.ip ?? 0);
      const op = Number(data?.op ?? 0);
      if (alive) setTotalFrames(Math.max(0, Math.floor(op - ip)));
    })();
    return () => {
      alive = false;
    };
  }, [src]);

  return totalFrames;
}