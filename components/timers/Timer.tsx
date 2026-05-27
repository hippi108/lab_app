'use client';
import { useEffect, useState } from 'react';

export function Timer({ durationSeconds }: { durationSeconds: number }) {
  const [seconds, setSeconds] = useState(durationSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return;
    }
    const timer = setInterval(() => {
      setSeconds((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Timer</p>
          <p className="text-2xl font-semibold text-slate-900">{minutes}:{remainingSeconds.toString().padStart(2, '0')}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            onClick={() => setRunning(!running)}
          >
            {running ? '停止' : '開始'}
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            onClick={() => {
              setSeconds(durationSeconds);
              setRunning(false);
            }}
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  );
}
