const BASE = 'h-5 w-5';

function Svg({ children, className = BASE }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function FarmsIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M3 20h18" />
      <path d="M6 20V10l6-4 6 4v10" />
      <path d="M10 20v-5h4v5" />
      <path d="M5 11h14" />
    </Svg>
  );
}

export function CropsIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M12 21V9" />
      <path d="M12 13c0-3 2-5 5-5 0 3-2 5-5 5Z" />
      <path d="M12 16c0-2.7-1.8-4.5-4.5-4.5 0 2.7 1.8 4.5 4.5 4.5Z" />
      <path d="M12 9c0-3-1.8-5-4.5-6 0 3 1.2 5.4 4.5 6Z" />
    </Svg>
  );
}

export function MarketIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M4 8h16" />
      <path d="M6 8V6.5A1.5 1.5 0 0 1 7.5 5h9A1.5 1.5 0 0 1 18 6.5V8" />
      <path d="M5 8l1 10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-10" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </Svg>
  );
}

export function RecordIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M7 4h8l4 4v12a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M15 4v4h4" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </Svg>
  );
}

export function HomeIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
      <path d="M10 20v-5h4v5" />
    </Svg>
  );
}

export function AlertIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M12 4a4 4 0 0 1 4 4v2.5c0 .8.2 1.6.7 2.3l1.3 1.9H6l1.3-1.9c.5-.7.7-1.5.7-2.3V8a4 4 0 0 1 4-4Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </Svg>
  );
}

export function WeatherIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M7 18h9a3 3 0 1 0-.8-5.9A4.5 4.5 0 0 0 6.5 13 2.5 2.5 0 0 0 7 18Z" />
      <path d="M9 20l-1 2" />
      <path d="M13 20l-1 2" />
      <path d="M17 20l-1 2" />
    </Svg>
  );
}
