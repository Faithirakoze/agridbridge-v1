import { useNavigate } from 'react-router-dom';
import { CropsIcon, FarmsIcon } from '../components/AppIcon';
import { createTranslator } from '../i18n';
import { useStore } from '../store/useStore';

const OPTIONS = [
  {
    value: 'crop',
    icon: CropsIcon,
    tone: 'bg-lime-50 text-lime-700 border-lime-100',
    nextPath: '/farms',
  },
  {
    value: 'livestock',
    icon: FarmsIcon,
    tone: 'bg-amber-50 text-amber-700 border-amber-100',
    nextPath: '/',
  },
];

export default function FarmingTypePage() {
  const navigate = useNavigate();
  const language = useStore((s) => s.language);
  const setFarmingType = useStore((s) => s.setFarmingType);
  const t = createTranslator(language);

  function handleSelect(option) {
    setFarmingType(option.value);
    navigate(option.nextPath);
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 flex items-center justify-center">
      <main className="w-full max-w-3xl">
        <div className="mb-8">
          <p className="text-primary font-semibold text-lg tracking-tight">AgriBridge</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-6">
            {t('farming_type_title')}
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl">{t('farming_type_subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {OPTIONS.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-primary/40 hover:shadow-sm active:scale-[0.99] transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${option.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mt-5">
                  {t(`farming_type_${option.value}_title`)}
                </h2>
                <p className="text-sm text-gray-500 mt-2 leading-6">
                  {t(`farming_type_${option.value}_body`)}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-primary mt-5">
                  {t('farming_type_choose')}
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
