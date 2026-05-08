import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import CropStatusBadge from '../components/CropStatusBadge';
import { CropsIcon } from '../components/AppIcon';
import { createTranslator, formatLocalizedDate, getCropTypeLabel } from '../i18n';
import { useStore } from '../store/useStore';

const CROP_TYPES = ['maize', 'beans', 'sorghum', 'irish_potato', 'sweet_potato', 'cassava', 'vegetables', 'other'];
const ICONS = { maize: 'M', beans: 'B', sorghum: 'S', irish_potato: 'P', sweet_potato: 'SP', cassava: 'C', vegetables: 'V' };
const CROP_WATER_NEEDS = {
  maize: 5.2,
  beans: 4.1,
  sorghum: 3.4,
  irish_potato: 4.8,
  sweet_potato: 3.6,
  cassava: 3,
  vegetables: 5.8,
  other: 4,
};
const STATUS_WATER_FACTOR = { seedling: 0.65, growing: 1, harvested: 0.15, at_risk: 1.15 };
const AUTOMATION_LIMITS = {
  startMoisture: 38,
  targetMoisture: 62,
  minTankLevel: 18,
  maxPressure: 4.2,
  minFlowRate: 1.2,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getIrrigationInsight(crop, soilMoisture, rainForecast) {
  const areaHa = Number(crop.area_ha) || 0.1;
  const baseNeed = CROP_WATER_NEEDS[crop.crop_type] || CROP_WATER_NEEDS.other;
  const stageFactor = STATUS_WATER_FACTOR[crop.status] || 1;
  const stressFactor = soilMoisture < 35 ? 1.25 : soilMoisture > 70 ? 0.35 : 1;
  const rainfallOffset = Math.min(Number(rainForecast) || 0, baseNeed * 1.2);
  const dailyMm = Math.max((baseNeed * stageFactor * stressFactor) - rainfallOffset, 0);
  const liters = Math.round(dailyMm * areaHa * 10000);
  const urgency = soilMoisture < 30 || dailyMm >= 5 ? 'high' : soilMoisture < 55 || dailyMm >= 2.5 ? 'medium' : 'low';

  return {
    dailyMm,
    liters,
    urgency,
    minutes: Math.max(Math.round(liters / 550), 5),
  };
}

function getAutomationDecision(sensorData, irrigationPlan, rainForecast, automationMode, manualPumpOn) {
  const faults = [];
  if (sensorData.tankLevel < AUTOMATION_LIMITS.minTankLevel) faults.push('low_water');
  if (sensorData.linePressure > AUTOMATION_LIMITS.maxPressure) faults.push('high_pressure');
  if (manualPumpOn && sensorData.flowRate < AUTOMATION_LIMITS.minFlowRate) faults.push('low_flow');

  const needsWater =
    irrigationPlan &&
    irrigationPlan.urgency !== 'low' &&
    sensorData.soilMoisture < AUTOMATION_LIMITS.targetMoisture &&
    Number(rainForecast) < 3;
  const autoPumpOn = Boolean(needsWater && sensorData.soilMoisture <= AUTOMATION_LIMITS.startMoisture && faults.length === 0);
  const pumpOn = automationMode === 'auto' ? autoPumpOn : manualPumpOn && faults.length === 0;
  const valveOpen = pumpOn ? (irrigationPlan?.urgency === 'high' ? 100 : 65) : 0;

  let action = 'standby';
  if (faults.length > 0) action = 'locked';
  else if (pumpOn) action = 'irrigating';
  else if (needsWater) action = 'waiting';

  return { pumpOn, valveOpen, faults, action };
}

function getMoistureInterpretation(value) {
  if (value < AUTOMATION_LIMITS.startMoisture) return 'dry';
  if (value < AUTOMATION_LIMITS.targetMoisture) return 'low';
  if (value <= 75) return 'optimal';
  return 'wet';
}

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
  const [selectedIrrigationCropId, setSelectedIrrigationCropId] = useState('');
  const [soilMoisture, setSoilMoisture] = useState(42);
  const [rainForecast, setRainForecast] = useState(0);
  const [waterSource, setWaterSource] = useState('tap');
  const [liveSensors, setLiveSensors] = useState(true);
  const [automationMode, setAutomationMode] = useState('auto');
  const [manualPumpOn, setManualPumpOn] = useState(false);
  const [sensorData, setSensorData] = useState({
    soilMoisture: 42,
    tankLevel: 76,
    linePressure: 2.1,
    flowRate: 0,
    temperature: 27,
    lastUpdated: new Date(),
  });
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
  const activeIrrigationCrops = useMemo(() => crops.filter((crop) => crop.status !== 'harvested'), [crops]);
  const selectedIrrigationCrop = useMemo(
    () => activeIrrigationCrops.find((crop) => crop.id === selectedIrrigationCropId) || activeIrrigationCrops[0],
    [activeIrrigationCrops, selectedIrrigationCropId]
  );
  const irrigationPlan = useMemo(() => {
    if (!selectedIrrigationCrop) return null;
    return getIrrigationInsight(selectedIrrigationCrop, Number(soilMoisture), Number(rainForecast));
  }, [selectedIrrigationCrop, soilMoisture, rainForecast]);
  const totalWaterLiters = useMemo(
    () => activeIrrigationCrops.reduce((sum, crop) => sum + getIrrigationInsight(crop, Number(soilMoisture), Number(rainForecast)).liters, 0),
    [activeIrrigationCrops, soilMoisture, rainForecast]
  );
  const highPriorityCount = useMemo(
    () => activeIrrigationCrops.filter((crop) => getIrrigationInsight(crop, Number(soilMoisture), Number(rainForecast)).urgency === 'high').length,
    [activeIrrigationCrops, soilMoisture, rainForecast]
  );
  const automationDecision = useMemo(
    () => getAutomationDecision(sensorData, irrigationPlan, rainForecast, automationMode, manualPumpOn),
    [sensorData, irrigationPlan, rainForecast, automationMode, manualPumpOn]
  );
  const moistureGap = Math.max(AUTOMATION_LIMITS.targetMoisture - Number(soilMoisture), 0);
  const moistureInterpretation = getMoistureInterpretation(Number(soilMoisture));

  useEffect(() => {
    if (activeIrrigationCrops.length > 0 && !activeIrrigationCrops.some((crop) => crop.id === selectedIrrigationCropId)) {
      setSelectedIrrigationCropId(activeIrrigationCrops[0].id);
    }
  }, [activeIrrigationCrops, selectedIrrigationCropId]);

  useEffect(() => {
    if (!liveSensors) return undefined;

    const intervalId = window.setInterval(() => {
      setSensorData((current) => {
        const decision = getAutomationDecision(current, irrigationPlan, rainForecast, automationMode, manualPumpOn);
        const moistureDrift = decision.pumpOn ? 1.8 : -0.35;
        const nextMoisture = clamp(current.soilMoisture + moistureDrift + (Math.random() - 0.5) * 1.2, 12, 88);
        const nextTankLevel = clamp(current.tankLevel - (decision.pumpOn ? 0.8 : 0.05), 0, 100);
        const nextPressure = decision.pumpOn ? clamp(2.4 + Math.random() * 1.2, 1.8, 4.6) : clamp(0.4 + Math.random() * 0.5, 0.2, 1.2);
        const nextFlowRate = decision.pumpOn ? clamp(10 + Math.random() * 6, 7, 18) : 0;

        return {
          soilMoisture: Math.round(nextMoisture),
          tankLevel: Math.round(nextTankLevel),
          linePressure: Number(nextPressure.toFixed(1)),
          flowRate: Number(nextFlowRate.toFixed(1)),
          temperature: Number(clamp(current.temperature + (Math.random() - 0.5) * 0.6, 18, 34).toFixed(1)),
          lastUpdated: new Date(),
        };
      });
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [automationMode, irrigationPlan, liveSensors, manualPumpOn, rainForecast]);

  useEffect(() => {
    if (liveSensors) {
      setSoilMoisture(sensorData.soilMoisture);
    }
  }, [liveSensors, sensorData.soilMoisture]);

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
    <div className="flex flex-col gap-5">
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

      {!loading && crops.length > 0 && (
        <div className="card order-last border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-medium text-sky-700 uppercase tracking-wider">{t('irrigation_label')}</p>
              <h2 className="text-lg font-semibold text-gray-800 mt-1">{t('irrigation_title')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('irrigation_hint')}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl flex-shrink-0">
              ~
            </div>
          </div>

          {activeIrrigationCrops.length === 0 ? (
            <p className="text-sm text-gray-500">{t('irrigation_no_active_crops')}</p>
          ) : (
            <div className="space-y-4">
              {irrigationPlan && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: t('irrigation_metric_moisture'), value: `${soilMoisture}%`, note: t(`irrigation_moisture_${moistureInterpretation}`), level: moistureInterpretation === 'dry' ? 'bad' : moistureInterpretation === 'low' ? 'warn' : 'ok' },
                    { label: t('irrigation_metric_gap'), value: `${moistureGap}%`, note: `${t('irrigation_target')} ${AUTOMATION_LIMITS.targetMoisture}%`, level: moistureGap > 20 ? 'bad' : moistureGap > 0 ? 'warn' : 'ok' },
                    { label: t('irrigation_metric_water'), value: `${irrigationPlan.liters.toLocaleString()} L`, note: `${irrigationPlan.dailyMm.toFixed(1)} mm`, level: irrigationPlan.urgency === 'high' ? 'bad' : irrigationPlan.urgency === 'medium' ? 'warn' : 'ok' },
                    { label: t('irrigation_metric_runtime'), value: t('irrigation_minutes', { minutes: irrigationPlan.minutes }), note: t(`irrigation_priority_${irrigationPlan.urgency}`), level: irrigationPlan.urgency === 'high' ? 'bad' : irrigationPlan.urgency === 'medium' ? 'warn' : 'ok' },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-xl bg-white border border-sky-100 p-3">
                      <p className="text-[11px] text-gray-400">{metric.label}</p>
                      <p className="text-xl font-semibold text-gray-800 mt-1">{metric.value}</p>
                      <p className={`text-xs font-medium mt-1 ${metric.level === 'bad' ? 'text-red-600' : metric.level === 'warn' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {metric.note}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('irrigation_crop')}</label>
                  <select
                    className="input text-sm"
                    value={selectedIrrigationCrop?.id || ''}
                    onChange={(e) => setSelectedIrrigationCropId(e.target.value)}
                  >
                    {activeIrrigationCrops.map((crop) => (
                      <option key={crop.id} value={crop.id}>{formatCropLabel(crop)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    {t('irrigation_soil_moisture', { value: soilMoisture })}
                  </label>
                  <input
                    className="w-full accent-sky-600"
                    type="range"
                    min="10"
                    max="90"
                    value={soilMoisture}
                    disabled={liveSensors}
                    onChange={(e) => {
                      setLiveSensors(false);
                      setSoilMoisture(Number(e.target.value));
                      setSensorData({ ...sensorData, soilMoisture: Number(e.target.value), lastUpdated: new Date() });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('irrigation_rain_forecast')}</label>
                  <input
                    className="input text-sm"
                    type="number"
                    min="0"
                    step="0.5"
                    value={rainForecast}
                    onChange={(e) => setRainForecast(clamp(Number(e.target.value), 0, 50))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['tap', 'tank', 'canal'].map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setWaterSource(source)}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      waterSource === source ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-sky-300'
                    }`}
                  >
                    {t(`irrigation_source_${source}`)}
                  </button>
                ))}
              </div>

              <div className="rounded-xl bg-white border border-sky-100 p-3 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t('automation_title')}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('automation_summary', {
                        start: AUTOMATION_LIMITS.startMoisture,
                        target: AUTOMATION_LIMITS.targetMoisture,
                        pressure: AUTOMATION_LIMITS.maxPressure,
                      })}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    automationDecision.action === 'locked' ? 'bg-red-50 text-red-600' : automationDecision.pumpOn ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {t(`automation_status_${automationDecision.action}`)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setLiveSensors(!liveSensors)}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${liveSensors ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    {liveSensors ? t('automation_live_on') : t('automation_live_off')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutomationMode(automationMode === 'auto' ? 'manual' : 'auto')}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${automationMode === 'auto' ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    {automationMode === 'auto' ? t('automation_mode_auto') : t('automation_mode_manual')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualPumpOn(!manualPumpOn)}
                    disabled={automationMode === 'auto'}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${manualPumpOn ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    {manualPumpOn ? t('automation_pump_on') : t('automation_pump_off')}
                  </button>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    <span className="font-semibold text-gray-800">{automationDecision.valveOpen}%</span> {t('automation_valve_open')}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: t('automation_sensor_moisture'), value: `${sensorData.soilMoisture}%`, level: sensorData.soilMoisture < 35 ? 'bad' : 'ok' },
                    { label: t('automation_sensor_tank'), value: `${sensorData.tankLevel}%`, level: sensorData.tankLevel < AUTOMATION_LIMITS.minTankLevel ? 'bad' : 'ok' },
                    { label: t('automation_sensor_pressure'), value: `${sensorData.linePressure} bar`, level: sensorData.linePressure > AUTOMATION_LIMITS.maxPressure ? 'bad' : 'ok' },
                    { label: t('automation_sensor_flow'), value: `${sensorData.flowRate} L/min`, level: automationDecision.pumpOn && sensorData.flowRate < AUTOMATION_LIMITS.minFlowRate ? 'bad' : 'ok' },
                    { label: t('automation_sensor_temp'), value: `${sensorData.temperature} C`, level: 'ok' },
                  ].map((sensor) => (
                    <div key={sensor.label} className="rounded-xl border border-gray-100 bg-gray-50 p-2">
                      <p className="text-[11px] text-gray-400">{sensor.label}</p>
                      <p className={`text-sm font-semibold mt-1 ${sensor.level === 'bad' ? 'text-red-600' : 'text-gray-800'}`}>{sensor.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl bg-sky-50 border border-sky-100 p-2">
                    <p className="text-gray-400">{t('automation_start')}</p>
                    <p className="font-semibold text-gray-800">{AUTOMATION_LIMITS.startMoisture}%</p>
                  </div>
                  <div className="rounded-xl bg-sky-50 border border-sky-100 p-2">
                    <p className="text-gray-400">{t('automation_stop')}</p>
                    <p className="font-semibold text-gray-800">{AUTOMATION_LIMITS.targetMoisture}%</p>
                  </div>
                  <div className="rounded-xl bg-sky-50 border border-sky-100 p-2">
                    <p className="text-gray-400">{t('automation_lockout')}</p>
                    <p className="font-semibold text-gray-800">{AUTOMATION_LIMITS.maxPressure} bar</p>
                  </div>
                </div>

                <div className="rounded-xl bg-sky-50 border border-sky-100 px-3 py-2 text-xs font-medium text-gray-600">
                  {automationDecision.faults.length > 0
                    ? t('automation_faults', { faults: automationDecision.faults.map((fault) => t(`automation_fault_${fault}`)).join(', ') })
                    : t(`automation_interpretation_${automationDecision.action}`)}
                </div>
              </div>

              <div className="rounded-xl bg-white border border-sky-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t('irrigation_decision')}</p>
                    <p className={`text-xs font-semibold mt-1 ${irrigationPlan?.urgency === 'high' ? 'text-red-600' : irrigationPlan?.urgency === 'medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {irrigationPlan?.urgency === 'high' ? t('irrigation_interpretation_high') : irrigationPlan?.urgency === 'medium' ? t('irrigation_interpretation_medium') : t('irrigation_interpretation_low')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{t('irrigation_total_today')}</p>
                    <p className="text-sm font-semibold text-gray-800">{totalWaterLiters.toLocaleString()} L</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-sky-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-full"
                    style={{ width: `${clamp((Number(soilMoisture) / 90) * 100, 8, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <p className="rounded-xl bg-white border border-sky-100 p-3 text-gray-600">
                  <span className="font-semibold text-gray-800">{highPriorityCount}</span> {t('irrigation_high_priority_count')}
                </p>
                <p className="rounded-xl bg-white border border-sky-100 p-3 text-gray-600">
                  {t('irrigation_source_note', { source: t(`irrigation_source_${waterSource}`) })}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && crops.length > 0 && (
        <div>
          <p className="section-label">{t('crops_registered')}</p>
        </div>
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
