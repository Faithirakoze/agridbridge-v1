import { useEffect, useState } from 'react';
import AlertCard from '../components/AlertCard';
import { useStore } from '../store/useStore';
import client from '../api/client';

const ADVISORIES = [
  { id: 1, type: 'weather', title: 'Heavy rain expected in 2 days', body: 'Delay planting on low-lying plots. Protect stored harvest from moisture.' },
  { id: 2, type: 'market',  title: 'Maize prices up 12% in Kigali', body: 'Current price: 320 RWF/kg at Kimironko market. Good time to sell.' },
];

export default function HomePage() {
  const farmer   = useStore((s) => s.farmer);
  const farms    = useStore((s) => s.farms);
  const crops    = useStore((s) => s.crops);
  const setFarms = useStore((s) => s.setFarms);
  const setCrops = useStore((s) => s.setCrops);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([client.get('/farms'), client.get('/crops')])
      .then(([f, c]) => { setFarms(f.data); setCrops(c.data); })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, []);

  const totalArea  = farms.reduce((s, f) => s + (f.area_ha || 0), 0);
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
            <p className="text-xs text-gray-400 mb-1">Total area</p>
            <p className="text-xl font-semibold text-gray-800">
              {totalArea.toFixed(1)} <span className="text-sm font-normal text-gray-400">ha</span>
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Crops</p>
            <p className="text-xl font-semibold text-gray-800">{crops.length}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400 mb-1">Farms</p>
            <p className="text-xl font-semibold text-gray-800">{farms.length}</p>
          </div>
        </div>
      )}

      {/* Advisories */}
      <div>
        <p className="section-label">Today's alerts</p>
        {ADVISORIES.map((a) => (
          <AlertCard key={a.id} type={a.type} title={a.title} body={a.body} />
        ))}
      </div>

    </div>
  );
}
