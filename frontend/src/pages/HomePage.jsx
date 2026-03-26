import { useEffect, useState } from 'react';
import AlertCard from '../components/AlertCard';
import { useStore } from '../store/useStore';
import client from '../api/client';

function formatCropName(cropType) {
  return cropType.replace(/_/g, ' ');
}

function extractNumericQuantity(quantity) {
  if (!quantity) return null;
  const match = String(quantity).match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function buildDemandAlert(prices, district, farmerCrops) {
  if (!prices.length) return null;

  const topCrop = [...prices].sort((a, b) => b.price_rwf - a.price_rwf)[0];
  const farmerAlreadyGrowsIt = farmerCrops.some((crop) => crop.crop_type === topCrop.crop_type);

  return {
    id: `market-demand-${district}-${topCrop.crop_type}`,
    type: 'market',
    title: `${formatCropName(topCrop.crop_type)} is high in demand in ${district}`,
    body: farmerAlreadyGrowsIt
      ? `This is the strongest-priced crop in your area at ${topCrop.price_rwf} RWF/kg in ${topCrop.market_name}. It may be a good time to plan sales.`
      : `It currently leads local prices at ${topCrop.price_rwf} RWF/kg in ${topCrop.market_name}. You can use this as a guide for future planting decisions.`,
  };
}

export default function HomePage() {
  const farmer   = useStore((s) => s.farmer);
  const farms    = useStore((s) => s.farms);
  const crops    = useStore((s) => s.crops);
  const setFarms = useStore((s) => s.setFarms);
  const setCrops = useStore((s) => s.setCrops);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [demandInsight, setDemandInsight] = useState(null);
  const [harvestSummary, setHarvestSummary] = useState({ count: 0, yieldTotal: 0, yieldUnit: 'kg' });

  useEffect(() => {
    Promise.allSettled([
      client.get('/farms'),
      client.get('/crops'),
      client.get('/activities'),
      client.get('/alerts'),
      client.get('/market'),
    ])
      .then(([farmsResult, cropsResult, activitiesResult, alertsResult, marketResult]) => {
        let nextFarms = [];
        let nextCrops = [];
        let nextAlerts = [];

        if (farmsResult.status === 'fulfilled') {
          nextFarms = farmsResult.value.data || [];
          setFarms(nextFarms);
        } else {
          console.warn(farmsResult.reason);
        }

        if (cropsResult.status === 'fulfilled') {
          nextCrops = cropsResult.value.data || [];
          setCrops(nextCrops);
        } else {
          console.warn(cropsResult.reason);
        }

        if (activitiesResult.status === 'fulfilled') {
          const activities = activitiesResult.value.data || [];
          const harvestActivities = activities.filter((activity) => activity.activity_type === 'harvest');
          const numericHarvestValues = harvestActivities
            .map((activity) => extractNumericQuantity(activity.quantity))
            .filter((value) => value !== null);

          setHarvestSummary({
            count: harvestActivities.length,
            yieldTotal: numericHarvestValues.reduce((sum, value) => sum + value, 0),
            yieldUnit: 'kg',
          });
        } else {
          console.warn(activitiesResult.reason);
          setHarvestSummary({ count: 0, yieldTotal: 0, yieldUnit: 'kg' });
        }

        if (alertsResult.status === 'fulfilled') {
          nextAlerts = alertsResult.value.data || [];
        } else {
          console.warn(alertsResult.reason);
        }

        if (marketResult.status === 'fulfilled') {
          const locationName = nextFarms[0]?.district || farmer?.district || 'Kigali';
          const marketPrices = (marketResult.value.data || []).filter((price) =>
            !locationName || price.district?.toLowerCase() === locationName.toLowerCase()
          );
          const topCrop = marketPrices.length
            ? [...marketPrices].sort((a, b) => b.price_rwf - a.price_rwf)[0]
            : null;
          const demandAlert = buildDemandAlert(marketPrices, locationName, nextCrops);

          setDemandInsight(topCrop ? {
            crop: formatCropName(topCrop.crop_type),
            price: topCrop.price_rwf,
            district: locationName,
          } : null);
          setAlerts(demandAlert ? [...nextAlerts, demandAlert] : nextAlerts);
        } else {
          console.warn(marketResult.reason);
          setDemandInsight(null);
          setAlerts(nextAlerts);
        }
      })
      .finally(() => {
        setLoading(false);
        setAlertsLoading(false);
      });
  }, [farmer?.district, setCrops, setFarms]);

  const firstName  = farmer?.name?.split(' ')[0] || 'Farmer';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Muraho, {firstName}</p>
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-primary font-semibold">
          {firstName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-3 bg-gray-100 rounded mb-2 w-2/3" />
              <div className="h-6 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">High in demand</p>
            <p className="text-base font-semibold text-gray-800 capitalize">
              {demandInsight?.crop || 'No data'}
            </p>
            <p className="text-xs text-gray-400">
              {demandInsight?.price ? `${demandInsight.price} RWF/kg` : 'Market data unavailable'}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Harvests</p>
            <p className="text-xl font-semibold text-gray-800">{harvestSummary.count}</p>
            <p className="text-xs text-gray-400">Recorded harvest events</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Yield</p>
            <p className="text-xl font-semibold text-gray-800">
              {harvestSummary.yieldTotal.toFixed(1)}
            </p>
            <p className="text-xs text-gray-400">{harvestSummary.yieldUnit} from logged harvests</p>
          </div>
        </div>
      )}

      {/* Advisories */}
      <div>
        <p className="section-label">Today's alerts</p>
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
            title="No alerts available"
            body="We could not load weather alerts right now."
          />
        )}
      </div>

    </div>
  );
}
