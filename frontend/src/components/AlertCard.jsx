import { AlertIcon, MarketIcon, WeatherIcon } from './AppIcon';

const TYPES = {
  weather: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Weather alert', Icon: WeatherIcon, accent: 'bg-amber-500' },
  market: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Market tip', Icon: MarketIcon, accent: 'bg-blue-500' },
  general: { bg: 'bg-green-50', text: 'text-green-700', label: 'Advisory', Icon: AlertIcon, accent: 'bg-emerald-600' },
};

export default function AlertCard({ type = 'general', title, body }) {
  const t = TYPES[type] || TYPES.general;
  const Icon = t.Icon;
  return (
    <div className="card mb-3">
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-2xl ${t.accent} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-2 ${t.bg} ${t.text}`}>
            {t.label}
          </span>
          <p className="text-sm font-medium text-gray-800 mb-1">{title}</p>
          {body && <p className="text-xs text-gray-500 leading-relaxed">{body}</p>}
        </div>
      </div>
    </div>
  );
}
