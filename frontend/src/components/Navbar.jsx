import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, LayoutDashboard, Calculator, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Research', path: '/research' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-sm group-hover:bg-[#2563EB] transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-[#0F172A]">
              HOUSE <span className="text-[#2563EB]">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-widest text-[#64748B] -mt-1">
              India Property Intelligence
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-[#2563EB] bg-blue-50/80'
                    : 'text-[#1E293B] hover:text-[#2563EB] hover:bg-slate-50'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/predict" className="btn-secondary text-sm py-2 px-3.5">
                <Calculator className="w-4 h-4 text-[#2563EB]" />
                Predict Price
              </Link>
              <Link to="/dashboard" className="btn-primary text-sm py-2 px-4">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="btn-purple text-sm py-2 px-3.5"
                  title="Administrator Portal"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-[#EF4444] hover:bg-red-50 transition-colors"
                title={`Sign out (${user?.name})`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#1E293B] hover:text-[#2563EB] transition-colors"
              >
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-xl text-[#1E293B] hover:bg-slate-100"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-blue-50 text-[#2563EB]' : 'text-[#1E293B] hover:bg-slate-50'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Open Dashboard
                </Link>
                <Link
                  to="/predict"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full text-sm"
                >
                  <Calculator className="w-4 h-4" />
                  Predict Property Price
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-purple w-full text-sm"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-secondary w-full text-sm text-[#EF4444]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
