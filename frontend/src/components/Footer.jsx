import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Cpu, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                HOUSE <span className="text-blue-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              India-wide AI real estate price prediction and location intelligence platform covering
              all 28 States and 8 Union Territories.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span>36 Administrative Units • 125 Districts • 820+ Localities</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Platform Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Platform
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  AI Valuation Services
                </Link>
              </li>
              <li>
                <Link to="/research" className="hover:text-white transition-colors">
                  Research & Methodology
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Workspace & Tools
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/predict" className="hover:text-white transition-colors">
                  Predict Property Price
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  User Analytics Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition-colors">
                  Prediction History
                </Link>
              </li>
              <li>
                <Link to="/model-performance" className="hover:text-white transition-colors">
                  ML Model Performance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Architecture & Transparency
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Powered by React, Node.js/Express, MongoDB, and a Python Scikit-learn Gradient
                  Boosting Microservice.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Trained on the HOUSE AI Synthetic Residential Benchmark Dataset with transparent
                  city-level ML coverage verification.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} HOUSE AI Platform. Built from scratch with MERN + Python ML.</p>
          <p>Estimates are analytical decision-support outputs and not certified legal appraisals.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
