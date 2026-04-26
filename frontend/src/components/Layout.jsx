import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { createTranslator } from '../i18n';
import { useStore } from '../store/useStore';
import { CropsIcon, FarmsIcon, HomeIcon, MarketIcon, RecordIcon } from './AppIcon';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
  const farmer = useStore((s) => s.farmer);
  const language = useStore((s) => s.language);
  const logout = useStore((s) => s.logout);
  const setFarmer = useStore((s) => s.setFarmer);
  const setLanguage = useStore((s) => s.setLanguage);
  const navigate = useNavigate();
  const t = createTranslator(language);
  const [savingLanguage, setSavingLanguage] = useState(false);

  const nav = [
    { to: '/', label: t('nav_home'), icon: HomeIcon },
    { to: '/farms', label: t('nav_farms'), icon: FarmsIcon },
    { to: '/crops', label: t('nav_crops'), icon: CropsIcon },
    { to: '/market', label: t('nav_market'), icon: MarketIcon },
    { to: '/record', label: t('nav_record'), icon: RecordIcon },
  ];

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
      <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-10">
        <span className="text-primary font-semibold text-lg tracking-tight">AgriBridge</span>

        <div className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2 ${
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
      </nav>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`
            }
          >
            <n.icon className="h-5 w-5 mb-0.5" />
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
