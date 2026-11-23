import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  MapPin,
  BarChart3,
  History,
  Cpu,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Layers,
  Database,
  ChevronDown,
  Building2,
} from 'lucide-react';
import api from '../services/api';

const LandingPage = () => {
  const [modelMeta, setModelMeta] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .get('/model/info')
      .then((res) => {
        if (active && res.data?.success) {
          setModelMeta(res.data.data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const features = [
    {
      icon: Calculator,
      title: 'AI House Price Prediction',
      description:
        'Estimate residential property values using a Scikit-learn Gradient Boosting pipeline trained on structural and micro-market parameters.',
    },
    {
      icon: MapPin,
      title: 'India-Wide Location Coverage',
      description:
        'Navigate a complete hierarchical database of all 28 Indian States and 8 Union Territories with cascading District, City, and Locality selectors.',
    },
    {
      icon: BarChart3,
      title: 'Intelligent Property Analytics',
      description:
        'Analyze price-per-square-foot benchmarks, BHK distributions, city-wise valuation patterns, and historical estimation activity.',
    },
    {
      icon: History,
      title: 'Persistent Prediction History',
      description:
        'Every valuation is securely linked to your account in MongoDB with multi-criteria search, filtering, sorting, and downloadable reports.',
    },
    {
      icon: Cpu,
      title: 'Transparent ML Performance',
      description:
        'Inspect real evaluation metrics (R², MAE, RMSE), algorithm comparisons, feature importances, and Actual vs Predicted scatter distributions.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure User Accounts',
      description:
        'Protected by bcrypt password hashing, JWT session tokens, role-based access control, and dedicated administrator governance.',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Select Your Property Location',
      desc: 'Choose State/UT, District, City, and Locality from our cascading India-wide location selector.',
    },
    {
      step: '02',
      title: 'Enter Property Details',
      desc: 'Specify property type, built-up area (sq.ft.), BHK, bathrooms, property age, floor level, and furnishing.',
    },
    {
      step: '03',
      title: 'Submit the Prediction Form',
      desc: 'Our frontend and Express backend validate every feature against the active ML schema.',
    },
    {
      step: '04',
      title: 'AI Model Processes Information',
      desc: 'The Python Flask microservice verifies city-level training coverage and executes Scikit-learn inference.',
    },
    {
      step: '05',
      title: 'View Estimated Property Value',
      desc: 'Examine total estimated value, price per sq.ft., model metrics, and coverage verification.',
    },
    {
      step: '06',
      title: 'Save or Download Your Report',
      desc: 'Access your valuation anytime in Prediction History or export a formatted report.',
    },
  ];

  const faqs = [
    {
      q: 'Does HOUSE AI support all states and union territories in India?',
      a: 'Yes. The HOUSE AI location master database includes all 28 States and 8 Union Territories of India (36 administrative units), along with districts, cities, and localities.',
    },
    {
      q: 'How does HOUSE AI handle cities where ML training data is insufficient?',
      a: 'We strictly separate location database availability from ML training coverage. Every city in our database is selectable, but if a selected city is outside the trained ML coverage, HOUSE AI transparently notifies you of insufficient training coverage rather than generating a misleading estimate.',
    },
    {
      q: 'What machine learning algorithms are benchmarked in HOUSE AI?',
      a: 'Our Python ML pipeline trains and benchmarks Linear Regression, Random Forest Regressor, and Gradient Boosting Regressor using an 80/20 train-test split and cross-validation, selecting the highest-performing model based on test R² and RMSE.',
    },
    {
      q: 'Is the training dataset real-world transaction data or synthetic?',
      a: 'The initial model is trained on a clearly labeled, structured Synthetic Benchmark Dataset calibrated across Indian urban micro-markets. Estimates are intended for analytical and educational decision support and are not official legal valuations.',
    },
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white py-20 lg:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>MERN + Python Scikit-learn Real Estate Valuation Platform</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Smarter Property Decisions with{' '}
                <span className="text-blue-400">AI-Powered Price Prediction</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Discover estimated residential property values across India using machine learning,
                location intelligence and property analytics.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/predict" className="btn-primary px-6 py-3.5 text-base">
                  <Calculator className="w-5 h-5" />
                  Predict Property Price
                </Link>
                <Link
                  to="/model-performance"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-base"
                >
                  Explore Platform
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs text-slate-300">
                <div>
                  <span className="block text-lg font-extrabold text-white">28 States + 8 UTs</span>
                  <span>Complete Administrative Hierarchy</span>
                </div>
                <div>
                  <span className="block text-lg font-extrabold text-blue-400">
                    {modelMeta ? `R² ${modelMeta.metrics.r2Score}` : '3 ML Algorithms'}
                  </span>
                  <span>Verified Test Set Evaluation</span>
                </div>
                <div>
                  <span className="block text-lg font-extrabold text-emerald-400">
                    {modelMeta ? `${modelMeta.supportedLocations.coveredCitiesCount} Cities` : 'India-Wide'}
                  </span>
                  <span>Active ML Training Coverage</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">HOUSE AI Valuation Engine</h3>
                      <p className="text-xs text-slate-400">
                        {modelMeta ? modelMeta.modelName : 'Scikit-learn Gradient Boosting Pipeline'}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    Live Engine
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-400">Location Hierarchy</span>
                    <span className="font-semibold text-white">State → District → City → Locality</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-400">Structural Features</span>
                    <span className="font-semibold text-white">Area, BHK, Bath, Age, Floor, Type</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-400">Active ML Algorithm</span>
                    <span className="font-semibold text-blue-400">
                      {modelMeta ? modelMeta.algorithm : 'Gradient Boosting Regressor'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
                    <span className="text-slate-400">Training Dataset Records</span>
                    <span className="font-semibold text-emerald-400">
                      {modelMeta
                        ? `${modelMeta.datasetInfo.datasetRecords.toLocaleString('en-IN')} Cleaned Records (Synthetic)`
                        : 'Verified Preprocessing Pipeline'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
                  Select any Indian State, City, and Locality to check live ML training coverage and
                  compute a transparent property valuation report.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Enterprise Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-2">
            Built for Accurate, Transparent Property Intelligence
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] mt-3">
            Every component of HOUSE AI connects real MongoDB persistence, Express REST APIs, and a
            dedicated Python Scikit-learn machine learning service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="card-surface p-6 hover:shadow-card-hover transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">{feat.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6D4AFF]">
              End-to-End Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-2">
              How HOUSE AI Property Valuation Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-2xl bg-[#F4F7FB] border border-slate-200/80 relative"
              >
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#0F172A] text-white">
                  Step {item.step}
                </span>
                <h3 className="text-base font-bold text-[#0F172A] mt-4 mb-2">{item.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECHNOLOGY & RESEARCH HIGHLIGHTS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-surface p-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-3">
              <Layers className="w-4 h-4" />
              <span>System Architecture Overview</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#0F172A] mb-3">
              Decoupled MERN + Python ML Microservice Stack
            </h3>
            <p className="text-sm text-[#64748B] leading-relaxed mb-5">
              HOUSE AI separates user interface, business logic, database persistence, and machine
              learning inference into dedicated layers:
            </p>
            <ul className="space-y-2.5 text-sm text-[#1E293B]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>
                  <strong>React 18 + Vite + Tailwind CSS:</strong> Responsive SaaS UI with Recharts
                  visualizations.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>
                  <strong>Node.js + Express + MongoDB:</strong> JWT authentication, location APIs,
                  and prediction persistence.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>
                  <strong>Python Flask + Scikit-learn:</strong> ColumnTransformer preprocessing and
                  Gradient Boosting regression.
                </span>
              </li>
            </ul>
          </div>

          <div className="card-surface p-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D4AFF] mb-3">
              <Database className="w-4 h-4" />
              <span>Research & Data Integrity</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#0F172A] mb-3">
              Location Database vs. ML Prediction Coverage
            </h3>
            <p className="text-sm text-[#64748B] leading-relaxed mb-5">
              Unlike basic demos that restrict users to 4 or 5 cities or invent predictions for
              unknown areas, HOUSE AI implements dual-tier coverage verification:
            </p>
            <div className="space-y-3 text-xs text-[#64748B] bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p>
                <strong className="text-[#0F172A]">1. Administrative Location Master:</strong> All
                28 States and 8 Union Territories (125 districts, 150 cities, 820 localities) are
                searchable and selectable.
              </p>
              <p>
                <strong className="text-[#0F172A]">2. ML Coverage Verification:</strong> The Python
                inference service validates whether the chosen city is covered by the trained model
                before generating an estimate.
              </p>
            </div>
            <div className="mt-5">
              <Link to="/research" className="text-sm font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1.5">
                Read Complete Research & Methodology
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-[#0F172A]">Frequently Asked Questions</h2>
            <p className="text-sm text-[#64748B] mt-2">
              Key details about HOUSE AI location coverage, ML training, and valuation reports.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 bg-slate-50/60 hover:bg-slate-50 font-bold text-sm text-[#0F172A]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 py-4 text-sm text-[#64748B] leading-relaxed bg-white border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
