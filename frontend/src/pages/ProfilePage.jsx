import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Calendar, Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';
import { formatDateTime } from '../utils/formatters';

const ProfilePage = () => {
  const { user, updateLocalUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get('/users/profile')
      .then((res) => {
        if (active && res.data?.success) {
          setFormData({
            name: res.data.user.name || '',
            phone: res.data.user.phone || '',
          });
          setTotalPredictions(res.data.stats?.totalPredictions || 0);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      showToast('Full name must be at least 2 characters.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/users/profile', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });
      if (res.data?.success) {
        updateLocalUser(res.data.user);
        showToast('Profile information updated.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A]">My Profile</h2>
        <p className="text-sm text-[#64748B]">
          Manage your HOUSE AI personal profile and review account details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-surface p-6 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-[#0F172A] text-white text-3xl font-extrabold flex items-center justify-center mb-4 shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">{user?.name}</h3>
          <p className="text-xs text-[#64748B] mb-3">{user?.email}</p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2563EB] capitalize">
            <Shield className="w-3.5 h-3.5" />
            {user?.role} Account
          </span>
          <div className="w-full mt-6 pt-4 border-t border-slate-100 text-xs text-[#64748B] space-y-2 text-left">
            <div className="flex justify-between">
              <span>Total Valuations</span>
              <strong className="text-[#0F172A]">{totalPredictions}</strong>
            </div>
            <div className="flex justify-between">
              <span>Account Status</span>
              <strong className="text-[#10B981]">Active</strong>
            </div>
            <div className="flex justify-between">
              <span>Joined</span>
              <strong className="text-[#0F172A]">{formatDateTime(user?.createdAt)}</strong>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 card-surface p-6">
          <h3 className="text-base font-bold text-[#0F172A] pb-3 mb-5 border-b border-slate-100">
            Edit Personal Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              required
              icon={User}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <FormInput
              label="Email Address (Verified)"
              name="email"
              icon={Mail}
              value={user?.email || ''}
              disabled
              helperText="Your primary login email cannot be changed."
            />

            <FormInput
              label="Phone Number"
              name="phone"
              icon={Phone}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                <Save className="w-4 h-4" />
                {saving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
