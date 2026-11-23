import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const newErrs = {};
    if (!formData.email.trim()) {
      newErrs.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrs.email = 'Please enter a valid email address.';
    }
    if (!formData.password) {
      newErrs.password = 'Password is required.';
    }
    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await login(formData.email.trim(), formData.password);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        const dest = location.state?.from?.pathname || '/dashboard';
        navigate(dest, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to sign in. Please verify your credentials.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      <div className="card-surface max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Sign in to HOUSE AI</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Access India-wide AI property valuation and your prediction portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            required
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
            error={errors.email}
          />

          <div>
            <FormInput
              label="Password"
              name="password"
              type="password"
              required
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              error={errors.password}
            />
            <div className="flex justify-end mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 text-sm"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-[#64748B] mt-6 pt-6 border-t border-slate-100">
          Don&apos;t have a HOUSE AI account?{' '}
          <Link to="/register" className="font-bold text-[#2563EB] hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
