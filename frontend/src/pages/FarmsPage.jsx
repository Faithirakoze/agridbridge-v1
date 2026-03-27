import { useEffect, useState } from 'react';
import client from '../api/client';
import { useStore } from '../store/useStore';
import { FarmsIcon } from '../components/AppIcon';

export default function FarmsPage() {
  const farms = useStore((s) => s.farms);
  const setFarms = useStore((s) => s.setFarms);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [district, setDistrict] = useState('Kigali');

  useEffect(() => {
    client
      .get('/farms')
      .then((res) => setFarms(res.data))
      .catch(() => setError('Could not load farms.'))
      .finally(() => setLoading(false));
  }, [setFarms]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Enter a farm name.');
    if (!areaHa || Number(areaHa) <= 0) return setError('Enter a valid area in hectares.');

    setError('');
    setSaving(true);
    try {
      const res = await client.post('/farms', {
        name: name.trim(),
        area_ha: parseFloat(areaHa),
        district: district.trim() || 'Kigali',
      });
      setFarms([...farms, res.data]);
      setName('');
      setAreaHa('');
      setDistrict('Kigali');
    } catch {
      setError('Could not register farm. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card bg-gradient-to-r from-emerald-50 via-white to-lime-50 border-emerald-100">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <FarmsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">My farms</h1>
            <p className="text-sm text-gray-500 mt-1">Register at least one farm before adding crops.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 border-primary/30">
        <h2 className="text-sm font-medium text-gray-700">Register a farm</h2>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Farm name</label>
          <input
            className="input text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sunrise Plot"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Area (ha)</label>
            <input
              className="input text-sm"
              value={areaHa}
              onChange={(e) => setAreaHa(e.target.value)}
              placeholder="e.g. 1.5"
              type="number"
              step="0.1"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">District</label>
            <input
              className="input text-sm"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Kigali"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save farm'}
        </button>
      </form>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : farms.length === 0 ? (
        <div className="card text-sm text-gray-500 text-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <FarmsIcon className="h-6 w-6" />
          </div>
          No farms registered yet.
        </div>
      ) : (
        <div className="space-y-2">
          {farms.map((farm) => (
            <div key={farm.id} className="card flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <FarmsIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{farm.name}</p>
                <p className="text-xs text-gray-400">
                  {farm.area_ha} ha {farm.district ? `- ${farm.district}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
