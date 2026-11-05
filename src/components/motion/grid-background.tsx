"use client";

import { useEffect, useRef, useState } from "react";

// 격자 칸 몇 개가 무작위 자리에서 옅게 떴다 사라짐, 사라질 때마다 자리를 옮김
const CELL = 40;
const COUNT = 40;

type GridSize = { cols: number; rows: number };
type Cell = { id: number; col: number; row: number };

function randomSpot({ cols, rows }: GridSize) {
  return {
    col: Math.floor(Math.random() * cols),
    row: Math.floor(Math.random() * rows),
  };
}

export function GridBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const size = useRef<GridSize>({ cols: 0, rows: 0 });
  const [cells, setCells] = useState<Cell[]>([]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      size.current = {
        cols: Math.ceil(entry.contentRect.width / CELL),
        rows: Math.ceil(entry.contentRect.height / CELL),
      };
      // 처음 한 번만 뿌리고, 이후엔 각 칸이 사라질 때 새 크기 기준으로 옮김
      setCells((prev) =>
        prev.length > 0
          ? prev
          : Array.from({ length: COUNT }, (_, id) => ({
              id,
              ...randomSpot(size.current),
            })),
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const move = (id: number) =>
    setCells((prev) =>
      prev.map((cell) =>
        cell.id === id ? { ...cell, ...randomSpot(size.current) } : cell,
      ),
    );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 [--line:color-mix(in_oklab,var(--foreground)_5.5%,transparent)]"
      style={{
        maskImage:
          "radial-gradient(72% 64% at 50% 48%, black, rgba(0,0,0,0.72), transparent)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)",
          backgroundSize: `${CELL}px ${CELL}px`,
          backgroundPosition: "-1px -1px",
        }}
      />
      {cells.map((cell) => {
        const duration = 4 + (cell.id % 5) * 0.7;
        // 음수 지연으로 처음부터 여러 칸이 서로 다른 단계에 있게
        const delay = -((cell.id * 0.53) % duration);
        return (
          <div
            key={cell.id}
            onAnimationIteration={() => move(cell.id)}
            className="absolute size-[39px] bg-(--line) motion-reduce:animate-none!"
            style={{
              left: cell.col * CELL,
              top: cell.row * CELL,
              animation: `grid-cell ${duration}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
