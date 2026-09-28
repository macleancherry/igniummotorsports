import { useEffect, useState } from "react";

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}D ${hours}H ${minutes}M`;
  if (hours > 0) return `${hours}H ${minutes}M`;
  return `${minutes}M`;
}

function computeLabel(targetIso: string | undefined): string | null {
  if (!targetIso) return null;
  const remaining = new Date(targetIso).getTime() - Date.now();
  return remaining > 0 ? formatCountdown(remaining) : null;
}

/**
 * Counts down to `targetIso`. Ticks every second normally, or every 60s
 * under prefers-reduced-motion so the value still advances without visible
 * animation. Returns null once there's no target or it has passed.
 */
export function useCountdown(targetIso: string | undefined): string | null {
  const [label, setLabel] = useState<string | null>(() => computeLabel(targetIso));
  const [prevTargetIso, setPrevTargetIso] = useState(targetIso);

  if (targetIso !== prevTargetIso) {
    setPrevTargetIso(targetIso);
    setLabel(computeLabel(targetIso));
  }

  useEffect(() => {
    if (!targetIso) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tickMs = reduceMotion ? 60_000 : 1000;

    const interval = setInterval(() => {
      setLabel(computeLabel(targetIso));
    }, tickMs);

    return () => clearInterval(interval);
  }, [targetIso]);

  return label;
}
