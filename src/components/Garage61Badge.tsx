import { useEffect, useState } from "react";
import { getGarage61Status } from "../lib/api";

const POLL_INTERVAL_MS = 60_000;

export function Garage61Badge() {
  const [activeNames, setActiveNames] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const poll = () => {
      getGarage61Status().then((status) => {
        if (mounted) setActiveNames(status.activeDrivers.map((driver) => driver.name));
      });
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (activeNames.length === 0) return null;

  return (
    <div className="status-pill live" title={activeNames.join(", ")}>
      Racing now: {activeNames.join(", ")}
    </div>
  );
}
