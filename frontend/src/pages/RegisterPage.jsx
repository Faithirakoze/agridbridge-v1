import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useStore } from '../store/useStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setToken = useStore((s) => s.setToken);
  const setFarmer = useStore((s) => s.setFarmer);

  const prefilledPhone = location.state?.phone || '';
  const [step, setStep] = useState(prefilledPhone ? 'otp' : 'phone');
  const [phone, setPhone] = useState(prefilledPhone);
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function getRequestErrorMessage(err, fallback) {
    return err.code === 'ECONNABORTED'
      ? 'The backend may be waking up on Render. Please wait about a minute and try again.'
      : fallback;
  }

  async function handleSendOTP(e) {
    e.preventDefault();
    if (!phone.trim()) return setError('Enter your phone number.');
    setError('');
    setLoading(true);
    try {
      await client.post('/auth/request-otp', { phone: phone.trim() });
      setStep('otp');
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Could not send code. Is the backend running?'));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    if (otp.length !== 6) return setError('Enter the 6-digit code.');
    setError('');
    setLoading(true);
    try {
      const res = await client.post('/auth/verify-otp', { phone, otp, name: '' });
      if (!res.data.is_new_user) {
        setError('An account already exists for this phone. Please log in.');
        return;
      }
      setStep('profile');
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Invalid code. Try again.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Enter your name.');
    setError('');
    setLoading(true);
    try {
      const res = await client.post('/auth/verify-otp', { phone, otp, name: name.trim() });
      setFarmer(res.data.user);
      setToken(res.data.access_token);
      navigate('/');
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Could not create account. Try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-primary">AgriBridge</h1>
          <p className="text-gray-400 text-sm mt-2">Create your account</p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone number</label>
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250 7XX XXX XXX"
                type="tel"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send code'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <button type="button" onClick={() => setStep('phone')} className="text-sm text-primary mb-2">
              Back
            </button>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Enter the code sent to {phone}
              </label>
              <input
                className="input text-center text-2xl tracking-[0.5em] font-medium"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                type="tel"
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1.5">Dev mode: use <strong>123456</strong></p>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Your name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Uwimana Marie"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
