"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  target: Date;
  label?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown({ target, label = "starts in" }: CountdownProps) {
  const [diff, setDiff] = useState<number>(target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setDiff(target.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (diff <= 0) {
    return (
      <span className="font-mono text-green-400 text-sm">
        <span className="text-zinc-500">// </span>live now
      </span>
    );
  }

  const totalSeconds = Math.floor(diff / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return (
    <div className="font-mono text-sm space-y-1">
      <div className="text-zinc-500 text-xs">{"// " + label}</div>
      <div className="flex items-center gap-1 text-zinc-200">
        {d > 0 && (
          <>
            <span className="text-purple-400">{pad(d)}</span>
            <span className="text-zinc-600">d </span>
          </>
        )}
        <span className="text-green-400">{pad(h)}</span>
        <span className="text-zinc-600">h </span>
        <span className="text-green-400">{pad(m)}</span>
        <span className="text-zinc-600">m </span>
        <span className="text-green-400">{pad(s)}</span>
        <span className="text-zinc-600">s</span>
      </div>
    </div>
  );
}
