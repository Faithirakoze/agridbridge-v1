import { useEffect, useState } from 'react';
import client from '../api/client';

const ICONS   = { maize:'🌽', beans:'🫘', sorghum:'🌾', irish_potato:'🥔', sweet_potato:'🍠', cassava:'🌿' };
const FILTERS = ['All', 'Kigali', 'Musanze', 'Huye'];

export default function MarketPage() {
  const [prices,   setPrices]   = useState([]);
  const [district, setDistrict] = useState('All');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => { load(); }, [district]);

  async function load() {
    setLoading(true); setError('');
    try {
      const params = district !== 'All' ? { district } : {};
      const res    = await client.get('/market', { params });
      // deduplicate — one per crop per district
      const seen = new Set();
      setPrices(res.data.filter((p) => {
        const key = `${p.crop_type}_${p.district}`;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      }));
    } catch {
      setError('Could not load prices. Check your connection.');
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl font-semibold text-gray-800">Market prices</h1>
        <p className="text-xs text-gray-400 mt-0.5">RWF per kg · updated today</p>
      </div>

      {/* District filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setDistrict(f)}
            className={`pill text-xs whitespace-nowrap flex-shrink-0 ${district === f ? 'pill-active' : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Price list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map((i) => (
            <div key={i} className="card animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-5 bg-gray-100 rounded w-20" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm text-center py-8">{error}</p>
      ) : (
        <div className="space-y-2">
          {prices.map((p) => (
            <div key={p.id} className="card flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {ICONS[p.crop_type] || '🌱'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 capitalize">
                  {p.crop_type.replace('_', ' ')}
                </p>
                <p className="text-xs text-gray-400">{p.market_name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-800">{p.price_rwf} RWF</p>
                <p className="text-xs text-gray-400">{p.district}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
