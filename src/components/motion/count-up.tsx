"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  durationMs?: number;
  className?: string;
}

// 이전 값에서 새 값으로 굴러가는 숫자
export function CountUp({ value, durationMs = 700, className }: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  const previous = useRef(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      previous.current = value;
      setDisplay(value);
      return;
    }

    const controls = animate(previous.current, value, {
      duration: durationMs / 1000,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
      onComplete: () => {
        previous.current = value;
      },
    });

    return () => controls.stop();
  }, [value, durationMs, reduceMotion]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
