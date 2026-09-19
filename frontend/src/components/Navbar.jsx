import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Zap } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 transition-all">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 h-18 flex items-center justify-between">
        
        {/* Left: Brand Logo & Tagline */}
        <Link 
          to="/" 
          onClick={handleNavClick}
          className="flex items-center gap-3 group select-none"
        >
          <div className="w-10 h-10 rounded-full bg-[#0a8754] flex items-center justify-center shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#0d233a] tracking-tight leading-none group-hover:text-[#0a8754] transition-colors">
              ChargeNav
            </span>
            <span className="text-[11px] font-medium text-slate-500 tracking-tight mt-1">
              Smart Routes. Charged Journeys.
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {/* Home Link */}
          <Link
            to="/"
            onClick={handleNavClick}
            className={`flex flex-col items-center text-sm ${
              isHome 
                ? 'font-semibold text-[#0a8754]' 
                : 'font-medium text-slate-600 hover:text-[#0a8754]'
            } transition-colors py-1`}
          >
            <span>Home</span>
            {isHome && <span className="w-4 h-0.5 bg-[#0a8754] rounded-full mt-1"></span>}
          </Link>

          {/* About Link */}
          <Link
            to="/about"
            onClick={handleNavClick}
            className={`flex flex-col items-center text-sm ${
              isAbout 
                ? 'font-semibold text-[#0a8754]' 
                : 'font-medium text-slate-600 hover:text-[#0a8754]'
            } transition-colors py-1`}
          >
            <span>About</span>
            {isAbout && <span className="w-4 h-0.5 bg-[#0a8754] rounded-full mt-1"></span>}
          </Link>

          {/* Other Links */}
          {['Features', 'How It Works', 'Contact'].map((item) => (
            <a
              key={item}
              href={`/#${item.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={handleNavClick}
              className="text-sm font-medium text-slate-600 hover:text-[#0a8754] transition-colors py-1"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right: Search & Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            type="button"
            onClick={handleNavClick}
            aria-label="Search"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNavClick}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs cursor-pointer"
          >
            Login
          </button>

          <button
            type="button"
            onClick={handleNavClick}
            className="px-5 py-2 text-sm font-medium text-white bg-[#0a8754] hover:bg-[#087346] rounded-xl transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={handleNavClick}
            aria-label="Search"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 pt-4 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3">
            <Link
              to="/"
              onClick={handleNavClick}
              className={`text-base py-1 ${isHome ? 'text-[#0a8754] font-semibold' : 'text-slate-600 font-medium hover:text-[#0a8754]'}`}
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={handleNavClick}
              className={`text-base py-1 ${isAbout ? 'text-[#0a8754] font-semibold' : 'text-slate-600 font-medium hover:text-[#0a8754]'}`}
            >
              About
            </Link>
            {['Features', 'How It Works', 'Contact'].map((item) => (
              <a
                key={item}
                href={`/#${item.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={handleNavClick}
                className="text-slate-600 hover:text-[#0a8754] text-base py-1 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleNavClick}
              className="w-full py-2.5 text-center text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Login
            </button>
            <button
              type="button"
              onClick={handleNavClick}
              className="w-full py-2.5 text-center text-sm font-medium text-white bg-[#0a8754] hover:bg-[#087346] rounded-xl shadow-sm"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
