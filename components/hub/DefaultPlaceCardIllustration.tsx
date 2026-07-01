export function DefaultPlaceCardIllustration() {
  return (
    <svg
      viewBox="0 0 400 220"
      className="hub-place-card__illustration-svg"
      role="img"
      aria-label=""
    >
      <defs>
        <linearGradient id="hub-card-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E6F1FF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#hub-card-sky)" />
      <g fill="#BFDBFE" opacity="0.9">
        <ellipse cx="72" cy="54" rx="28" ry="10" />
        <ellipse cx="310" cy="42" rx="36" ry="12" />
        <ellipse cx="210" cy="36" rx="22" ry="8" />
      </g>
      <g fill="#93C5FD">
        <path d="M0 170 L28 132 L52 148 L78 118 L104 136 L132 108 L158 126 L186 98 L214 120 L242 94 L268 114 L296 88 L324 110 L352 86 L400 108 L400 220 L0 220 Z" />
        <rect x="48" y="126" width="18" height="44" rx="2" />
        <rect x="74" y="112" width="22" height="58" rx="2" />
        <rect x="104" y="98" width="16" height="72" rx="2" />
        <rect x="128" y="108" width="26" height="62" rx="2" />
        <rect x="162" y="92" width="14" height="78" rx="2" />
        <rect x="184" y="104" width="20" height="66" rx="2" />
        <rect x="214" y="88" width="18" height="82" rx="2" />
        <rect x="242" y="100" width="24" height="70" rx="2" />
        <rect x="276" y="90" width="16" height="80" rx="2" />
        <rect x="300" y="106" width="22" height="64" rx="2" />
        <rect x="330" y="94" width="18" height="76" rx="2" />
        <path d="M118 148 H182 V156 H118 Z" opacity="0.75" />
      </g>
      <g fill="#60A5FA" opacity="0.85">
        <circle cx="34" cy="164" r="8" />
        <circle cx="52" cy="172" r="6" />
        <circle cx="346" cy="168" r="7" />
        <circle cx="364" cy="176" r="5" />
      </g>
      <g transform="translate(200 92)">
        <path
          d="M0 -34 C-14 -34 -24 -22 -24 -10 C-24 8 0 34 0 34 C0 34 24 8 24 -10 C24 -22 14 -34 0 -34 Z"
          fill="#FFFFFF"
        />
        <circle cx="0" cy="-10" r="7" fill="#2563EB" />
      </g>
    </svg>
  );
}
