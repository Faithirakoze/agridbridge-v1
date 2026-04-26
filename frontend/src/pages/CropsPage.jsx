import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import CropStatusBadge from '../components/CropStatusBadge';
import { CropsIcon } from '../components/AppIcon';
import { createTranslator, formatLocalizedDate, getCropTypeLabel } from '../i18n';
import { useStore } from '../store/useStore';

const CROP_TYPES = ['maize', 'beans', 'sorghum', 'irish_potato', 'sweet_potato', 'cassava', 'vegetables', 'other'];
const ICONS = { maize: 'M', beans: 'B', sorghum: 'S', irish_potato: 'P', sweet_potato: 'SP', cassava: 'C', vegetables: 'V' };

export default function CropsPage() {
  const language = useStore((s) => s.language);
  const crops = useStore((s) => s.crops);
  const farms = useStore((s) => s.farms);
  const setCrops = useStore((s) => s.setCrops);
  const setFarms = useStore((s) => s.setFarms);
  const t = createTranslator(language);

  const cropStages = [
    { value: 'seedling', label: t('crops_stage_seedling') },
    { value: 'growing', label: t('crops_stage_growing') },
    { value: 'harvested', label: t('crops_stage_harvested') },
  ];

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const [cropType, setCropType] = useState('maize');
  const [cropStatus, setCropStatus] = useState('seedling');
  const [plotName, setPlotName] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [plantedAt, setPlantedAt] = useState(new Date().toISOString().split('T')[0]);
  const [editingCropId, setEditingCropId] = useState('');
  const [cropDraft, setCropDraft] = useState({
    farm_id: '',
    crop_type: 'maize',
    plot_name: '',
    area_ha: '',
    planted_at: '',
    status: 'seedling',
  });

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

  function formatCropLabel(crop) {
    return `${getCropTypeLabel(crop.crop_type, language)}${crop.plot_name ? ` - ${crop.plot_name}` : ''}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hasFarms) return setError(t('crops_register_farm_first'));

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
      setError(t('crops_save_error'));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(crop) {
    setEditingCropId(crop.id);
    setCropDraft({
      farm_id: crop.farm_id,
      crop_type: crop.crop_type || 'maize',
      plot_name: crop.plot_name || '',
      area_ha: crop.area_ha?.toString() || '',
      planted_at: crop.planted_at ? new Date(crop.planted_at).toISOString().split('T')[0] : '',
      status: crop.status || 'seedling',
    });
  }

  async function saveCrop(cropIdToSave) {
    if (!cropDraft.farm_id) return setError(t('crops_select_farm'));

    setError('');
    setActionLoading(`save-${cropIdToSave}`);
    try {
      const res = await client.put(`/crops/${cropIdToSave}`, {
        farm_id: cropDraft.farm_id,
        crop_type: cropDraft.crop_type,
        plot_name: cropDraft.plot_name.trim() || undefined,
        area_ha: cropDraft.area_ha ? parseFloat(cropDraft.area_ha) : undefined,
        planted_at: cropDraft.planted_at ? new Date(cropDraft.planted_at).toISOString() : undefined,
        status: cropDraft.status,
      });
      setCrops(crops.map((crop) => (crop.id === cropIdToSave ? res.data : crop)));
      setEditingCropId('');
    } catch {
      setError(t('crops_update_error'));
    } finally {
      setActionLoading('');
    }
  }

  async function deleteCrop(crop) {
    if (!window.confirm(t('crops_delete_confirm', { label: formatCropLabel(crop) }))) return;

    setError('');
    setActionLoading(`delete-${crop.id}`);
    try {
      await client.delete(`/crops/${crop.id}`);
      setCrops(crops.filter((item) => item.id !== crop.id));
      if (editingCropId === crop.id) setEditingCropId('');
    } catch {
      setError(t('crops_delete_error'));
    } finally {
      setActionLoading('');
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
              <h1 className="text-xl font-semibold text-gray-800">{t('crops_title')}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('crops_subtitle')}</p>
            </div>
          </div>
          <div className="pt-0.5">
            {hasFarms ? (
              <button onClick={() => setShowForm(!showForm)} className="text-sm font-medium text-primary hover:underline">
                {showForm ? t('common_cancel') : t('crops_add')}
              </button>
            ) : (
              <Link to="/farms" className="text-sm font-medium text-primary hover:underline">
                {t('crops_register_farm')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {!hasFarms && !loading && (
        <div className="card border-primary/20">
          <p className="text-sm text-gray-700">{t('crops_need_farm')}</p>
          <Link to="/farms" className="text-sm text-primary font-medium hover:underline mt-2 inline-block">
            {t('crops_go_farms')}
          </Link>
        </div>
      )}

      {showForm && hasFarms && (
        <form onSubmit={handleSubmit} className="card space-y-4 border-primary/30">
          <h2 className="text-sm font-medium text-gray-700">{t('crops_register')}</h2>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">{t('crops_crop_type')}</label>
            <div className="flex flex-wrap gap-2">
              {CROP_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCropType(type)}
                  className={`pill text-xs capitalize ${cropType === type ? 'pill-active' : ''}`}
                >
                  {getCropTypeLabel(type, language)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('crops_plot_name_optional')}</label>
              <input className="input text-sm" value={plotName} onChange={(e) => setPlotName(e.target.value)} placeholder={t('crops_plot_placeholder')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('farms_area')}</label>
              <input className="input text-sm" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} placeholder="0.8" type="number" step="0.1" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">{t('crops_stage')}</label>
            <div className="flex flex-wrap gap-2">
              {cropStages.map((status) => (
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
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('crops_planting_date')}</label>
            <input className="input text-sm" type="date" value={plantedAt} onChange={(e) => setPlantedAt(e.target.value)} />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? t('crops_saving') : t('crops_save')}
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
          <p className="text-gray-500 text-sm">{t('crops_none')}</p>
          {hasFarms ? (
            <button onClick={() => setShowForm(true)} className="text-primary text-sm mt-2 hover:underline">
              {t('crops_first_crop')}
            </button>
          ) : (
            <Link to="/farms" className="text-primary text-sm mt-2 hover:underline inline-block">
              {t('crops_first_farm')}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {crops.map((crop) => (
            <div key={crop.id} className="card flex items-start gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {ICONS[crop.crop_type] || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                {editingCropId === crop.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="input text-sm"
                        value={cropDraft.farm_id}
                        onChange={(e) => setCropDraft({ ...cropDraft, farm_id: e.target.value })}
                      >
                        {farms.map((farm) => (
                          <option key={farm.id} value={farm.id}>{farm.name}</option>
                        ))}
                      </select>
                      <select
                        className="input text-sm"
                        value={cropDraft.crop_type}
                        onChange={(e) => setCropDraft({ ...cropDraft, crop_type: e.target.value })}
                      >
                        {CROP_TYPES.map((type) => (
                          <option key={type} value={type}>{getCropTypeLabel(type, language)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input text-sm"
                        value={cropDraft.plot_name}
                        onChange={(e) => setCropDraft({ ...cropDraft, plot_name: e.target.value })}
                        placeholder={t('crops_plot_name_optional')}
                      />
                      <input
                        className="input text-sm"
                        value={cropDraft.area_ha}
                        onChange={(e) => setCropDraft({ ...cropDraft, area_ha: e.target.value })}
                        placeholder={t('farms_area')}
                        type="number"
                        step="0.1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input text-sm"
                        type="date"
                        value={cropDraft.planted_at}
                        onChange={(e) => setCropDraft({ ...cropDraft, planted_at: e.target.value })}
                      />
                      <select
                        className="input text-sm"
                        value={cropDraft.status}
                        onChange={(e) => setCropDraft({ ...cropDraft, status: e.target.value })}
                      >
                        {cropStages.map((status) => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3 text-xs font-medium">
                      <button type="button" className="text-primary hover:underline" onClick={() => saveCrop(crop.id)}>
                        {actionLoading === `save-${crop.id}` ? t('common_saving') : t('common_save')}
                      </button>
                      <button type="button" className="text-gray-500 hover:underline" onClick={() => setEditingCropId('')}>
                        {t('common_cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-800">{getCropTypeLabel(crop.crop_type, language)}</p>
                    <p className="text-xs text-gray-400">
                      {crop.plot_name ? `${crop.plot_name} - ` : ''}
                      {crop.area_ha ? `${crop.area_ha} ha - ` : ''}
                      {crop.planted_at
                        ? `${t('crops_planting_date')}: ${formatLocalizedDate(crop.planted_at, language, { day: 'numeric', month: 'short' })}`
                        : ''}
                    </p>
                    <div className="flex gap-3 text-xs font-medium mt-2">
                      <button type="button" className="text-primary hover:underline" onClick={() => startEdit(crop)}>
                        {t('common_edit')}
                      </button>
                      <button type="button" className="text-red-500 hover:underline" onClick={() => deleteCrop(crop)}>
                        {actionLoading === `delete-${crop.id}` ? t('common_deleting') : t('common_delete')}
                      </button>
                    </div>
                  </>
                )}
              </div>
              {editingCropId !== crop.id && <CropStatusBadge status={crop.status} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
