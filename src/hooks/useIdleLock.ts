import { useEffect, useRef } from "react";
import { useStore } from "../context/StoreContext";

export function useIdleLock(opts?: { idleMs?: number }) {
  const { currentUser, authLocked, lock, touchActivity } = useStore();
  const idleMs = opts?.idleMs ?? 5 * 60 * 1000;
  const lastActiveRef = useRef<number | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const mark = () => {
      lastActiveRef.current = Date.now();
      touchActivity();
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "wheel",
    ];

    for (const ev of events) window.addEventListener(ev, mark, { passive: true });
    mark();

    const t = window.setInterval(() => {
      if (!currentUser) return;
      if (authLocked) return;
      if (lastActiveRef.current === null) return;
      if (Date.now() - lastActiveRef.current >= idleMs) lock("idle");
    }, 10_000);

    return () => {
      for (const ev of events) window.removeEventListener(ev, mark);
      window.clearInterval(t);
    };
  }, [authLocked, currentUser, idleMs, lock, touchActivity]);
}
