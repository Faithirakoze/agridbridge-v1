import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { createTranslator } from '../i18n';
import { useStore } from '../store/useStore';
import {
  CropsIcon,
  FarmsIcon,
  FeedIcon,
  HealthIcon,
  HomeIcon,
  MarketIcon,
  ProductionIcon,
  RecordIcon,
} from './AppIcon';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
  const farmer = useStore((s) => s.farmer);
  const farmingType = useStore((s) => s.farmingType);
  const language = useStore((s) => s.language);
  const logout = useStore((s) => s.logout);
  const setFarmer = useStore((s) => s.setFarmer);
  const setLanguage = useStore((s) => s.setLanguage);
  const navigate = useNavigate();
  const t = createTranslator(language);
  const [savingLanguage, setSavingLanguage] = useState(false);

  const cropNav = [
    { to: '/', label: t('nav_home'), icon: HomeIcon },
    { to: '/farms', label: t('nav_farms'), icon: FarmsIcon },
    { to: '/crops', label: t('nav_crops'), icon: CropsIcon },
    { to: '/market', label: t('nav_market'), icon: MarketIcon },
    { to: '/record', label: t('nav_record'), icon: RecordIcon },
  ];
  const livestockNav = [
    { to: '/', label: t('nav_livestock_dashboard'), shortLabel: 'Home', icon: HomeIcon, tone: 'emerald' },
    { to: '/health-vaccination', label: t('nav_health_vaccination'), shortLabel: 'Health', icon: HealthIcon, tone: 'rose' },
    { to: '/feed-water', label: t('nav_feed_water'), shortLabel: 'Feed', icon: FeedIcon, tone: 'amber' },
    { to: '/breeding-reproduction', label: t('nav_breeding_reproduction'), shortLabel: 'Breeding', icon: FarmsIcon, tone: 'violet' },
    { to: '/livestock-finances', label: t('nav_finances'), shortLabel: 'Money', icon: MarketIcon, tone: 'sky' },
    { to: '/inventory-equipment', label: t('nav_inventory_equipment'), shortLabel: 'Stock', icon: RecordIcon, tone: 'slate' },
    { to: '/production-yield', label: t('nav_production_yield'), shortLabel: 'Yield', icon: ProductionIcon, tone: 'lime' },
    { to: '/livestock-alerts', label: t('nav_alerts_reminders'), shortLabel: 'Alerts', icon: RecordIcon, tone: 'orange' },
  ];
  const nav = farmingType === 'livestock' ? livestockNav : cropNav;
  const livestockGroups = [
    { label: 'Overview', items: livestockNav.slice(0, 1) },
    { label: 'Care', items: livestockNav.slice(1, 4) },
    { label: 'Business', items: livestockNav.slice(4) },
  ];
  const toneClasses = {
    emerald: { active: 'bg-emerald-600 text-white shadow-emerald-200', idle: 'text-emerald-700 hover:bg-emerald-50', icon: 'bg-emerald-100 text-emerald-700' },
    rose: { active: 'bg-rose-600 text-white shadow-rose-200', idle: 'text-rose-700 hover:bg-rose-50', icon: 'bg-rose-100 text-rose-700' },
    amber: { active: 'bg-amber-500 text-white shadow-amber-200', idle: 'text-amber-700 hover:bg-amber-50', icon: 'bg-amber-100 text-amber-700' },
    violet: { active: 'bg-violet-600 text-white shadow-violet-200', idle: 'text-violet-700 hover:bg-violet-50', icon: 'bg-violet-100 text-violet-700' },
    sky: { active: 'bg-sky-600 text-white shadow-sky-200', idle: 'text-sky-700 hover:bg-sky-50', icon: 'bg-sky-100 text-sky-700' },
    slate: { active: 'bg-slate-700 text-white shadow-slate-200', idle: 'text-slate-700 hover:bg-slate-50', icon: 'bg-slate-100 text-slate-700' },
    lime: { active: 'bg-lime-600 text-white shadow-lime-200', idle: 'text-lime-700 hover:bg-lime-50', icon: 'bg-lime-100 text-lime-700' },
    orange: { active: 'bg-orange-600 text-white shadow-orange-200', idle: 'text-orange-700 hover:bg-orange-50', icon: 'bg-orange-100 text-orange-700' },
  };

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleLanguageChange(nextLanguage) {
    if (nextLanguage === language || savingLanguage) return;

    const previousLanguage = language;
    setLanguage(nextLanguage);

    if (!farmer) return;

    setSavingLanguage(true);
    try {
      const res = await client.put('/auth/preferences', { preferred_language: nextLanguage });
      setFarmer(res.data.user);
    } catch (error) {
      console.warn(error);
      setLanguage(previousLanguage);
    } finally {
      setSavingLanguage(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4">
          <span className="text-primary font-semibold text-lg tracking-tight">AgriBridge</span>

          {farmingType === 'livestock' ? (
            <div className="hidden xl:flex items-center gap-3 overflow-x-auto">
              {livestockGroups.map((group) => (
                <div key={group.label} className="flex items-center gap-1 rounded-2xl bg-gray-50 border border-gray-100 p-1">
                  <span className="px-2 text-[11px] font-semibold uppercase text-gray-400">{group.label}</span>
                  {group.items.map((n) => {
                    const tone = toneClasses[n.tone];
                    return (
                      <NavLink
                        key={n.to}
                        to={n.to}
                        end={n.to === '/'}
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2 whitespace-nowrap ${
                            isActive ? `${tone.active} shadow-sm` : tone.idle
                          }`
                        }
                      >
                        <n.icon className="h-4 w-4" />
                        {n.shortLabel}
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1 overflow-x-auto">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`
                  }
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </NavLink>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <LanguageSwitcher
              language={language}
              label={t('app_language')}
              onChange={handleLanguageChange}
              disabled={savingLanguage}
              className="hidden sm:flex"
            />
            <LanguageSwitcher
              language={language}
              onChange={handleLanguageChange}
              disabled={savingLanguage}
              className="sm:hidden"
            />
            <span className="text-sm text-gray-500 hidden sm:block">{farmer?.name?.split(' ')[0]}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              {t('app_sign_out')}
            </button>
          </div>
        </div>

        {farmingType === 'livestock' && (
          <div className="hidden md:flex xl:hidden items-center gap-2 overflow-x-auto pt-3">
            {livestockNav.map((n) => {
              const tone = toneClasses[n.tone];
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2 whitespace-nowrap ${
                      isActive ? `${tone.active} shadow-sm` : tone.idle
                    }`
                  }
                >
                  <n.icon className="h-4 w-4" />
                  {n.shortLabel}
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      <main className={`flex-1 w-full mx-auto px-4 py-6 pb-24 md:pb-6 ${farmingType === 'livestock' ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10 overflow-x-auto">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `min-w-20 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                isActive ? `${toneClasses[n.tone]?.idle || 'text-primary'} bg-gray-50` : 'text-gray-400'
              }`
            }
          >
            <span className={`h-8 w-8 rounded-xl flex items-center justify-center mb-1 ${toneClasses[n.tone]?.icon || ''}`}>
              <n.icon className="h-4 w-4" />
            </span>
            {n.shortLabel || n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
