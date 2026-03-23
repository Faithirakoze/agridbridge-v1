const TYPES = {
  weather: { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Weather alert' },
  market:  { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Market tip'   },
  general: { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Advisory'     },
};

export default function AlertCard({ type = 'general', title, body }) {
  const t = TYPES[type] || TYPES.general;
  return (
    <div className="card mb-3">
      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-2 ${t.bg} ${t.text}`}>
        {t.label}
      </span>
      <p className="text-sm font-medium text-gray-800 mb-1">{title}</p>
      {body && <p className="text-xs text-gray-500 leading-relaxed">{body}</p>}
    </div>
  );
}