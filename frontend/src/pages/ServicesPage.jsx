import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  BarChart3,
  MapPin,
  Cpu,
  FileText,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      icon: Calculator,
      title: '1. AI House Price Estimation',
      description:
        'Instant residential property valuation for Apartments/Flats, Independent Houses, Villas, and Residential Properties based on area, BHK, bathrooms, property age, floor level, parking, and furnishing.',
      highlights: [
        'Total estimated property value & price per sq.ft.',
        'Structural & micro-market component breakdown',
        'Strict input schema validation against trained ML features',
      ],
    },
    {
      icon: MapPin,
      title: '2. India-Wide Location-Based Analysis',
      description:
        'Hierarchical location intelligence spanning all 28 Indian States and 8 Union Territories (125 districts, 150 cities, 820+ localities) with live ML coverage verification.',
      highlights: [
        'Cascading Country → State/UT → District → City → Locality selector',
        'Alphabetically sorted searchable dropdowns with debounced queries',
        'Clear differentiation between database coverage and ML training coverage',
      ],
    },
    {
      icon: BarChart3,
      title: '3. Portfolio & Property Analytics',
      description:
        'Interactive user dashboard powered by MongoDB aggregations and Recharts visualizations to analyze your historical valuation requests.',
      highlights: [
        'Monthly prediction activity & 30-day velocity metrics',
        'City-wise and BHK-wise valuation distributions',
        'Price bracket segmentation and data-driven insights',
      ],
    },
    {
      icon: Cpu,
      title: '4. AI/ML Performance & Feature Insights',
      description:
        'Dedicated machine learning observatory displaying real Scikit-learn test metrics, algorithm comparisons, and feature importances.',
      highlights: [
        'Linear Regression vs. Random Forest vs. Gradient Boosting comparison',
        'Aggregated feature importance percentages',
        'Actual vs. Predicted test set scatter visualization',
      ],
    },
    {
      icon: FileText,
      title: '5. Downloadable & Printable Valuation Reports',
      description:
        'Generate structured property valuation reports with complete location metadata, property specifications, model version, and provenance disclaimers.',
      highlights: [
        'One-click HTML/PDF print-ready export',
        'Persistent cloud/local MongoDB prediction history',
        'Multi-criteria filtering by state, city, locality, BHK, and price range',
      ],
    },
    {
      icon: ShieldCheck,
      title: '6. Enterprise Administration & Governance',
      description:
        'Role-based administrator portal for monitoring service health, managing user accounts, auditing global predictions, and resolving contact inquiries.',
      highlights: [
        'Live Express, MongoDB, and Python Flask microservice health status',
        'Secure user role management with privilege escalation safeguards',
        'Global prediction audit log and contact management',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
          Platform Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-2">
          Comprehensive Real Estate Valuation & Analytics Suite
        </h1>
        <p className="text-sm sm:text-base text-[#64748B] mt-3">
          Explore the core functional modules delivered by the HOUSE AI platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <div key={idx} className="card-surface p-7 flex flex-col justify-between space-y-5">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-extrabold text-[#0F172A] mb-2">{srv.title}</h2>
                <p className="text-sm text-[#64748B] leading-relaxed mb-4">{srv.description}</p>
                <ul className="space-y-2 text-xs text-[#1E293B] border-t border-slate-100 pt-4">
                  {srv.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#0F172A] text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-extrabold">Ready to Estimate a Property Value?</h3>
          <p className="text-sm text-slate-300 mt-1">
            Launch the AI Prediction Engine or inspect live ML model performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/predict" className="btn-primary text-sm">
            Predict Property Price
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
