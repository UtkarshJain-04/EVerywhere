import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, MapPin, Zap, ShieldCheck } from 'lucide-react';
import loginEvImage from '../assets/login_ev_scenic.jpg';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen w-full bg-white relative flex flex-col lg:flex-row selection:bg-[#0a8754] selection:text-white">
      {/* Decorative Botanical Leaf Silhouettes matching reference image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top right of left column */}
        <svg
          className="absolute top-0 left-[34%] lg:left-[40%] w-48 h-48 lg:w-56 lg:h-56 text-emerald-100/50 transform -rotate-15 translate-y-[-15%]"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M40,160 C30,90 90,30 160,20 C170,90 110,150 40,160 Z" />
          <path d="M40,160 Q100,90 160,20" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="3" fill="none" />
        </svg>

        {/* Mid-right leaf on left section */}
        <svg
          className="absolute top-[32%] left-[44%] lg:left-[45%] w-36 h-36 text-emerald-100/40 transform rotate-25"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M30,170 C20,90 90,30 170,20 C180,100 110,170 30,170 Z" />
        </svg>

        {/* Bottom right corner leaf decoration */}
        <svg
          className="absolute -bottom-8 -right-8 w-60 h-60 lg:w-72 lg:h-72 text-emerald-100/45 transform rotate-45"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M30,170 C20,90 90,30 170,20 C180,100 110,170 30,170 Z" />
          <path d="M30,170 Q100,95 170,20" stroke="rgba(16, 185, 129, 0.22)" strokeWidth="3" fill="none" />
        </svg>
      </div>

      {/* =========================================================
          LEFT SECTION: Brand, Value Proposition & Scenic EV Display
          ========================================================= */}
      <div className="w-full lg:w-[48%] xl:w-[46%] p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between relative z-10">
        <div>
          {/* Top Brand Logo - clicking returns to existing Home page */}
          <Link
            to="/"
            className="inline-flex items-center gap-3 group select-none transition-transform hover:scale-[1.01]"
          >
            {/* ChargeNav Map-Pin Teardrop with Lightning Bolt */}
            <div className="w-11 h-11 relative flex items-center justify-center shrink-0">
              <svg className="w-11 h-11 drop-shadow-xs" viewBox="0 0 44 44" fill="none">
                <path
                  d="M22 2C11.5 2 3 10.5 3 21C3 26.2 5.8 30.8 10 34.2L6 42L15.2 38.8C17.3 39.6 19.6 40 22 40C32.5 40 41 31.5 41 21C41 10.5 32.5 2 22 2Z"
                  fill="#0A8754"
                />
                <path
                  d="M23 10L13 23H21L19 33L31 20H23L23 10Z"
                  fill="white"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-bold text-[#0d233a] tracking-tight leading-none group-hover:text-[#0a8754] transition-colors">
                ChargeNav
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-tight mt-1">
                Smart Routes. Charged Journeys.
              </span>
            </div>
          </Link>

          {/* Heading */}
          <div className="mt-6 sm:mt-7">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[45px] font-extrabold text-[#0d233a] tracking-tight leading-[1.12]">
              Join ChargeNav<br />
              <span className="text-[#0a8754]">and Drive the Change</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mt-2.5 max-w-md">
              Create your account to get personalized routes, find nearby charging stations, and make your EV journey smarter and easier.
            </p>
          </div>

          {/* Four Feature Items with Green Icons */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-5 sm:mt-6 max-w-lg">
            {/* 1. Find Charging Stations */}
            <div className="flex flex-col items-center text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#eaf6ee] flex items-center justify-center text-[#0a8754] mb-2 shadow-2xs">
                <MapPin className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-800 leading-tight">
                Find Charging<br />Stations
              </span>
            </div>

            {/* 2. Plan Smarter Routes */}
            <div className="flex flex-col items-center text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#eaf6ee] flex items-center justify-center text-[#0a8754] mb-2 shadow-2xs">
                <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="18" r="2.5" />
                  <path d="M8.5 18h2a4 4 0 0 0 4-4V10a4 4 0 0 1 4-4h2" />
                  <circle cx="18" cy="6" r="2.5" />
                </svg>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-800 leading-tight">
                Plan Smarter<br />Routes
              </span>
            </div>

            {/* 3. Save Time & Cost */}
            <div className="flex flex-col items-center text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#eaf6ee] flex items-center justify-center text-[#0a8754] mb-2 shadow-2xs">
                <Zap className="w-5 h-5 sm:w-5.5 sm:h-5.5 fill-[#0a8754] stroke-[#0a8754]" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-800 leading-tight">
                Save Time<br />&amp; Cost
              </span>
            </div>

            {/* 4. Travel with Confidence */}
            <div className="flex flex-col items-center text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#eaf6ee] flex items-center justify-center text-[#0a8754] mb-2 shadow-2xs">
                <ShieldCheck className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-800 leading-tight">
                Travel<br />with Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Scenic EV Card (Exact same asset from Login page) */}
        <div className="mt-6 relative rounded-[24px] lg:rounded-[28px] overflow-hidden shadow-lg border border-slate-100 bg-slate-900 group">
          <img
            src={loginEvImage}
            alt="ChargeNav Scenic Route with Electric Vehicle"
            className="w-full h-[220px] sm:h-[260px] lg:h-[280px] xl:h-[310px] object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
          />

          {/* Bottom Gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

          {/* Bottom-Left Overlay: "Greener Roads, Brighter Future" with Leaf */}
          <div className="absolute bottom-4 left-5 select-none">
            <div className="font-['Caveat',_cursive] text-white text-2xl sm:text-[28px] font-bold leading-[1.1] tracking-wide drop-shadow-md">
              Greener Roads<br />
              <span className="flex items-center gap-1.5">
                Brighter Future
                <svg className="w-5 h-5 text-emerald-400 fill-emerald-400 inline-block drop-shadow" viewBox="0 0 24 24">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          RIGHT SECTION: Signup Card & Social Auth
          ========================================================= */}
      <div className="w-full lg:w-[52%] xl:w-[54%] p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between relative z-10">
        {/* Top-Right "Already have an account? Log In ->" */}
        <div className="flex justify-end items-center gap-1 text-sm select-none">
          <span className="text-slate-500">Already have an account?</span>
          <Link
            to="/login"
            className="font-semibold text-[#0a8754] hover:text-[#087346] hover:underline flex items-center gap-1 ml-1 transition-colors"
          >
            <span>Log In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Centered Signup Card matching reference image */}
        <div className="max-w-[500px] w-full mx-auto my-auto py-4 sm:py-6">
          <div className="bg-white border border-slate-200/90 rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 md:p-8 shadow-sm">
            {/* Header */}
            <div className="mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d233a] tracking-tight">
                Create Your Account
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Join ChargeNav and start exploring smarter routes today.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* 1. Full Name */}
              <div>
                <label 
                  htmlFor="signup-name" 
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-[#0a8754]/20 transition-all"
                  />
                </div>
              </div>

              {/* 2. Email Address */}
              <div>
                <label 
                  htmlFor="signup-email" 
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-[#0a8754]/20 transition-all"
                  />
                </div>
              </div>

              {/* 3. Password */}
              <div>
                <label 
                  htmlFor="signup-password" 
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="w-full pl-10 sm:pl-11 pr-11 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-[#0a8754]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* 4. Confirm Password */}
              <div>
                <label 
                  htmlFor="signup-confirm-password" 
                  className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full pl-10 sm:pl-11 pr-11 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-[#0a8754]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full mt-4 py-3 px-6 rounded-xl bg-[#0a8754] hover:bg-[#087346] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20 hover:shadow-md hover:shadow-emerald-700/30 transition-all cursor-pointer select-none"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 tracking-wider uppercase absolute">
                OR
              </span>
            </div>

            {/* Social Buttons: Continue with Google & Continue with Apple */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Google */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer select-none"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span className="whitespace-nowrap">Continue with Google</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer select-none"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0 text-slate-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1 .08 2.02-.49 2.64-1.24z"/>
                </svg>
                <span className="whitespace-nowrap">Continue with Apple</span>
              </button>
            </div>

            {/* Terms & Privacy Policy */}
            <p className="text-center text-[11px] text-slate-500 mt-5 leading-relaxed">
              By creating an account, you agree to our{' '}
              <a href="#terms" onClick={(e) => e.preventDefault()} className="text-[#0a8754] font-medium hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-[#0a8754] font-medium hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        {/* Empty bottom space */}
        <div className="hidden lg:block h-2" />
      </div>
    </div>
  );
}
