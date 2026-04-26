import { getLanguageOptionLabel } from '../i18n';

const OPTIONS = ['en', 'rw'];

export default function LanguageSwitcher({ language, label, onChange, disabled = false, className = '' }) {
  return (
    <label className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{label}</span>}
      <select
        className="input !w-auto !py-2 !px-3 text-sm min-w-[160px]"
        value={language}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {getLanguageOptionLabel(option, language)}
          </option>
        ))}
      </select>
    </label>
  );
}
