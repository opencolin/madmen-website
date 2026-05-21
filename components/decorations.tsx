// Atomic-age decoration components. Pure SVG, color via currentColor.

export function Starburst({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x="48"
          y="0"
          width="4"
          height="50"
          transform={`rotate(${(360 / 12) * i} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="10" />
    </svg>
  );
}

export function Orbit({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <ellipse cx="50" cy="50" rx="48" ry="20" transform="rotate(-15 50 50)" />
      <ellipse cx="50" cy="50" rx="48" ry="20" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
    </svg>
  );
}

export function Planet({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="22" fill="currentColor" />
      <ellipse
        cx="50"
        cy="50"
        rx="42"
        ry="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        transform="rotate(-20 50 50)"
      />
    </svg>
  );
}
