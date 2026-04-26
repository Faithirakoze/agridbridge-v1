import { useEffect, useState } from 'react';
import client from '../api/client';
import { createTranslator } from '../i18n';
import { useStore } from '../store/useStore';
import { FarmsIcon } from '../components/AppIcon';

export default function FarmsPage() {
  const language = useStore((s) => s.language);
  const farms = useStore((s) => s.farms);
  const setFarms = useStore((s) => s.setFarms);
  const t = createTranslator(language);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [district, setDistrict] = useState('Kigali');
  const [editingFarmId, setEditingFarmId] = useState('');
  const [farmDraft, setFarmDraft] = useState({ name: '', area_ha: '', district: 'Kigali' });

  useEffect(() => {
    client
      .get('/farms')
      .then((res) => setFarms(res.data))
      .catch(() => setError(t('farms_load_error')))
      .finally(() => setLoading(false));
  }, [setFarms]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError(t('farms_enter_name'));
    if (!areaHa || Number(areaHa) <= 0) return setError(t('farms_enter_area'));

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
      setError(t('farms_create_error'));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(farm) {
    setEditingFarmId(farm.id);
    setFarmDraft({
      name: farm.name || '',
      area_ha: farm.area_ha?.toString() || '',
      district: farm.district || 'Kigali',
    });
  }

  async function saveFarm(farmId) {
    if (!farmDraft.name.trim()) return setError(t('farms_enter_name'));
    if (!farmDraft.area_ha || Number(farmDraft.area_ha) <= 0) return setError(t('farms_enter_area'));

    setError('');
    setActionLoading(`save-${farmId}`);
    try {
      const res = await client.put(`/farms/${farmId}`, {
        name: farmDraft.name.trim(),
        area_ha: parseFloat(farmDraft.area_ha),
        district: farmDraft.district.trim() || 'Kigali',
      });
      setFarms(farms.map((farm) => (farm.id === farmId ? res.data : farm)));
      setEditingFarmId('');
    } catch {
      setError(t('farms_update_error'));
    } finally {
      setActionLoading('');
    }
  }

  async function deleteFarm(farm) {
    if (!window.confirm(t('farms_delete_confirm', { name: farm.name }))) return;

    setError('');
    setActionLoading(`delete-${farm.id}`);
    try {
      await client.delete(`/farms/${farm.id}`);
      setFarms(farms.filter((item) => item.id !== farm.id));
      if (editingFarmId === farm.id) setEditingFarmId('');
    } catch {
      setError(t('farms_delete_error'));
    } finally {
      setActionLoading('');
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
            <h1 className="text-xl font-semibold text-gray-800">{t('farms_title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('farms_subtitle')}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 border-primary/30">
        <h2 className="text-sm font-medium text-gray-700">{t('farms_register')}</h2>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('farms_name')}</label>
          <input
            className="input text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('farms_name_placeholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('farms_area')}</label>
            <input
              className="input text-sm"
              value={areaHa}
              onChange={(e) => setAreaHa(e.target.value)}
              placeholder={t('farms_area_placeholder')}
              type="number"
              step="0.1"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('farms_district')}</label>
            <input
              className="input text-sm"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={t('farms_district_placeholder')}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? t('farms_saving') : t('farms_save')}
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
          {t('farms_none')}
        </div>
      ) : (
        <div className="space-y-2">
          {farms.map((farm) => (
            <div key={farm.id} className="card flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <FarmsIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                {editingFarmId === farm.id ? (
                  <div className="space-y-3">
                    <input
                      className="input text-sm"
                      value={farmDraft.name}
                      onChange={(e) => setFarmDraft({ ...farmDraft, name: e.target.value })}
                      placeholder={t('farms_name')}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input text-sm"
                        value={farmDraft.area_ha}
                        onChange={(e) => setFarmDraft({ ...farmDraft, area_ha: e.target.value })}
                        placeholder={t('farms_area')}
                        type="number"
                        step="0.1"
                      />
                      <input
                        className="input text-sm"
                        value={farmDraft.district}
                        onChange={(e) => setFarmDraft({ ...farmDraft, district: e.target.value })}
                        placeholder={t('farms_district')}
                      />
                    </div>
                    <div className="flex gap-3 text-xs font-medium">
                      <button type="button" className="text-primary hover:underline" onClick={() => saveFarm(farm.id)}>
                        {actionLoading === `save-${farm.id}` ? t('common_saving') : t('common_save')}
                      </button>
                      <button type="button" className="text-gray-500 hover:underline" onClick={() => setEditingFarmId('')}>
                        {t('common_cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-800">{farm.name}</p>
                    <p className="text-xs text-gray-400">
                      {farm.area_ha} ha {farm.district ? `- ${farm.district}` : ''}
                    </p>
                    <div className="flex gap-3 text-xs font-medium mt-2">
                      <button type="button" className="text-primary hover:underline" onClick={() => startEdit(farm)}>
                        {t('common_edit')}
                      </button>
                      <button type="button" className="text-red-500 hover:underline" onClick={() => deleteFarm(farm)}>
                        {actionLoading === `delete-${farm.id}` ? t('common_deleting') : t('common_delete')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
