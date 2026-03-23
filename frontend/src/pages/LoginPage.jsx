import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useStore } from '../store/useStore';

const DISTRICTS = ['Kigali', 'Musanze', 'Huye', 'Rubavu', 'Kayonza', 'Nyagatare', 'Other'];

export default function LoginPage() {
  const navigate  = useNavigate();
  const setToken  = useStore((s) => s.setToken);
  const setFarmer = useStore((s) => s.setFarmer);

  const [step,     setStep]     = useState('phone'); // phone | otp | register
  const [phone,    setPhone]    = useState('');
  const [otp,      setOtp]      = useState('');
  const [name,     setName]     = useState('');
  const [district, setDistrict] = useState('Kigali');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSendOTP(e) {
    e.preventDefault();
    if (!phone.trim()) return setError('Enter your phone number.');
    setError(''); setLoading(true);
    try {
      await client.post('/auth/request-otp', { phone: phone.trim() });
      setStep('otp');
    } catch {
      setError('Could not send code. Is the backend running?');
    } finally { setLoading(false); }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    if (otp.length !== 6) return setError('Enter the 6-digit code.');
    setError(''); setLoading(true);
    try {
      const res = await client.post('/auth/verify-otp', { phone, otp, name: '' });
      if (res.data.is_new_user) { setStep('register'); return; }
      setFarmer(res.data.user);
      setToken(res.data.access_token);
      navigate('/');
    } catch {
      setError('Invalid code. Try again.');
    } finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Enter your name.');
    setError(''); setLoading(true);
    try {
      const res = await client.post('/auth/verify-otp', { phone, otp, name: name.trim() });
      setFarmer({ ...res.data.user, district });
      setToken(res.data.access_token);
      navigate('/');
    } catch {
      setError('Registration failed. Try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-primary">AgriBridge</h1>
          <p className="text-gray-400 text-sm mt-2">Smart farming for Rwanda</p>
        </div>

        {/* Phone step */}
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
              {loading ? 'Sending…' : 'Send code'}
            </button>
            <p className="text-center text-xs text-gray-400">We'll send a 6-digit code to this number.</p>
          </form>
        )}

        {/* OTP step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <button type="button" onClick={() => setStep('phone')} className="text-sm text-primary mb-2">
              ← Back
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
              <p className="text-xs text-gray-400 mt-1.5">Dev mode — use <strong>123456</strong></p>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying…' : 'Verify'}
            </button>
            <button
              type="button"
              className="w-full text-sm text-primary text-center"
              onClick={() => client.post('/auth/request-otp', { phone })}
            >
              Resend code
            </button>
          </form>
        )}

        {/* Register step */}
        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-1">Create your account</h2>
              <p className="text-sm text-gray-400">Takes 30 seconds</p>
            </div>
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">District</label>
              <div className="flex flex-wrap gap-2">
                {DISTRICTS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDistrict(d)}
                    className={`pill text-xs ${district === d ? 'pill-active' : ''}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account…' : 'Start farming'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
