import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Zap,
  Navigation,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BatteryCharging,
  Plug,
  Gauge,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VehicleProfileCard from '../components/vehicle/VehicleProfileCard';

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recent Member';

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0a8754] flex items-center justify-center mx-auto border border-emerald-100">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0d233a]">Sign in to access your profile</h2>
            <p className="text-xs text-slate-500 mt-2">
              Save your electric vehicle specifications, customize battery thresholds, and enjoy personalized route recommendations.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              to="/login"
              className="w-full py-3 rounded-2xl bg-[#0a8754] hover:bg-[#087346] text-white text-xs font-bold transition-colors shadow-sm"
            >
              Sign In to ChargeNav
            </Link>
            <Link
              to="/signup"
              className="w-full py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50/60 min-h-[calc(100vh-72px)] py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 space-y-8">
        
        {/* Profile Hero Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0a8754] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-sm shadow-emerald-500/20 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0d233a] tracking-tight">
                  {user?.name || 'EV Driver'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-emerald-50 border border-emerald-200 text-[#0a8754]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Driver</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.email}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Driver since {memberSince}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl bg-[#0a8754] hover:bg-[#087346] text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 rotate-45" />
              <span>Plan Journey</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid: Left side Vehicle Card, Right side How it works */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Add Your Vehicle Profile */}
          <div className="lg:col-span-8 space-y-6">
            <VehicleProfileCard standalone={true} />
          </div>

          {/* Right Column (4 cols): Personalization Highlights & Quick Facts */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Why Vehicle Profile Matters Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-[#0a8754]">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-black text-[#0d233a] uppercase tracking-wider">
                  How Personalization Works
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <BatteryCharging className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[12px] mb-0.5">True Battery Modeling</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Energy use is calculated using your vehicle's specific pack capacity and efficiency, not generic defaults.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Plug className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[12px] mb-0.5">Connector Matching</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Directly verifies whether corridor charging stations provide your vehicle's connector (CCS2, Type 2, etc.).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[12px] mb-0.5">Realistic Charging Times</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Charging rates are capped at your EV's onboard peak limit, providing real-world charging duration estimates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/"
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Test on Route Planner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

