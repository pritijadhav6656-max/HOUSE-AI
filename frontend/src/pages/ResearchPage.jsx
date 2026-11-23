import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  GitBranch,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { formatINR, formatNumberIN } from '../utils/formatters';

const ResearchPage = () => {
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/model/info')
      .then((res) => {
        if (active && res.data?.success) {
          setModelInfo(res.data.data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="bg-[#0F172A] text-white rounded-2xl p-8 sm:p-10">
        <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
          Research & Methodology
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
          Machine Learning Pipeline, Dataset Provenance & Evaluation Methodology
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-3xl leading-relaxed">
          A transparent technical overview of how HOUSE AI prepares residential property data,
          prevents data leakage, benchmarks regression algorithms, and validates geographic coverage.
        </p>
      </div>

      {/* SYNTHETIC DATA DISCLOSURE */}
      <div className="card-surface p-6 bg-amber-50/80 border-amber-200 flex items-start gap-4">
        <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm text-amber-950">
          <h2 className="font-extrabold text-base">
            Explicit Dataset Provenance Disclosure: Synthetic Benchmark Dataset
          </h2>
          <p className="text-xs text-amber-900 leading-relaxed">
            In compliance with strict data integrity standards, HOUSE AI clearly identifies that its
            initial training dataset (<code>ml-model/data/synthetic/india_housing_synthetic.csv</code>)
            is a <strong>Synthetic Benchmark Dataset</strong> rather than scraped or proprietary
            real-world market transactions. The system separates <code>data/synthetic/</code> from{' '}
            <code>data/raw/</code> and <code>data/processed/</code> so verified real-world datasets
            can be imported into the exact same pipeline.
          </p>
        </div>
      </div>

      {/* PROBLEM STATEMENT & OBJECTIVES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface p-6 space-y-3">
          <h3 className="text-lg font-extrabold text-[#0F172A]">1. Problem Statement</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Residential real estate pricing in India varies significantly across states, districts,
            cities, and micro-market localities, as well as structural attributes such as built-up
            area, BHK configuration, property age, floor level, and furnishing. Many basic
            prediction tools either hardcode 4–5 cities or generate misleading estimates for cities
            missing from their training set.
          </p>
        </div>

        <div className="card-surface p-6 space-y-3">
          <h3 className="text-lg font-extrabold text-[#0F172A]">2. Solution Architecture</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            HOUSE AI solves this by combining a complete 36-State/UT administrative location master
            with an explicit ML Coverage Verification layer in Python. When a user selects a city,
            the ML service verifies whether that city has sufficient training representation before
            performing regression inference.
          </p>
        </div>
      </div>

      {/* PREPROCESSING PIPELINE */}
      <div className="card-surface p-7 space-y-5">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-[#2563EB]" />
          <h3 className="text-lg font-extrabold text-[#0F172A]">
            3. Data Cleaning & Scikit-learn Preprocessing Pipeline
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-sm text-[#0F172A] mb-2">Stage A: Data Cleaning</h4>
            <ul className="space-y-1.5 text-[#64748B]">
              <li>• Exact duplicate record detection and removal</li>
              <li>• Missing essential field elimination & median/mode imputation</li>
              <li>• Invalid area (&lt;200 or &gt;20,000 sq.ft.) and negative price removal</li>
              <li>• City-grouped 1st–99th percentile price-per-sq.ft. outlier filtering</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-sm text-[#0F172A] mb-2">Stage B: Feature Engineering</h4>
            <ul className="space-y-1.5 text-[#64748B]">
              <li>
                • <strong>Categorical (6):</strong> State, City, Locality, Property Type, Furnishing
                Status, Parking
              </li>
              <li>
                • <strong>Numerical (7):</strong> Built-up Area, BHK, Bathrooms, Balconies, Property
                Age, Floor Number, Total Floors
              </li>
              <li>• Leak-free <code>ColumnTransformer</code> fitted strictly on training split</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-sm text-[#0F172A] mb-2">Stage C: Dataset Volume</h4>
            <ul className="space-y-1.5 text-[#64748B]">
              <li>
                • Raw Synthetic Records:{' '}
                <strong>{formatNumberIN(modelInfo?.datasetInfo?.rawRecords || 12982)}</strong>
              </li>
              <li>
                • Cleaned Records:{' '}
                <strong>{formatNumberIN(modelInfo?.datasetInfo?.datasetRecords || 12606)}</strong>
              </li>
              <li>
                • Train Split (80%):{' '}
                <strong>{formatNumberIN(modelInfo?.datasetInfo?.trainingRecords || 10084)}</strong>
              </li>
              <li>
                • Test Split (20%):{' '}
                <strong>{formatNumberIN(modelInfo?.datasetInfo?.testingRecords || 2522)}</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ALGORITHMS & METRICS */}
      <div className="card-surface p-7 space-y-5">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-[#6D4AFF]" />
          <h3 className="text-lg font-extrabold text-[#0F172A]">
            4. Benchmarked Algorithms & Actual Test Evaluation
          </h3>
        </div>
        <p className="text-sm text-[#64748B]">
          All three candidate models were trained with <code>random_state=42</code> and evaluated on
          the held-out 20% test set using R² Score, Mean Absolute Error (MAE), Root Mean Squared
          Error (RMSE), and 3-fold Cross-Validation:
        </p>

        {modelInfo?.algorithmComparison && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-[#64748B]">
                  <th className="py-3 px-4">Algorithm</th>
                  <th className="py-3 px-4">Train R²</th>
                  <th className="py-3 px-4">Test R²</th>
                  <th className="py-3 px-4">CV R² Mean</th>
                  <th className="py-3 px-4">Test MAE</th>
                  <th className="py-3 px-4">Test RMSE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modelInfo.algorithmComparison.map((row) => (
                  <tr
                    key={row.algorithm}
                    className={row.algorithm === modelInfo.algorithm ? 'bg-blue-50/60 font-bold' : ''}
                  >
                    <td className="py-3 px-4 text-[#0F172A]">
                      {row.algorithm}
                      {row.algorithm === modelInfo.algorithm && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-[#2563EB] text-white">
                          Active Model
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{row.trainR2Score}</td>
                    <td className="py-3 px-4 text-[#10B981]">{row.r2Score}</td>
                    <td className="py-3 px-4">{row.cvR2Mean}</td>
                    <td className="py-3 px-4">{formatINR(row.mae)}</td>
                    <td className="py-3 px-4">{formatINR(row.rmse)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LIMITATIONS & FUTURE SCOPE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface p-6 space-y-3">
          <h3 className="text-base font-extrabold text-[#0F172A]">5. Known Limitations</h3>
          <ul className="space-y-2 text-xs text-[#64748B] leading-relaxed">
            <li>
              • <strong>Synthetic Dataset Provenance:</strong> The active model is trained on a
              synthetic benchmark dataset rather than official government registry deeds.
            </li>
            <li>
              • <strong>Partial ML City Coverage:</strong> Out of 150 selectable cities across all
              36 States/UTs, 77 major urban centers have ML training coverage; the remaining 73
              cities return a transparent unsupported-coverage status.
            </li>
            <li>
              • <strong>Macroeconomic Dynamics:</strong> Real-time interest rate shifts, upcoming
              metro corridors, and legal title encumbrances are not captured in tabular inputs.
            </li>
          </ul>
        </div>

        <div className="card-surface p-6 space-y-3">
          <h3 className="text-base font-extrabold text-[#0F172A]">6. Future Scope</h3>
          <ul className="space-y-2 text-xs text-[#64748B] leading-relaxed">
            <li>
              • Integration of verified RERA and state stamp-duty registration datasets into{' '}
              <code>ml-model/data/raw/</code>.
            </li>
            <li>
              • Expansion of ML training coverage from 77 urban centers to all tier-3 municipal
              towns across every Indian district.
            </li>
            <li>
              • Spatial geospatial coordinates (latitude/longitude distance to transit and commercial
              hubs) and prediction interval bounds.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResearchPage;
