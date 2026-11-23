import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetData, setResetData] = useState({
    token: '',
    password: '',
    confirmPassword: '',
  });
  const [devTokenNotice, setDevTokenNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      showToast('Please enter a valid registered email address.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data?.success) {
        showToast('Password reset token generated.', 'success');
        if (res.data.devResetToken) {
          setDevTokenNotice(res.data.devResetToken);
          setResetData((prev) => ({ ...prev, token: res.data.devResetToken }));
        }
        setStep(2);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to process reset request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetData.token.trim()) {
      showToast('Reset token is required.', 'error');
      return;
    }
    if (resetData.password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d).+$/.test(resetData.password)) {
      showToast('New password must be 8+ characters with at least one letter and one number.', 'error');
      return;
    }
    if (resetData.password !== resetData.confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token: resetData.token.trim(),
        password: resetData.password,
        confirmPassword: resetData.confirmPassword,
      });
      if (res.data?.success) {
        showToast('Password reset successful! You can now sign in.', 'success');
        navigate('/login');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid or expired reset token.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card-surface max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">
            {step === 1 ? 'Reset Your Password' : 'Verify Token & Set New Password'}
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            {step === 1
              ? 'Enter your account email address to generate a time-limited reset token.'
              : 'Enter your verification token and choose a new password.'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestToken} className="space-y-5">
            <FormInput
              label="Registered Email Address"
              name="email"
              type="email"
              required
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm">
              {submitting ? 'Generating Reset Token...' : 'Request Password Reset'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {devTokenNotice && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  Development Environment Reset Token
                </div>
                <p className="text-[11px] text-amber-800">
                  Local development mode (no external SMTP configured). Token pre-filled below:
                </p>
                <code className="block p-2 rounded bg-white border border-amber-200 font-mono text-[11px] break-all">
                  {devTokenNotice}
                </code>
              </div>
            )}

            <FormInput
              label="Reset Verification Token"
              name="token"
              required
              value={resetData.token}
              onChange={(e) => setResetData({ ...resetData, token: e.target.value })}
              placeholder="Paste reset token"
            />

            <FormInput
              label="New Password"
              name="password"
              type="password"
              required
              icon={Lock}
              value={resetData.password}
              onChange={(e) => setResetData({ ...resetData, password: e.target.value })}
              placeholder="8+ chars with letter & number"
            />

            <FormInput
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              required
              icon={Lock}
              value={resetData.confirmPassword}
              onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
            />

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-sm">
              {submitting ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
