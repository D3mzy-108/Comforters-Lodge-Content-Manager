"use client";
import { useRef, useState } from "react";

export function useToastLike() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const show = (text: string) => {
    setMsg(text);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 3200);
  };

  const node = msg ? (
    <div className="fixed bottom-5 right-5 z-50 max-w-[90vw] rounded-2xl border bg-background px-4 py-3 shadow-xl">
      <div className="text-sm">{msg}</div>
    </div>
  ) : null;

  return { show, node };
}
