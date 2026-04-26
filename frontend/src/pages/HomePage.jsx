import { useEffect, useState } from 'react';
import client from '../api/client';
import AlertCard from '../components/AlertCard';
import { AlertIcon, CropsIcon, FarmsIcon, HomeIcon } from '../components/AppIcon';
import { createTranslator, getCropTypeLabel } from '../i18n';
import { useStore } from '../store/useStore';

function getSeasonCounts(crops) {
  return crops.reduce((summary, crop) => {
    const status = crop.status === 'seedling' ? 'planting' : crop.status;

    if (status === 'planting' || status === 'growing' || status === 'harvested') {
      summary[status] += 1;
    }

    return summary;
  }, { planting: 0, growing: 0, harvested: 0 });
}

function getSeasonStatusSummary(crops, t) {
  const counts = getSeasonCounts(crops);
  return `${t('home_planting_short')} ${counts.planting} | ${t('home_growing_short')} ${counts.growing} | ${t('home_harvesting_short')} ${counts.harvested}`;
}

function getCropBreakdown(crops) {
  const grouped = crops.reduce((map, crop) => {
    const key = crop.crop_type;

    if (!map[key]) {
      map[key] = { cropType: key, count: 0, area: 0 };
    }

    map[key].count += 1;
    map[key].area += crop.area_ha || 0;
    return map;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => b.area - a.area || b.count - a.count)
    .slice(0, 5);
}

export default function HomePage() {
  const farmer = useStore((s) => s.farmer);
  const language = useStore((s) => s.language);
  const farms = useStore((s) => s.farms);
  const crops = useStore((s) => s.crops);
  const setFarms = useStore((s) => s.setFarms);
  const setCrops = useStore((s) => s.setCrops);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const t = createTranslator(language);

  useEffect(() => {
    Promise.allSettled([client.get('/farms'), client.get('/crops'), client.get('/alerts')])
      .then(([farmsResult, cropsResult, alertsResult]) => {
        let nextAlerts = [];

        if (farmsResult.status === 'fulfilled') {
          setFarms(farmsResult.value.data || []);
        } else {
          console.warn(farmsResult.reason);
        }

        if (cropsResult.status === 'fulfilled') {
          setCrops(cropsResult.value.data || []);
        } else {
          console.warn(cropsResult.reason);
        }

        if (alertsResult.status === 'fulfilled') {
          nextAlerts = alertsResult.value.data || [];
        } else {
          console.warn(alertsResult.reason);
        }

        setAlerts(nextAlerts);
      })
      .finally(() => {
        setLoading(false);
        setAlertsLoading(false);
      });
  }, [setCrops, setFarms]);

  const firstName = farmer?.name?.split(' ')[0] || t('home_farmer_fallback');
  const totalPlots = crops.length;
  const plantedArea = crops.reduce((sum, crop) => sum + (crop.area_ha || 0), 0);
  const cropTypes = new Set(crops.map((crop) => crop.crop_type)).size;
  const seasonStatus = getSeasonStatusSummary(crops, t);
  const seasonCounts = getSeasonCounts(crops);
  const cropBreakdown = getCropBreakdown(crops);
  const maxCropArea = Math.max(...cropBreakdown.map((crop) => crop.area), 1);

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-emerald-50 via-white to-sky-50 border-emerald-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <HomeIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('home_hello', { name: firstName })}</p>
              <h1 className="text-xl font-semibold text-gray-800">{t('home_dashboard')}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('home_quick_view')}</p>
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-primary font-semibold flex-shrink-0">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-2xl mb-3" />
              <div className="h-3 bg-gray-100 rounded mb-2 w-2/3" />
              <div className="h-6 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="card">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <FarmsIcon className="h-5 w-5" />
            </div>
            <p className="text-xs text-gray-400 mb-1">{t('home_farms_plots')}</p>
            <p className="text-xl font-semibold text-gray-800">{farms.length} / {totalPlots}</p>
            <p className="text-xs text-gray-400">{t('home_total_registered_fields')}</p>
          </div>
          <div className="card">
            <div className="w-10 h-10 rounded-2xl bg-lime-50 text-lime-700 flex items-center justify-center mb-3">
              <CropsIcon className="h-5 w-5" />
            </div>
            <p className="text-xs text-gray-400 mb-1">{t('home_crops_planted')}</p>
            <p className="text-xl font-semibold text-gray-800">{cropTypes}</p>
            <p className="text-xs text-gray-400">{t('home_ha_under_crops', { area: plantedArea.toFixed(1) })}</p>
          </div>
          <div className="card">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
              <AlertIcon className="h-5 w-5" />
            </div>
            <p className="text-xs text-gray-400 mb-1">{t('home_season_status')}</p>
            <p className="text-base font-semibold text-gray-800">{seasonStatus}</p>
            <p className="text-xs text-gray-400">{t('home_season_status_hint')}</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-lime-50 text-lime-700 flex items-center justify-center">
                <CropsIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{t('home_crop_coverage')}</p>
                <p className="text-xs text-gray-400">{t('home_top_planted')}</p>
              </div>
            </div>

            {cropBreakdown.length ? (
              <div className="space-y-3">
                {cropBreakdown.map((crop) => (
                  <div key={crop.cropType}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-600 capitalize">{getCropTypeLabel(crop.cropType, language)}</span>
                      <span className="text-gray-400">{crop.area.toFixed(1)} ha</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-lime-500 to-emerald-500"
                        style={{ width: `${Math.max((crop.area / maxCropArea) * 100, crop.area > 0 ? 14 : 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t('home_no_crop_breakdown')}</p>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <AlertIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{t('home_season_flow')}</p>
                <p className="text-xs text-gray-400">{t('home_how_plots_move')}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'planting', label: t('home_planting'), value: seasonCounts.planting, tone: 'from-amber-400 to-orange-500' },
                { key: 'growing', label: t('home_growing'), value: seasonCounts.growing, tone: 'from-emerald-400 to-green-600' },
                { key: 'harvested', label: t('home_harvesting'), value: seasonCounts.harvested, tone: 'from-sky-400 to-blue-600' },
              ].map((item) => {
                const total = Math.max(totalPlots, 1);
                const height = Math.max((item.value / total) * 100, item.value > 0 ? 20 : 8);

                return (
                  <div key={item.key} className="text-center">
                    <div className="h-32 bg-gray-50 rounded-2xl flex items-end justify-center px-3 py-3 mb-2">
                      <div
                        className={`w-full rounded-xl bg-gradient-to-t ${item.tone} transition-all`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <p className="text-lg font-semibold text-gray-800">{item.value}</p>
                    <p className="text-xs text-gray-400">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="section-label !mb-0">{t('home_todays_alerts')}</p>
            <p className="text-xs text-gray-400">{t('home_alerts_hint')}</p>
          </div>
        </div>
        {alertsLoading ? (
          <div className="card animate-pulse">
            <div className="h-5 bg-gray-100 rounded mb-3 w-1/3" />
            <div className="h-4 bg-gray-100 rounded mb-2 w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-full" />
          </div>
        ) : alerts.length ? (
          alerts.map((a) => (
            <AlertCard key={a.id} type={a.type} title={a.title} body={a.body} />
          ))
        ) : (
          <AlertCard
            type="general"
            title={t('home_no_alerts_title')}
            body={t('home_no_alerts_body')}
          />
        )}
      </div>
    </div>
  );
}
