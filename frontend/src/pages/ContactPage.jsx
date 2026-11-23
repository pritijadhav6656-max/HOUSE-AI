import React, { useState } from 'react';
import { Mail, User, MessageSquare, Send, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { showToast } = useToast();

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Your name is required.';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!formData.subject.trim()) errs.subject = 'Subject is required.';
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/contact', formData);
      if (res.data?.success) {
        showToast('Your message has been submitted to the HOUSE AI team.', 'success');
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to submit message.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Contact & Support
            </span>
            <h1 className="text-3xl font-extrabold text-[#0F172A] mt-2">
              Get in Touch with HOUSE AI
            </h1>
            <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
              Have questions about location coverage, machine learning methodology, or enterprise
              dataset integration? Submit an inquiry directly to our administration portal.
            </p>
          </div>

          <div className="space-y-4">
            <div className="card-surface p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">India-Wide Coverage Desk</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Supporting all 28 States and 8 Union Territories across India.
                </p>
              </div>
            </div>

            <div className="card-surface p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Direct MongoDB Persistence</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  All inquiries are stored in the MongoDB <code>contacts</code> collection and
                  managed in the Administrator Portal.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="card-surface p-8">
            {submitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0F172A]">
                  Inquiry Received Successfully
                </h3>
                <p className="text-sm text-[#64748B] max-w-md mx-auto">
                  Thank you for contacting HOUSE AI. Your message has been logged in our system for
                  administrator review.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary text-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <h2 className="text-lg font-extrabold text-[#0F172A] border-b border-slate-100 pb-3">
                  Send an Inquiry
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Your Name"
                    name="name"
                    required
                    icon={User}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Priya Nair"
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
                    placeholder="priya@example.com"
                    error={errors.email}
                  />
                </div>

                <FormInput
                  label="Subject"
                  name="subject"
                  required
                  icon={MessageSquare}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Question regarding city coverage or valuation report"
                  error={errors.subject}
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1E293B] mb-1.5">
                    Message <span className="text-[#EF4444]">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your detailed message here (minimum 10 characters)..."
                    className={`input-field ${errors.message ? 'border-[#EF4444]' : ''}`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs font-medium text-[#EF4444]">{errors.message}</p>
                  )}
                </div>

                <button type="submit" disabled={submitting} className="btn-primary py-3 px-6 text-sm">
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting Inquiry...' : 'Submit Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
