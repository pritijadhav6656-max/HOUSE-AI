import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, Calculator, Cpu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#1E293B] hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#0F172A]">
                HOUSE AI Valuation & Analytics Portal
              </h1>
              <p className="text-xs text-[#64748B] hidden sm:block">
                India-Wide Residential Intelligence • 28 States & 8 Union Territories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/model-performance"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D4AFF] bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              ML Metrics
            </Link>
            <Link to="/predict" className="btn-primary text-xs sm:text-sm py-2 px-3.5">
              <Calculator className="w-4 h-4" />
              <span>Predict Now</span>
            </Link>
            <Link
              to="/profile"
              className="w-9 h-9 rounded-xl bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center"
              title={user?.name}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
