const HOTSPOTS = [
  { number: 1, cx: 95, cy: 58 },
  { number: 2, cx: 230, cy: 48 },
  { number: 3, cx: 415, cy: 52 },
  { number: 4, cx: 280, cy: 40 },
];

export function LiveryDiagram() {
  return (
    <svg className="livery-svg" viewBox="0 0 480 180" aria-hidden="true" focusable="false">
      <path
        d="M20,140 L20,112 Q20,98 38,92 L88,70 Q125,36 185,34 L315,34 Q372,36 405,70 L448,92 Q460,98 460,112 L460,140"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <line x1="20" y1="140" x2="460" y2="140" stroke="currentColor" strokeWidth="3" />
      <circle cx="110" cy="140" r="26" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="370" cy="140" r="26" fill="none" stroke="currentColor" strokeWidth="3" />
      <line x1="150" y1="60" x2="330" y2="60" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      {HOTSPOTS.map((spot) => (
        <g key={spot.number}>
          <circle cx={spot.cx} cy={spot.cy} r="11" fill="var(--ignium)" />
          <text x={spot.cx} y={spot.cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink-900)">
            {spot.number}
          </text>
        </g>
      ))}
    </svg>
  );
}
