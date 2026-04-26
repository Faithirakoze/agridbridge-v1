import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { createTranslator } from '../i18n';
import { useStore } from '../store/useStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const setToken = useStore((s) => s.setToken);
  const setFarmer = useStore((s) => s.setFarmer);
  const t = createTranslator(language);
  const showDevOtpHint = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEV_OTP_HINT === 'true';

  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function getRequestErrorMessage(err, fallback) {
    return err.code === 'ECONNABORTED' ? t('auth_backend_waking') : fallback;
  }

  async function handleSendOTP(e) {
    e.preventDefault();
    if (!phone.trim()) return setError(t('auth_enter_phone'));
    setError('');
    setLoading(true);
    try {
      await client.post('/auth/request-otp', { phone: phone.trim() });
      setStep('otp');
    } catch (err) {
      setError(getRequestErrorMessage(err, t('auth_send_code_error')));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    if (otp.length !== 6) return setError(t('auth_invalid_code'));
    setError('');
    setLoading(true);
    try {
      const res = await client.post('/auth/verify-otp', { phone, otp, name: '' });
      if (res.data.is_new_user) {
        navigate('/register', { state: { phone } });
        return;
      }
      setFarmer(res.data.user);
      setToken(res.data.access_token);
      navigate('/');
    } catch (err) {
      setError(getRequestErrorMessage(err, t('auth_invalid_code')));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!phone.trim()) return;
    try {
      await client.post('/auth/request-otp', { phone: phone.trim() });
    } catch (err) {
      setError(getRequestErrorMessage(err, t('auth_resend_code_error')));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-primary">AgriBridge</h1>
          <p className="text-gray-400 text-sm mt-2">{t('auth_sign_in_subtitle')}</p>
          <div className="flex justify-center mt-4">
            <LanguageSwitcher language={language} label={t('app_language')} onChange={setLanguage} />
          </div>
        </div>

        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('auth_phone_number')}</label>
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
              {loading ? t('auth_sending') : t('auth_send_code')}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <button type="button" onClick={() => setStep('phone')} className="text-sm text-primary mb-2">
              {t('auth_back')}
            </button>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                {t('auth_enter_code', { phone })}
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
              {showDevOtpHint && <p className="text-xs text-gray-400 mt-1.5">{t('auth_dev_mode_hint')}</p>}
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
              {loading ? t('auth_verifying') : t('auth_log_in')}
            </button>
            <button type="button" className="w-full text-sm text-primary text-center" onClick={handleResend}>
              {t('auth_resend_code')}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth_new_here')} <Link to="/register" className="text-primary font-medium">{t('auth_create_account_link')}</Link>
        </p>
      </div>
    </div>
  );
}
