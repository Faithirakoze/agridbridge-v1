import { createTranslator } from '../i18n';
import { useStore } from '../store/useStore';
import { AlertIcon, MarketIcon, WeatherIcon } from './AppIcon';

export default function AlertCard({ type = 'general', title, body }) {
  const language = useStore((s) => s.language);
  const t = createTranslator(language);

  const types = {
    weather: { bg: 'bg-amber-50', text: 'text-amber-700', label: t('alert_weather'), Icon: WeatherIcon, accent: 'bg-amber-500' },
    market: { bg: 'bg-blue-50', text: 'text-blue-700', label: t('alert_market'), Icon: MarketIcon, accent: 'bg-blue-500' },
    general: { bg: 'bg-green-50', text: 'text-green-700', label: t('alert_advisory'), Icon: AlertIcon, accent: 'bg-emerald-600' },
  };

  const selectedType = types[type] || types.general;
  const Icon = selectedType.Icon;

  return (
    <div className="card mb-3">
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-2xl ${selectedType.accent} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-2 ${selectedType.bg} ${selectedType.text}`}>
            {selectedType.label}
          </span>
          <p className="text-sm font-medium text-gray-800 mb-1">{title}</p>
          {body && <p className="text-xs text-gray-500 leading-relaxed">{body}</p>}
        </div>
      </div>
    </div>
  );
}
