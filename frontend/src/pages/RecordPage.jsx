import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import client from '../api/client';
import { RecordIcon } from '../components/AppIcon';

const ACTIVITY_TYPES = ['planting', 'fertiliser_applied', 'pesticide_applied', 'weeding', 'irrigation', 'harvest', 'other'];

function formatActivityType(value) {
  return value.replace(/_/g, ' ');
}

function formatCropLabel(crop) {
  if (!crop) return 'Unknown crop';
  return `${crop.crop_type.replace(/_/g, ' ')}${crop.plot_name ? ` - ${crop.plot_name}` : ''}`;
}

export default function RecordPage() {
  const crops = useStore((s) => s.crops);
  const setCrops = useStore((s) => s.setCrops);

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
          setError('Some records could not load. Try refreshing the page.');
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

  function showSuccess(message) {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cropId) return setError('Select a crop first.');

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
      showSuccess('Activity saved.');
    } catch {
      setError('Failed to save activity. Check your connection.');
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
    if (!activityDraft.crop_id) return setError('Select a crop for the activity.');
    if (!activityDraft.activity_date) return setError('Choose an activity date.');

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
      showSuccess('Activity updated.');
    } catch {
      setError('Could not update the activity.');
    } finally {
      setActionLoading('');
    }
  }

  async function deleteActivity(activity) {
    if (!window.confirm(`Delete the ${formatActivityType(activity.activity_type)} record?`)) return;

    setError('');
    setActionLoading(`activity-delete-${activity.id}`);
    try {
      await client.delete(`/activities/${activity.id}`);
      setActivities(activities.filter((item) => item.id !== activity.id));
      if (editingActivityId === activity.id) setEditingActivityId('');
      showSuccess('Activity deleted.');
    } catch {
      setError('Could not delete the activity.');
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
            <h1 className="text-xl font-semibold text-gray-800">Records and activity</h1>
            <p className="text-sm text-gray-500 mt-1">Log new work and manage your activity records here.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <h2 className="text-sm font-medium text-gray-700">Log activity</h2>
          <p className="text-xs text-gray-400 mt-1">Save planting, irrigation, weeding, and harvest work against a crop.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Crop</label>
          {crops.length === 0 ? (
            <p className="text-sm text-gray-400">No crops yet - add one in the Crops tab first.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => setCropId(crop.id)}
                  className={`pill text-xs capitalize ${cropId === crop.id ? 'pill-active' : ''}`}
                >
                  {formatCropLabel(crop)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Activity type</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActivityType(type)}
                className={`pill text-xs capitalize ${activityType === type ? 'pill-active' : ''}`}
              >
                {formatActivityType(type)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
          <input className="input text-sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Quantity (optional)</label>
          <input className="input text-sm" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 25 kg urea" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes (optional)</label>
          <textarea
            className="input text-sm resize-none"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations..."
          />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}
        {success && <p className="text-green-600 text-xs font-medium">{success}</p>}

        <button type="submit" className="btn-primary" disabled={actionLoading === 'create-activity' || crops.length === 0}>
          {actionLoading === 'create-activity' ? 'Saving...' : 'Save activity'}
        </button>
      </form>

      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
            <RecordIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Manage activities</h2>
            <p className="text-xs text-gray-400">Update recent field work records.</p>
          </div>
        </div>

        {pageLoading ? (
          <p className="text-sm text-gray-400">Loading activities...</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-400">No activity records yet.</p>
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
                            <option key={type} value={type}>{formatActivityType(type)}</option>
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
                        placeholder="Quantity"
                      />
                      <textarea
                        className="input text-sm resize-none"
                        rows={3}
                        value={activityDraft.notes}
                        onChange={(e) => setActivityDraft({ ...activityDraft, notes: e.target.value })}
                        placeholder="Notes"
                      />
                      <div className="flex gap-3 text-xs font-medium">
                        <button type="button" className="text-primary hover:underline" onClick={() => saveActivity(activity.id)}>
                          {actionLoading === `activity-save-${activity.id}` ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" className="text-gray-500 hover:underline" onClick={() => setEditingActivityId('')}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-800 capitalize">{formatActivityType(activity.activity_type)}</p>
                        <p className="text-xs text-gray-400">
                          {formatCropLabel(crop)} - {new Date(activity.activity_date).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {activity.quantity && <p className="text-xs text-gray-500 mt-1">Quantity: {activity.quantity}</p>}
                        {activity.notes && <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>}
                      </div>
                      <div className="flex gap-3 text-xs font-medium">
                        <button type="button" className="text-primary hover:underline" onClick={() => startActivityEdit(activity)}>
                          Edit
                        </button>
                        <button type="button" className="text-red-500 hover:underline" onClick={() => deleteActivity(activity)}>
                          {actionLoading === `activity-delete-${activity.id}` ? 'Deleting...' : 'Delete'}
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
