import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrs.name = 'Full name must be at least 2 characters.';
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrs.email = 'Please enter a valid email address.';
    }
    if (formData.password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d).+$/.test(formData.password)) {
      newErrs.password = 'Password must be 8+ characters with at least one letter and one number.';
    }
    if (formData.confirmPassword !== formData.password) {
      newErrs.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      if (res.success) {
        showToast('Account created! Welcome to HOUSE AI.', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="card-surface max-w-md w-full p-8">
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Create Your HOUSE AI Account</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Start predicting residential property prices across all 36 Indian States & UTs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormInput
            label="Full Name"
            name="name"
            required
            icon={User}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Aarav Sharma"
            error={errors.name}
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            required
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="aarav@example.com"
            error={errors.email}
          />

          <FormInput
            label="Phone Number (Optional)"
            name="phone"
            type="tel"
            icon={Phone}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            required
            icon={Lock}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimum 8 chars (letters & numbers)"
            error={errors.password}
          />

          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            required
            icon={Lock}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Re-enter password"
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 text-sm mt-2"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-[#64748B] mt-6 pt-6 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#2563EB] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
