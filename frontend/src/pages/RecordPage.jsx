import { useEffect, useState } from 'react';
import client from '../api/client';
import { RecordIcon } from '../components/AppIcon';
import { createTranslator, formatLocalizedDate, getActivityTypeLabel, getCropTypeLabel } from '../i18n';
import { useStore } from '../store/useStore';

const ACTIVITY_TYPES = ['planting', 'fertiliser_applied', 'pesticide_applied', 'weeding', 'irrigation', 'harvest', 'other'];

export default function RecordPage() {
  const language = useStore((s) => s.language);
  const crops = useStore((s) => s.crops);
  const setCrops = useStore((s) => s.setCrops);
  const t = createTranslator(language);

  const [activities, setActivities] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activityType, setActivityType] = useState('planting');
  const [cropId, setCropId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [editingActivityId, setEditingActivityId] = useState('');
  const [activityDraft, setActivityDraft] = useState({
    crop_id: '',
    activity_type: 'planting',
    activity_date: '',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    Promise.allSettled([client.get('/crops'), client.get('/activities')])
      .then(([cropsResult, activitiesResult]) => {
        if (cropsResult.status === 'fulfilled') {
          setCrops(cropsResult.value.data || []);
        }

        if (activitiesResult.status === 'fulfilled') {
          setActivities(activitiesResult.value.data || []);
        }

        if (cropsResult.status !== 'fulfilled' || activitiesResult.status !== 'fulfilled') {
          setError(t('record_save_error'));
        }
      })
      .finally(() => setPageLoading(false));
  }, [setCrops]);

  useEffect(() => {
    if (crops.length > 0 && !crops.some((crop) => crop.id === cropId)) {
      setCropId(crops[0].id);
    }

    if (crops.length === 0) {
      setCropId('');
    }
  }, [cropId, crops]);

  function formatCropLabel(crop) {
    if (!crop) return t('record_unknown_crop');
    return `${getCropTypeLabel(crop.crop_type, language)}${crop.plot_name ? ` - ${crop.plot_name}` : ''}`;
  }

  function showSuccess(message) {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cropId) return setError(t('record_select_crop'));

    setError('');
    setActionLoading('create-activity');
    try {
      const res = await client.post('/activities', {
        crop_id: cropId,
        activity_type: activityType,
        activity_date: new Date(date).toISOString(),
        quantity: quantity || undefined,
        notes: notes || undefined,
      });
      setActivities([res.data, ...activities]);
      setQuantity('');
      setNotes('');
      showSuccess(t('record_saved'));
    } catch {
      setError(t('record_save_error'));
    } finally {
      setActionLoading('');
    }
  }

  function startActivityEdit(activity) {
    setEditingActivityId(activity.id);
    setActivityDraft({
      crop_id: activity.crop_id,
      activity_type: activity.activity_type,
      activity_date: activity.activity_date ? new Date(activity.activity_date).toISOString().split('T')[0] : '',
      quantity: activity.quantity || '',
      notes: activity.notes || '',
    });
  }

  async function saveActivity(activityIdToSave) {
    if (!activityDraft.crop_id) return setError(t('record_select_crop_for_activity'));
    if (!activityDraft.activity_date) return setError(t('record_choose_date'));

    setError('');
    setActionLoading(`activity-save-${activityIdToSave}`);
    try {
      const res = await client.put(`/activities/${activityIdToSave}`, {
        crop_id: activityDraft.crop_id,
        activity_type: activityDraft.activity_type,
        activity_date: new Date(activityDraft.activity_date).toISOString(),
        quantity: activityDraft.quantity.trim() || undefined,
        notes: activityDraft.notes.trim() || undefined,
      });
      setActivities(
        activities
          .map((activity) => (activity.id === activityIdToSave ? res.data : activity))
          .sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date))
      );
      setEditingActivityId('');
      showSuccess(t('record_updated'));
    } catch {
      setError(t('record_update_error'));
    } finally {
      setActionLoading('');
    }
  }

  async function deleteActivity(activity) {
    if (!window.confirm(t('record_delete_confirm', { label: getActivityTypeLabel(activity.activity_type, language) }))) return;

    setError('');
    setActionLoading(`activity-delete-${activity.id}`);
    try {
      await client.delete(`/activities/${activity.id}`);
      setActivities(activities.filter((item) => item.id !== activity.id));
      if (editingActivityId === activity.id) setEditingActivityId('');
      showSuccess(t('record_deleted'));
    } catch {
      setError(t('record_delete_error'));
    } finally {
      setActionLoading('');
    }
  }

  return (
    <div className="space-y-5">
      <div className="card bg-gradient-to-r from-sky-50 via-white to-emerald-50 border-sky-100">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
            <RecordIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{t('record_title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('record_subtitle')}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <h2 className="text-sm font-medium text-gray-700">{t('record_log_title')}</h2>
          <p className="text-xs text-gray-400 mt-1">{t('record_log_hint')}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">{t('record_crop')}</label>
          {crops.length === 0 ? (
            <p className="text-sm text-gray-400">{t('record_no_crops')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => setCropId(crop.id)}
                  className={`pill text-xs ${cropId === crop.id ? 'pill-active' : ''}`}
                >
                  {formatCropLabel(crop)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">{t('record_activity_type')}</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActivityType(type)}
                className={`pill text-xs ${activityType === type ? 'pill-active' : ''}`}
              >
                {getActivityTypeLabel(type, language)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('record_date')}</label>
          <input className="input text-sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('record_quantity_optional')}</label>
          <input className="input text-sm" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={t('record_quantity_placeholder')} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('record_notes_optional')}</label>
          <textarea
            className="input text-sm resize-none"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('record_notes_placeholder')}
          />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}
        {success && <p className="text-green-600 text-xs font-medium">{success}</p>}

        <button type="submit" className="btn-primary" disabled={actionLoading === 'create-activity' || crops.length === 0}>
          {actionLoading === 'create-activity' ? t('common_saving') : t('record_save')}
        </button>
      </form>

      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
            <RecordIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{t('record_manage_title')}</h2>
            <p className="text-xs text-gray-400">{t('record_manage_hint')}</p>
          </div>
        </div>

        {pageLoading ? (
          <p className="text-sm text-gray-400">{t('record_loading')}</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-400">{t('record_none')}</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const crop = crops.find((item) => item.id === activity.crop_id);

              return (
                <div key={activity.id} className="rounded-2xl border border-gray-100 p-3 space-y-3">
                  {editingActivityId === activity.id ? (
                    <>
                      <select
                        className="input text-sm"
                        value={activityDraft.crop_id}
                        onChange={(e) => setActivityDraft({ ...activityDraft, crop_id: e.target.value })}
                      >
                        {crops.map((cropOption) => (
                          <option key={cropOption.id} value={cropOption.id}>{formatCropLabel(cropOption)}</option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="input text-sm"
                          value={activityDraft.activity_type}
                          onChange={(e) => setActivityDraft({ ...activityDraft, activity_type: e.target.value })}
                        >
                          {ACTIVITY_TYPES.map((type) => (
                            <option key={type} value={type}>{getActivityTypeLabel(type, language)}</option>
                          ))}
                        </select>
                        <input
                          className="input text-sm"
                          type="date"
                          value={activityDraft.activity_date}
                          onChange={(e) => setActivityDraft({ ...activityDraft, activity_date: e.target.value })}
                        />
                      </div>
                      <input
                        className="input text-sm"
                        value={activityDraft.quantity}
                        onChange={(e) => setActivityDraft({ ...activityDraft, quantity: e.target.value })}
                        placeholder={t('record_quantity_optional')}
                      />
                      <textarea
                        className="input text-sm resize-none"
                        rows={3}
                        value={activityDraft.notes}
                        onChange={(e) => setActivityDraft({ ...activityDraft, notes: e.target.value })}
                        placeholder={t('record_notes_optional')}
                      />
                      <div className="flex gap-3 text-xs font-medium">
                        <button type="button" className="text-primary hover:underline" onClick={() => saveActivity(activity.id)}>
                          {actionLoading === `activity-save-${activity.id}` ? t('common_saving') : t('common_save')}
                        </button>
                        <button type="button" className="text-gray-500 hover:underline" onClick={() => setEditingActivityId('')}>
                          {t('common_cancel')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{getActivityTypeLabel(activity.activity_type, language)}</p>
                        <p className="text-xs text-gray-400">
                          {formatCropLabel(crop)} - {formatLocalizedDate(activity.activity_date, language, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {activity.quantity && <p className="text-xs text-gray-500 mt-1">{t('record_quantity_prefix')}: {activity.quantity}</p>}
                        {activity.notes && <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>}
                      </div>
                      <div className="flex gap-3 text-xs font-medium">
                        <button type="button" className="text-primary hover:underline" onClick={() => startActivityEdit(activity)}>
                          {t('common_edit')}
                        </button>
                        <button type="button" className="text-red-500 hover:underline" onClick={() => deleteActivity(activity)}>
                          {actionLoading === `activity-delete-${activity.id}` ? t('common_deleting') : t('common_delete')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
