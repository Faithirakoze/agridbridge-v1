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
  hybrid_maize_seed: 'MS',
  climbing_bean_seed: 'BS',
  potato_seed: 'PS',
  vegetable_seed_mix: 'VS',
  npk_17_17_17: 'NPK',
  dap: 'DAP',
  urea: 'UR',
  compost: 'CO',
};

const MARKET_CATEGORIES = ['crop_market', 'seed_market', 'fertilizer_market'];
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

const SAMPLE_SEED_PRICES = [
  { id: 'seed-1', item_type: 'hybrid_maize_seed', price_rwf: 1800, unit: 'kg', market_name: 'Kimironko Agro Dealer', district: 'Kigali' },
  { id: 'seed-2', item_type: 'climbing_bean_seed', price_rwf: 2400, unit: 'kg', market_name: 'Nyabugogo Agro Shop', district: 'Kigali' },
  { id: 'seed-3', item_type: 'potato_seed', price_rwf: 520, unit: 'kg', market_name: 'Musanze Seed Centre', district: 'Musanze' },
  { id: 'seed-4', item_type: 'hybrid_maize_seed', price_rwf: 1700, unit: 'kg', market_name: 'Musanze Agro Dealer', district: 'Musanze' },
  { id: 'seed-5', item_type: 'vegetable_seed_mix', price_rwf: 3500, unit: 'pack', market_name: 'Huye Farm Inputs', district: 'Huye' },
  { id: 'seed-6', item_type: 'climbing_bean_seed', price_rwf: 2300, unit: 'kg', market_name: 'Huye Farm Inputs', district: 'Huye' },
];

const SAMPLE_FERTILIZER_PRICES = [
  { id: 'fertilizer-1', item_type: 'npk_17_17_17', price_rwf: 58000, unit: '50 kg bag', market_name: 'Kimironko Agro Dealer', district: 'Kigali' },
  { id: 'fertilizer-2', item_type: 'dap', price_rwf: 62000, unit: '50 kg bag', market_name: 'Nyabugogo Agro Shop', district: 'Kigali' },
  { id: 'fertilizer-3', item_type: 'urea', price_rwf: 54000, unit: '50 kg bag', market_name: 'Musanze Agro Dealer', district: 'Musanze' },
  { id: 'fertilizer-4', item_type: 'compost', price_rwf: 9000, unit: '100 kg sack', market_name: 'Musanze Cooperative Depot', district: 'Musanze' },
  { id: 'fertilizer-5', item_type: 'npk_17_17_17', price_rwf: 57000, unit: '50 kg bag', market_name: 'Huye Farm Inputs', district: 'Huye' },
  { id: 'fertilizer-6', item_type: 'urea', price_rwf: 53500, unit: '50 kg bag', market_name: 'Huye Farm Inputs', district: 'Huye' },
];

const DELIVERY_OPTIONS = {
  Kigali: [
    { type: 'pickup', price_rwf: 0, eta: 'market_eta_pickup' },
    { type: 'local', price_rwf: 1500, eta: 'market_eta_same_day' },
    { type: 'farm', price_rwf: 3500, eta: 'market_eta_one_day' },
  ],
  Musanze: [
    { type: 'pickup', price_rwf: 0, eta: 'market_eta_pickup' },
    { type: 'town', price_rwf: 1200, eta: 'market_eta_same_day' },
    { type: 'farm', price_rwf: 3000, eta: 'market_eta_one_two_days' },
  ],
  Huye: [
    { type: 'pickup', price_rwf: 0, eta: 'market_eta_pickup' },
    { type: 'town', price_rwf: 1200, eta: 'market_eta_same_day' },
    { type: 'farm', price_rwf: 3200, eta: 'market_eta_one_two_days' },
  ],
};

function withDeliveryOptions(item) {
  return {
    ...item,
    delivery_options: item.delivery_options || DELIVERY_OPTIONS[item.district] || DELIVERY_OPTIONS.Kigali,
  };
}

function dedupePrices(list) {
  const seen = new Set();

  return list.filter((price) => {
    const key = `${price.crop_type || price.item_type}_${price.district}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function filterByDistrict(list, selectedDistrict) {
  return selectedDistrict === 'All'
    ? list
    : list.filter((price) => price.district === selectedDistrict);
}

export default function MarketPage() {
  const language = useStore((s) => s.language);
  const t = createTranslator(language);
  const [prices, setPrices] = useState([]);
  const [category, setCategory] = useState('crop_market');
  const [district, setDistrict] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState('');
  const [orderMessage, setOrderMessage] = useState('');

  useEffect(() => {
    load();
  }, [category, district]);

  async function load() {
    setLoading(true);

    if (category !== 'crop_market') {
      const mockPrices = category === 'seed_market' ? SAMPLE_SEED_PRICES : SAMPLE_FERTILIZER_PRICES;
      setPrices(filterByDistrict(mockPrices, district).map(withDeliveryOptions));
      setLoading(false);
      return;
    }

    const fallbackPrices = filterByDistrict(SAMPLE_PRICES, district).map(withDeliveryOptions);

    try {
      const params = district !== 'All' ? { district } : {};
      const res = await client.get('/market', { params });
      const apiPrices = Array.isArray(res.data) ? res.data : [];
      const mergedPrices = apiPrices.length > 0
        ? dedupePrices([...apiPrices.map(withDeliveryOptions), ...fallbackPrices])
        : dedupePrices(fallbackPrices);

      setPrices(mergedPrices);
    } catch {
      setPrices(dedupePrices(fallbackPrices));
    } finally {
      setLoading(false);
    }
  }

  function getItemLabel(price) {
    if (category === 'crop_market') {
      return getCropTypeLabel(price.crop_type, language);
    }

    return t(`market_item_${price.item_type}`);
  }

  function getUnitLabel(price) {
    return price.unit ? ` / ${price.unit}` : '';
  }

  function startOrder(price) {
    const itemWithDelivery = withDeliveryOptions(price);
    setSelectedItem(itemWithDelivery);
    setSelectedDeliveryType(itemWithDelivery.delivery_options[0]?.type || '');
    setOrderMessage('');
  }

  function closeOrder() {
    setSelectedItem(null);
    setSelectedDeliveryType('');
    setOrderMessage('');
  }

  function getSelectedDeliveryOption() {
    return selectedItem?.delivery_options?.find((option) => option.type === selectedDeliveryType);
  }

  function getTotalPrice() {
    const deliveryOption = getSelectedDeliveryOption();
    return (selectedItem?.price_rwf || 0) + (deliveryOption?.price_rwf || 0);
  }

  function confirmOrder() {
    setOrderMessage(t('market_order_saved'));
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
        {MARKET_CATEGORIES.map((marketCategory) => (
          <button
            key={marketCategory}
            onClick={() => setCategory(marketCategory)}
            className={`pill text-xs text-center whitespace-nowrap flex-shrink-0 ${category === marketCategory ? 'pill-active' : 'bg-white'}`}
          >
            {t(`market_category_${marketCategory}`)}
          </button>
        ))}
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
            <div key={price.id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {ICONS[price.crop_type || price.item_type] || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 capitalize">
                    {getItemLabel(price)}
                  </p>
                  <p className="text-xs text-gray-400">{price.market_name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-800">{price.price_rwf} RWF{getUnitLabel(price)}</p>
                  <p className="text-xs text-gray-400">{price.district}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button type="button" className="btn-primary py-2 text-sm" onClick={() => startOrder(price)}>
                  {t('market_buy_item')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 px-4 py-6 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('market_order_title')}</p>
                <h2 className="text-lg font-semibold text-gray-800 capitalize">{getItemLabel(selectedItem)}</h2>
                <p className="text-sm text-gray-400">{selectedItem.market_name} - {selectedItem.district}</p>
              </div>
              <button type="button" className="text-sm text-gray-400 hover:text-gray-600" onClick={closeOrder}>
                {t('common_cancel')}
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-3">
              <p className="text-xs text-amber-700">{t('market_item_price')}</p>
              <p className="text-lg font-semibold text-gray-800">{selectedItem.price_rwf} RWF{getUnitLabel(selectedItem)}</p>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">{t('market_delivery_question')}</p>
              <div className="space-y-2">
                {selectedItem.delivery_options.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setSelectedDeliveryType(option.type)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedDeliveryType === option.type
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-100 bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-800">{t(`market_delivery_${option.type}`)}</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {option.price_rwf === 0 ? t('market_delivery_free') : `${option.price_rwf} RWF`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{t(option.eta)}</p>
                  </button>
                ))}
              </div>
            </div>

            {getSelectedDeliveryOption() && (
              <div className="mt-4 rounded-xl bg-gray-50 p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('market_delivery_price')}</span>
                  <span className="font-medium text-gray-800">
                    {getSelectedDeliveryOption().price_rwf === 0 ? t('market_delivery_free') : `${getSelectedDeliveryOption().price_rwf} RWF`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('market_delivery_time')}</span>
                  <span className="font-medium text-gray-800">{t(getSelectedDeliveryOption().eta)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-500">{t('market_total_price')}</span>
                  <span className="font-semibold text-gray-900">{getTotalPrice()} RWF</span>
                </div>
              </div>
            )}

            {orderMessage && <p className="text-sm text-primary mt-3">{orderMessage}</p>}

            <button type="button" className="btn-primary mt-4" onClick={confirmOrder}>
              {t('market_confirm_order')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
