export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Brand logo"
    >
      <defs>
        <style>{`
          .outline { stroke: #FF4C60; stroke-width: 10; fill: #FFFACD; }
          .line { stroke: #FF4C60; stroke-width: 10; stroke-linecap: round; fill: none; }
          .fill { fill: #FF4C60; }
        `}</style>
      </defs>

      <path className="outline"
        d="M96 160 C96 70,180 40,256 70 C332 40,416 70,416 160 C416 250,332 280,256 250 C180 280,96 250,96 160 Z"
      />

      <line className="line" x1="256" y1="70" x2="256" y2="210" />

      <ellipse className="fill" cx="205" cy="150" rx="10" ry="14" />
      <ellipse className="fill" cx="307" cy="150" rx="10" ry="14" />

      <path className="fill"
        d="M170 190 Q256 250 342 190 Q342 210 256 270 Q170 210 170 190 Z"
      />
    </svg>
  )
}