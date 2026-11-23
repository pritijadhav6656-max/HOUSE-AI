import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calculator,
  History,
  Cpu,
  TrendingUp,
  MapPin,
  ArrowRight,
  Sparkles,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { formatINR, formatCompactINR, formatDateShort } from '../utils/formatters';

const CHART_COLORS = ['#2563EB', '#6D4AFF', '#10B981', '#F59E0B', '#0F172A', '#EC4899'];

const UserDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard');
      if (res.data?.success) {
        setDashboard(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="stats" />
        <SkeletonLoader rows={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Dashboard Unavailable" message={error} onRetry={fetchDashboard} />;
  }

  const summary = dashboard?.summary || {};
  const recentPredictions = dashboard?.recentPredictions || [];
  const charts = dashboard?.charts || {};
  const insights = dashboard?.insights || [];

  return (
    <div className="space-y-8">
      {/* WELCOME BANNER */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personal Real Estate Intelligence Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Analyst'}
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Run AI property price predictions across 36 Indian States and Union Territories, inspect
            model metrics, and track your historical property valuations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/predict" className="btn-primary py-3 px-5 text-sm">
            <Calculator className="w-4 h-4" />
            Predict Now
          </Link>
          <Link
            to="/history"
            className="px-4 py-3 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            View History
          </Link>
        </div>
      </div>

      {/* 3 REQUIRED STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Predictions"
          value={summary.totalPredictions ?? 0}
          subtitle={
            summary.completedPredictionsCount
              ? `Mean Estimate: ${formatCompactINR(summary.avgPredictedPrice)}`
              : 'All stored valuations in your account'
          }
          icon={History}
          accent="blue"
        />
        <StatCard
          title="Recent 30-Day Activity"
          value={summary.recent30DaysCount ?? 0}
          subtitle={
            summary.avgPricePerSqFt
              ? `Avg Rate: ${formatINR(summary.avgPricePerSqFt)} / sq.ft.`
              : 'Predictions created in the last 30 days'
          }
          icon={TrendingUp}
          accent="emerald"
        />
        <StatCard
          title="Model R² Score"
          value={summary.modelR2Score !== null ? summary.modelR2Score : 'N/A'}
          subtitle={`Active Engine: ${summary.algorithm || 'Scikit-learn Pipeline'}`}
          icon={Cpu}
          accent="purple"
        />
      </div>

      {/* INSIGHTS BANNER */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((item, idx) => (
            <div key={idx} className="card-surface p-5 border-l-4 border-l-[#2563EB]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* ANALYTICS CHARTS */}
      {summary.totalPredictions > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Activity */}
          <div className="card-surface p-6">
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              Monthly Prediction Activity
            </h3>
            <p className="text-xs text-[#64748B] mb-5">
              Volume of property valuations run by your account over time
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlyActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="predictions"
                    name="Predictions"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* City-wise Distribution */}
          <div className="card-surface p-6">
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              City-Wise Prediction Distribution
            </h3>
            <p className="text-xs text-[#64748B] mb-5">
              Top Indian cities evaluated in your prediction history
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.cityDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Predictions" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BHK Distribution */}
          <div className="card-surface p-6">
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              BHK Configuration Breakdown
            </h3>
            <p className="text-xs text-[#64748B] mb-5">
              Distribution of property configurations across your saved predictions
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.bhkDistribution || []}
                    dataKey="count"
                    nameKey="bhk"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label={({ bhk, count }) => `${bhk} (${count})`}
                  >
                    {(charts.bhkDistribution || []).map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Price Range Distribution */}
          <div className="card-surface p-6">
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              Estimated Price Range Distribution
            </h3>
            <p className="text-xs text-[#64748B] mb-5">
              Segmentation of your completed estimates across valuation brackets
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.priceRangeDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Properties" fill="#6D4AFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      {/* RECENT PREDICTIONS TABLE */}
      <div className="card-surface overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Recent Predictions</h3>
            <p className="text-xs text-[#64748B]">
              Your latest residential property price estimations stored in MongoDB
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1"
          >
            View All History
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPredictions.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Calculator}
              title="No Property Predictions Yet"
              description="Run your first AI property price estimation to populate your analytics charts and recent history."
              actionLabel="Predict Property Price"
              onAction={() => navigate('/predict')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-[#64748B] border-b border-slate-200/80">
                  <th className="py-3.5 px-6">City & Locality</th>
                  <th className="py-3.5 px-4">Configuration</th>
                  <th className="py-3.5 px-4">Predicted Price</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentPredictions.map((pred) => {
                  const isCovered = pred.predictionStatus === 'completed' && pred.predictedPrice !== null;
                  return (
                    <tr key={pred._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          {pred.locality}, {pred.city}
                        </div>
                        <div className="text-xs text-[#64748B]">{pred.state}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#1E293B]">
                          {pred.bhk} BHK {pred.propertyType}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {pred.area} sq.ft. • {pred.bathrooms} Bath • {pred.houseAge} Yrs
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {isCovered ? (
                          <>
                            <div className="font-extrabold text-[#0F172A]">
                              {formatINR(pred.predictedPrice)}
                            </div>
                            <div className="text-xs text-[#2563EB] font-semibold">
                              {formatINR(pred.pricePerSqFt)} / sq.ft.
                            </div>
                          </>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-[#F59E0B]">
                            Outside ML Coverage
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-[#64748B]">
                        {formatDateShort(pred.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/prediction-result/${pred._id}`}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;
