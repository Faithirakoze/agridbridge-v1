import { getCropStatusLabel } from '../i18n';
import { useStore } from '../store/useStore';

const STATUS = {
  seedling:  { bg: 'bg-blue-50',  text: 'text-blue-700' },
  growing:   { bg: 'bg-green-50', text: 'text-green-700' },
  at_risk:   { bg: 'bg-amber-50', text: 'text-amber-700' },
  harvested: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export default function CropStatusBadge({ status = 'seedling' }) {
  const language = useStore((s) => s.language);
  const selectedStatus = STATUS[status] || STATUS.seedling;

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${selectedStatus.bg} ${selectedStatus.text}`}>
      {getCropStatusLabel(status, language)}
    </span>
  );
}
