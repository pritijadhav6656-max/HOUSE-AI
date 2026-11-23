import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Target,
  Layers,
  Cpu,
  Database,
  ShieldCheck,
  MapPin,
  ArrowRight,
} from 'lucide-react';

const AboutPage = () => {
  const objectives = [
    {
      title: 'Zero-to-One India-Wide Location Intelligence',
      desc: 'Provide an administrative location database spanning all 28 Indian States and 8 Union Territories with cascading District, City, and Locality selectors.',
    },
    {
      title: 'Rigorous Machine Learning Engineering',
      desc: 'Train, cross-validate, and benchmark Linear Regression, Random Forest, and Gradient Boosting pipelines using Scikit-learn ColumnTransformer preprocessing.',
    },
    {
      title: 'Transparent ML Coverage Verification',
      desc: 'Distinguish between selectable locations in the database and cities with verified ML training coverage, avoiding fabricated estimates for unsupported cities.',
    },
    {
      title: 'Full-Stack Enterprise MERN Architecture',
      desc: 'Connect React 18, Node.js/Express, MongoDB persistence, and a dedicated Python Flask ML microservice with role-based access control.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="bg-[#0F172A] text-white rounded-2xl p-8 sm:p-12">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
            About HOUSE AI
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            India-Wide AI Real Estate Price Prediction & Analytics Platform
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            HOUSE AI is an independent full-stack MERN and Python machine learning platform designed
            to deliver transparent residential property price estimations, location intelligence,
            and model performance analytics across India.
          </p>
        </div>
      </div>

      {/* PROJECT OBJECTIVES */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-2">
          <Target className="w-4 h-4" />
          <span>Core Project Objectives</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-6">
          Engineering Principles Behind HOUSE AI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {objectives.map((obj, idx) => (
            <div key={idx} className="card-surface p-6">
              <h3 className="text-base font-bold text-[#0F172A] mb-2">{obj.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{obj.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TECHNOLOGY STACK & SYSTEM OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-surface p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">Frontend Layer</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Built with React 18, Vite, Tailwind CSS, React Router DOM, Recharts, Lucide React, and
            Axios. Features responsive dashboards, searchable dropdowns, and printable valuation
            reports.
          </p>
        </div>

        <div className="card-surface p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">Backend & MongoDB Layer</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Powered by Node.js, Express.js, and MongoDB (`houseprice_ai`) via Mongoose. Implements
            JWT authentication, bcrypt password hashing, Express Validator, Helmet, and Rate
            Limiting.
          </p>
        </div>

        <div className="card-surface p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D4AFF] flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">Python ML Microservice</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Independent Python 3.11 Flask service running on port 8000 with Pandas, NumPy,
            Scikit-learn, and Joblib. Benchmarks regression algorithms and serves validated
            predictions.
          </p>
        </div>
      </div>

      <div className="card-surface p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-extrabold text-[#0F172A]">
            Explore Our Machine Learning Methodology
          </h3>
          <p className="text-sm text-[#64748B] mt-1">
            Inspect the training pipeline, preprocessing steps, and live evaluation metrics.
          </p>
        </div>
        <Link to="/research" className="btn-primary text-sm shrink-0">
          View Research & Methodology
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
