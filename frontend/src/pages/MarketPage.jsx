import { useEffect, useState } from 'react';
import client from '../api/client';
import { MarketIcon } from '../components/AppIcon';
import { createTranslator, getCropTypeLabel } from '../i18n';
import { useStore } from '../store/useStore';

const ICONS = {
  maize: 'M',
  beans: 'B',
  sorghum: 'S',
  irish_potato: 'P',
  sweet_potato: 'SP',
  cassava: 'C',
  vegetables: 'V',
};

const FILTERS = ['All', 'Kigali', 'Musanze', 'Huye'];

const SAMPLE_PRICES = [
  { id: 'sample-1', crop_type: 'maize', price_rwf: 320, market_name: 'Kimironko Market', district: 'Kigali' },
  { id: 'sample-2', crop_type: 'beans', price_rwf: 680, market_name: 'Nyabugogo Market', district: 'Kigali' },
  { id: 'sample-3', crop_type: 'sorghum', price_rwf: 290, market_name: 'Nyabugogo Market', district: 'Kigali' },
  { id: 'sample-4', crop_type: 'irish_potato', price_rwf: 210, market_name: 'Kimironko Market', district: 'Kigali' },
  { id: 'sample-5', crop_type: 'sweet_potato', price_rwf: 180, market_name: 'Kimironko Market', district: 'Kigali' },
  { id: 'sample-6', crop_type: 'cassava', price_rwf: 150, market_name: 'Nyabugogo Market', district: 'Kigali' },
  { id: 'sample-7', crop_type: 'vegetables', price_rwf: 260, market_name: 'Kimironko Market', district: 'Kigali' },
  { id: 'sample-8', crop_type: 'maize', price_rwf: 305, market_name: 'Musanze Market', district: 'Musanze' },
  { id: 'sample-9', crop_type: 'beans', price_rwf: 650, market_name: 'Musanze Market', district: 'Musanze' },
  { id: 'sample-10', crop_type: 'sorghum', price_rwf: 285, market_name: 'Musanze Market', district: 'Musanze' },
  { id: 'sample-11', crop_type: 'irish_potato', price_rwf: 195, market_name: 'Musanze Market', district: 'Musanze' },
  { id: 'sample-12', crop_type: 'sweet_potato', price_rwf: 170, market_name: 'Musanze Market', district: 'Musanze' },
  { id: 'sample-13', crop_type: 'cassava', price_rwf: 145, market_name: 'Musanze Market', district: 'Musanze' },
  { id: 'sample-14', crop_type: 'vegetables', price_rwf: 240, market_name: 'Musanze Market', district: 'Musanze' },
  { id: 'sample-15', crop_type: 'maize', price_rwf: 310, market_name: 'Huye Market', district: 'Huye' },
  { id: 'sample-16', crop_type: 'beans', price_rwf: 660, market_name: 'Huye Market', district: 'Huye' },
  { id: 'sample-17', crop_type: 'sorghum', price_rwf: 275, market_name: 'Huye Market', district: 'Huye' },
  { id: 'sample-18', crop_type: 'irish_potato', price_rwf: 205, market_name: 'Huye Market', district: 'Huye' },
  { id: 'sample-19', crop_type: 'sweet_potato', price_rwf: 175, market_name: 'Huye Market', district: 'Huye' },
  { id: 'sample-20', crop_type: 'cassava', price_rwf: 148, market_name: 'Huye Market', district: 'Huye' },
  { id: 'sample-21', crop_type: 'vegetables', price_rwf: 250, market_name: 'Huye Market', district: 'Huye' },
];

function dedupePrices(list) {
  const seen = new Set();

  return list.filter((price) => {
    const key = `${price.crop_type}_${price.district}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function MarketPage() {
  const language = useStore((s) => s.language);
  const t = createTranslator(language);
  const [prices, setPrices] = useState([]);
  const [district, setDistrict] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [district]);

  async function load() {
    setLoading(true);
    const fallbackPrices = district === 'All'
      ? SAMPLE_PRICES
      : SAMPLE_PRICES.filter((price) => price.district === district);

    try {
      const params = district !== 'All' ? { district } : {};
      const res = await client.get('/market', { params });
      const apiPrices = Array.isArray(res.data) ? res.data : [];
      const mergedPrices = apiPrices.length > 0
        ? dedupePrices([...apiPrices, ...fallbackPrices])
        : dedupePrices(fallbackPrices);

      setPrices(mergedPrices);
    } catch {
      setPrices(dedupePrices(fallbackPrices));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card bg-gradient-to-r from-amber-50 via-white to-orange-50 border-amber-100">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
            <MarketIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{t('market_title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('market_subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setDistrict(filter)}
            className={`pill text-xs whitespace-nowrap flex-shrink-0 ${district === filter ? 'pill-active' : ''}`}
          >
            {filter === 'All' ? t('market_all') : filter}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
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
      ) : (
        <div className="space-y-2">
          {prices.map((price) => (
            <div key={price.id} className="card flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {ICONS[price.crop_type] || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 capitalize">
                  {getCropTypeLabel(price.crop_type, language)}
                </p>
                <p className="text-xs text-gray-400">{price.market_name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-800">{price.price_rwf} RWF</p>
                <p className="text-xs text-gray-400">{price.district}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
