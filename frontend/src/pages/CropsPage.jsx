import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CropStatusBadge from '../components/CropStatusBadge';
import { useStore } from '../store/useStore';
import client from '../api/client';
import { CropsIcon } from '../components/AppIcon';

const CROP_TYPES = ['maize', 'beans', 'sorghum', 'irish_potato', 'sweet_potato', 'cassava', 'vegetables', 'other'];
const CROP_STATUSES = [
  { value: 'seedling', label: 'Planting / Seedling' },
  { value: 'growing', label: 'Growing' },
  { value: 'harvested', label: 'Harvesting' },
];
const ICONS = { maize: 'M', beans: 'B', sorghum: 'S', irish_potato: 'P', sweet_potato: 'SP', cassava: 'C', vegetables: 'V' };

export default function CropsPage() {
  const crops = useStore((s) => s.crops);
  const farms = useStore((s) => s.farms);
  const setCrops = useStore((s) => s.setCrops);
  const setFarms = useStore((s) => s.setFarms);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [cropType, setCropType] = useState('maize');
  const [cropStatus, setCropStatus] = useState('seedling');
  const [plotName, setPlotName] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [plantedAt, setPlantedAt] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    Promise.all([client.get('/crops'), client.get('/farms')])
      .then(([c, f]) => {
        setCrops(c.data);
        setFarms(f.data);
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [setCrops, setFarms]);

  const hasFarms = farms.length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hasFarms) return setError('Register a farm first.');

    setError('');
    setSaving(true);
    try {
      const res = await client.post('/crops', {
        farm_id: farms[0].id,
        crop_type: cropType,
        status: cropStatus,
        plot_name: plotName || undefined,
        area_ha: areaHa ? parseFloat(areaHa) : undefined,
        planted_at: plantedAt ? new Date(plantedAt).toISOString() : undefined,
      });
      setCrops([...crops, res.data]);
      setShowForm(false);
      setPlotName('');
      setAreaHa('');
      setCropStatus('seedling');
    } catch {
      setError('Failed to save. Check your connection.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card bg-gradient-to-r from-emerald-50 via-white to-amber-50 border-emerald-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <CropsIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">My crops</h1>
              <p className="text-sm text-gray-500 mt-1">Track what is planted, where it is growing, and what needs attention.</p>
            </div>
          </div>
          <div className="pt-0.5">
        {hasFarms ? (
          <button onClick={() => setShowForm(!showForm)} className="text-sm font-medium text-primary hover:underline">
            {showForm ? 'Cancel' : '+ Add crop'}
          </button>
        ) : (
          <Link to="/farms" className="text-sm font-medium text-primary hover:underline">
            + Register farm
          </Link>
        )}
          </div>
        </div>
      </div>

      {!hasFarms && !loading && (
        <div className="card border-primary/20">
          <p className="text-sm text-gray-700">You need to register a farm before adding crops.</p>
          <Link to="/farms" className="text-sm text-primary font-medium hover:underline mt-2 inline-block">
            Go to Farm Registration
          </Link>
        </div>
      )}

      {showForm && hasFarms && (
        <form onSubmit={handleSubmit} className="card space-y-4 border-primary/30">
          <h2 className="text-sm font-medium text-gray-700">Register a crop</h2>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Crop type</label>
            <div className="flex flex-wrap gap-2">
              {CROP_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCropType(t)}
                  className={`pill text-xs capitalize ${cropType === t ? 'pill-active' : ''}`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Plot name (optional)</label>
              <input className="input text-sm" value={plotName} onChange={(e) => setPlotName(e.target.value)} placeholder="e.g. Plot A" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Area (ha)</label>
              <input className="input text-sm" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} placeholder="e.g. 0.8" type="number" step="0.1" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Crop stage</label>
            <div className="flex flex-wrap gap-2">
              {CROP_STATUSES.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setCropStatus(status.value)}
                  className={`pill text-xs ${cropStatus === status.value ? 'pill-active' : ''}`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Planting date</label>
            <input className="input text-sm" type="date" value={plantedAt} onChange={(e) => setPlantedAt(e.target.value)} />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save crop'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : crops.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CropsIcon className="h-7 w-7" />
          </div>
          <p className="text-gray-500 text-sm">No crops yet.</p>
          {hasFarms ? (
            <button onClick={() => setShowForm(true)} className="text-primary text-sm mt-2 hover:underline">
              Register your first crop
            </button>
          ) : (
            <Link to="/farms" className="text-primary text-sm mt-2 hover:underline inline-block">
              Register your first farm
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {crops.map((crop) => (
            <div key={crop.id} className="card flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {ICONS[crop.crop_type] || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 capitalize">{crop.crop_type.replace('_', ' ')}</p>
                <p className="text-xs text-gray-400">
                  {crop.plot_name ? `${crop.plot_name} - ` : ''}
                  {crop.area_ha ? `${crop.area_ha} ha - ` : ''}
                  {crop.planted_at
                    ? `Planted ${new Date(crop.planted_at).toLocaleDateString('en-RW', { day: 'numeric', month: 'short' })}`
                    : ''}
                </p>
              </div>
              <CropStatusBadge status={crop.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
