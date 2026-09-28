import { INSTAGRAM_PROFILE_URL } from "../data/social-posts";
import { nextRace } from "../data/schedule";
import { useCountdown } from "../hooks/useCountdown";

export function TimingStrip() {
  const countdown = useCountdown(nextRace?.live ? undefined : nextRace?.startTime);

  if (nextRace?.live) {
    return (
      <div className="timing-strip">
        <div className="timing-strip-inner">
          <span className="timing-strip-dot" aria-hidden="true" />
          <span>
            LIVE NOW · {nextRace.seriesLabel} · {nextRace.event}
            {nextRace.watchUrl && (
              <>
                {" · "}
                <a href={nextRace.watchUrl} target="_blank" rel="noopener noreferrer">
                  Watch on {nextRace.watchLabel ?? "stream"} ↗
                </a>
              </>
            )}
          </span>
        </div>
      </div>
    );
  }

  if (nextRace && countdown) {
    return (
      <div className="timing-strip">
        <div className="timing-strip-inner">
          <span>
            NEXT · {nextRace.seriesLabel} · {nextRace.event} · {countdown}
            {nextRace.watchUrl && (
              <>
                {" · "}
                <a href={nextRace.watchUrl} target="_blank" rel="noopener noreferrer">
                  Watch on {nextRace.watchLabel ?? "stream"} ↗
                </a>
              </>
            )}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="timing-strip">
      <div className="timing-strip-inner">
        <span>
          OFF-SEASON · FOLLOW THE TEAM ON{" "}
          <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noopener noreferrer">
            INSTAGRAM ↗
          </a>
        </span>
      </div>
    </div>
  );
}
