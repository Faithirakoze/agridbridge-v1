const STATUS = {
  seedling:  { bg: 'bg-blue-50',  text: 'text-blue-700',  label: 'Seedling'  },
  growing:   { bg: 'bg-green-50', text: 'text-green-700', label: 'Growing'   },
  at_risk:   { bg: 'bg-amber-50', text: 'text-amber-700', label: 'At risk'   },
  harvested: { bg: 'bg-gray-100', text: 'text-gray-600',  label: 'Harvested' },
};

export default function CropStatusBadge({ status = 'seedling' }) {
  const s = STATUS[status] || STATUS.seedling;
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}
