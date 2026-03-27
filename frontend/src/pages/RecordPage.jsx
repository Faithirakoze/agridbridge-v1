import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import client from '../api/client';
import { RecordIcon } from '../components/AppIcon';

const ACTIVITY_TYPES = ['planting','fertiliser_applied','pesticide_applied','weeding','irrigation','harvest','other'];

export default function RecordPage() {
  const crops    = useStore((s) => s.crops);
  const setCrops = useStore((s) => s.setCrops);

  const [activityType, setActivityType] = useState('planting');
  const [cropId,       setCropId]       = useState('');
  const [quantity,     setQuantity]     = useState('');
  const [notes,        setNotes]        = useState('');
  const [date,         setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState('');

  // Load crops if not already in store
  useEffect(() => {
    if (crops.length === 0) {
      client.get('/crops').then((r) => setCrops(r.data)).catch(console.warn);
    }
  }, []);

  useEffect(() => {
    if (crops.length > 0 && !cropId) setCropId(crops[0].id);
  }, [crops]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cropId) return setError('Select a crop first.');
    setError(''); setLoading(true);
    try {
      await client.post('/activities', {
        crop_id:       cropId,
        activity_type: activityType,
        activity_date: new Date(date).toISOString(),
        quantity:      quantity || undefined,
        notes:         notes    || undefined,
      });
      setSuccess(true);
      setQuantity(''); setNotes('');
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save. Check your connection.');
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">

      <div className="card bg-gradient-to-r from-sky-50 via-white to-emerald-50 border-sky-100">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
            <RecordIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Log activity</h1>
            <p className="text-sm text-gray-500 mt-1">Keep a simple record of planting, irrigation, weeding, and harvest work.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Crop selector */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Crop</label>
          {crops.length === 0 ? (
            <p className="text-sm text-gray-400">No crops yet — add one in the Crops tab first.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {crops.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCropId(c.id)}
                  className={`pill text-xs capitalize ${cropId === c.id ? 'pill-active' : ''}`}
                >
                  {c.crop_type.replace('_', ' ')}{c.plot_name ? ` · ${c.plot_name}` : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Activity type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Activity type</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActivityType(t)}
                className={`pill text-xs capitalize ${activityType === t ? 'pill-active' : ''}`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
          <input className="input text-sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Quantity (optional)</label>
          <input className="input text-sm" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 25 kg urea" />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes (optional)</label>
          <textarea
            className="input text-sm resize-none"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations…"
          />
        </div>

        {error   && <p className="text-red-500 text-xs">{error}</p>}
        {success && <p className="text-green-600 text-xs font-medium">Activity saved!</p>}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || crops.length === 0}
        >
          {loading ? 'Saving…' : 'Save activity'}
        </button>

      </form>
    </div>
  );
}
