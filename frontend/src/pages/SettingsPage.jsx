import React, { useState } from 'react';
import { Lock, Bell, Save, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';

const SettingsPage = () => {
  const { user, updateLocalUser } = useAuth();
  const { showToast } = useToast();

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [prefs, setPrefs] = useState({
    emailAlerts: user?.notificationPreferences?.emailAlerts ?? true,
    reportSummaries: user?.notificationPreferences?.reportSummaries ?? true,
    modelUpdates: user?.notificationPreferences?.modelUpdates ?? false,
  });

  const [savingPwd, setSavingPwd] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      showToast('All password fields are required.', 'error');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    setSavingPwd(true);
    try {
      const res = await api.put('/users/change-password', passwords);
      if (res.data?.success) {
        showToast('Password changed successfully.', 'success');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to change password.', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleSavePrefs = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const res = await api.put('/users/profile', {
        notificationPreferences: prefs,
      });
      if (res.data?.success) {
        updateLocalUser(res.data.user);
        showToast('Account preferences saved.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to save preferences.', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A]">Account Settings</h2>
        <p className="text-sm text-[#64748B]">
          Update your security credentials and workspace notification preferences
        </p>
      </div>

      {/* PASSWORD MANAGEMENT */}
      <div className="card-surface p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Change Account Password</h3>
            <p className="text-xs text-[#64748B]">
              Passwords are encrypted with bcrypt before storage in MongoDB
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <FormInput
            label="Current Password"
            name="currentPassword"
            type="password"
            required
            icon={Lock}
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          />
          <FormInput
            label="New Password"
            name="newPassword"
            type="password"
            required
            icon={Lock}
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            placeholder="Minimum 8 chars (letter & number)"
          />
          <FormInput
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            required
            icon={Lock}
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
          />
          <button type="submit" disabled={savingPwd} className="btn-primary text-sm">
            <ShieldCheck className="w-4 h-4" />
            {savingPwd ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* PREFERENCES */}
      <div className="card-surface p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6D4AFF] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Workspace Preferences</h3>
            <p className="text-xs text-[#64748B]">
              Configure how HOUSE AI handles valuation summaries and ML model updates
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePrefs} className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
            <div>
              <span className="text-sm font-bold text-[#0F172A] block">
                Valuation Report Summaries
              </span>
              <span className="text-xs text-[#64748B]">
                Include detailed component breakdowns when generating property reports
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.reportSummaries}
              onChange={(e) => setPrefs({ ...prefs, reportSummaries: e.target.checked })}
              className="w-4 h-4 accent-[#2563EB]"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
            <div>
              <span className="text-sm font-bold text-[#0F172A] block">
                Security & Account Alerts
              </span>
              <span className="text-xs text-[#64748B]">
                Display session and authentication status notifications
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.emailAlerts}
              onChange={(e) => setPrefs({ ...prefs, emailAlerts: e.target.checked })}
              className="w-4 h-4 accent-[#2563EB]"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
            <div>
              <span className="text-sm font-bold text-[#0F172A] block">
                ML Training Coverage Announcements
              </span>
              <span className="text-xs text-[#64748B]">
                Highlight newly added Indian cities when the Scikit-learn model is retrained
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.modelUpdates}
              onChange={(e) => setPrefs({ ...prefs, modelUpdates: e.target.checked })}
              className="w-4 h-4 accent-[#2563EB]"
            />
          </label>

          <div className="pt-2">
            <button type="submit" disabled={savingPrefs} className="btn-primary text-sm">
              <Save className="w-4 h-4" />
              {savingPrefs ? 'Saving Preferences...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
