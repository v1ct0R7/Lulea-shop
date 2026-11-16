/**
 * Ilustrim dekorativ me vija (në stilin e logos) – përdoret si placeholder kur produkti s’ka foto.
 * `variant` ndryshon pak përbërjen që kartat të mos duken identike.
 */
export default function FloralArt({ color = '#7d6560', variant = 0, className, style }) {
  const v = Math.abs(variant) % 3;
  return (
    <svg viewBox="0 0 200 240" className={className} style={style} fill="none" stroke={color}
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* kërcejtë */}
      <path d="M100 230 C98 190 96 160 92 130" />
      <path d="M100 230 C104 190 110 160 120 128" />
      <path d="M100 230 C100 185 100 150 100 115" />
      {/* letra mbështjellëse */}
      <path d="M70 150 L100 228 L130 150 Z" fill={color} fillOpacity="0.06" />
      <path d="M62 140 L100 230 L80 140" opacity="0.6" />
      <path d="M138 140 L100 230 L122 140" opacity="0.6" />
      {/* fjongo */}
      <path d="M90 190 q10 6 20 0 M100 192 q-14 10 -18 26 M100 192 q12 12 14 28" />
      {/* gjethe */}
      <path d="M92 150 q-26 -6 -34 -24 q22 2 34 24 Z M58 126 L92 150" />
      <path d="M110 148 q26 -10 30 -30 q-22 6 -30 30 Z M140 118 L110 148" />
      {/* lulja qendrore */}
      <g transform="translate(100 92)">
        {[0, 72, 144, 216, 288].map((r) => (
          <path key={r} transform={`rotate(${r})`} d="M0 0 C-12 -10 -10 -28 0 -30 C10 -28 12 -10 0 0" fill={color} fillOpacity="0.05" />
        ))}
        <circle r="6" fill={color} fillOpacity="0.15" />
        <circle r="2" />
      </g>
      {/* lule anësore */}
      <g transform={`translate(${v === 1 ? 64 : 68} 112)`}>
        <path d="M0 0 c-6 -14 4 -24 12 -18 c8 -8 18 2 12 14 c6 10 -6 18 -12 10 c-8 8 -18 -2 -12 -6Z" fill={color} fillOpacity="0.05" />
        <circle cx="6" cy="-4" r="3" />
      </g>
      <g transform={`translate(${v === 2 ? 132 : 128} 108)`}>
        <path d="M0 0 c-6 -14 4 -24 12 -18 c8 -8 18 2 12 14 c6 10 -6 18 -12 10 c-8 8 -18 -2 -12 -6Z" fill={color} fillOpacity="0.05" />
        <circle cx="6" cy="-4" r="3" />
      </g>
      {/* sytha */}
      <path d="M86 70 q-6 -22 6 -32 q8 14 -6 32 Z" />
      <path d="M120 64 q4 -24 18 -28 q0 18 -18 28 Z" />
      {v !== 0 && <path d="M100 58 q-4 -26 4 -40 q8 18 -4 40 Z" />}
      <circle cx="78" cy="78" r="2.5" /><circle cx="128" cy="80" r="2.5" /><circle cx="72" cy="92" r="2" />
    </svg>
  );
}
