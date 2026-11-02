import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  MapPin,
  Zap,
  ShieldCheck,
  ThumbsUp,
  Flag,
  Share2,
  Camera,
  Play,
  Navigation,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  User,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import WriteReviewModal from './WriteReviewModal';
import MediaLightbox from './MediaLightbox';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export default function StationDetailModal({
  station,
  isOpen,
  onClose,
  routeOrigin = null,
  onAddStop = null,
  isCurrentStop = false,
}) {
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reviews' | 'media'
  const [reviewsData, setReviewsData] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'highest' | 'lowest' | 'helpful'
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Write Review Modal
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Lightbox Media Viewer
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Feedback notifications
  const [actionNotice, setActionNotice] = useState(null);

  // User station status (verified visit, existing review)
  const [userStationStatus, setUserStationStatus] = useState(null);

  const stationId = station?.uid;

  // Load reviews and status whenever stationId, sortBy, or verifiedOnly changes
  useEffect(() => {
    if (!stationId || !isOpen) return;

    let isMounted = true;
    setLoadingReviews(true);

    api.reviews
      .getStationReviews(stationId, { sort: sortBy, verified: verifiedOnly })
      .then((res) => {
        if (isMounted && res.success) {
          setReviewsData(res);
        }
      })
      .catch((err) => {
        console.warn('Failed to load station reviews:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoadingReviews(false);
      });

    // Check user status
    if (isAuthenticated) {
      api.reviews
        .getUserStatus(stationId)
        .then((res) => {
          if (isMounted && res.success) {
            setUserStationStatus(res);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [stationId, isOpen, sortBy, verifiedOnly, isAuthenticated]);

  // Load media gallery when Photos tab is activated
  useEffect(() => {
    if (activeTab === 'media' && stationId && isOpen) {
      setLoadingMedia(true);
      api.reviews
        .getStationMedia(stationId)
        .then((res) => {
          if (res.success) {
            setMediaList(res.media || []);
          }
        })
        .catch((err) => console.warn('Failed to load media:', err.message))
        .finally(() => setLoadingMedia(false));
    }
  }, [activeTab, stationId, isOpen]);

  if (!isOpen || !station) return null;

  const stats = reviewsData?.stationStats || {
    averageRating: station.averageRating || 4.5,
    totalReviews: station.reviewCount || 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    verifiedVisitsCount: 0,
    mediaCount: 0,
    recommendationPercentage: 90,
  };

  const reviews = reviewsData?.reviews || [];

  const handleHelpfulVote = async (reviewId) => {
    if (!isAuthenticated) {
      setActionNotice({ type: 'info', text: 'Please log in to vote on reviews.' });
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }

    try {
      const res = await api.reviews.toggleHelpful(reviewId);
      if (res.success) {
        setReviewsData((prev) => {
          if (!prev) return prev;
          const updated = prev.reviews.map((r) => {
            if (r._id === reviewId) {
              return {
                ...r,
                helpfulCount: res.helpfulCount,
                hasVotedHelpful: res.hasVoted,
              };
            }
            return r;
          });
          return { ...prev, reviews: updated };
        });
      }
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message || 'Vote failed.' });
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  const handleReport = async (reviewId) => {
    if (!isAuthenticated) {
      setActionNotice({ type: 'info', text: 'Please log in to report reviews.' });
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }

    try {
      const res = await api.reviews.reportReview(reviewId);
      setActionNotice({ type: 'success', text: res.message });
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    try {
      const res = await api.reviews.deleteReview(reviewId);
      if (res.success) {
        setActionNotice({ type: 'success', text: 'Review deleted successfully.' });
        // Refresh reviews
        const updated = await api.reviews.getStationReviews(stationId, { sort: sortBy });
        setReviewsData(updated);
        setUserStationStatus((prev) => ({ ...prev, hasReviewed: false, userReview: null }));
        setTimeout(() => setActionNotice(null), 3500);
      }
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  const handleOpenLightbox = (list, index) => {
    setMediaList(list);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Google Maps directions URL from user source location
  const originParam = routeOrigin
    ? `${routeOrigin.latitude},${routeOrigin.longitude}`
    : '';

  const directionsUrl = originParam
    ? `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${station.latitude},${station.longitude}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}&travelmode=driving`;

  const speedKw = station.charging_speed || station.speed || station.capacity || 25;
  const isAvailable = Number(station.available) > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Notification Alert */}
        {actionNotice && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 ${
              actionNotice.type === 'success'
                ? 'bg-emerald-600 text-white'
                : actionNotice.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-slate-900 text-white'
            }`}
          >
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{actionNotice.text}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50/20 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0a8754] text-white text-[10.5px] font-black uppercase tracking-wider shadow-2xs">
                  {speedKw} kW {station.power_type || 'DC Fast'}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                    isAvailable
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isAvailable ? `${station.available} Plugs Available` : 'Plugs in use'}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {station.vendor_name || 'ChargeNav Network'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#0d233a] leading-tight truncate">
                {station.name}
              </h2>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#0a8754] shrink-0" />
                <span className="truncate">{station.address}</span>
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Header Stats & Action CTA */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-xl font-black text-[#0d233a] ml-1">
                  {stats.averageRating > 0 ? stats.averageRating : '4.5'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  / 5 ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {stats.verifiedVisitsCount > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{stats.verifiedVisitsCount} Verified Visits</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    setActionNotice({ type: 'info', text: 'Please sign in to write a community review.' });
                    setTimeout(() => setActionNotice(null), 3500);
                    return;
                  }
                  setEditingReview(userStationStatus?.userReview || null);
                  setIsWriteModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0a8754] hover:bg-[#087346] text-white text-xs font-bold transition-all shadow-2xs hover:shadow cursor-pointer select-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{userStationStatus?.hasReviewed ? 'Edit Your Review' : 'Write a Review'}</span>
              </button>

              {onAddStop && !isCurrentStop && (
                <button
                  type="button"
                  onClick={() => {
                    onAddStop(station);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors cursor-pointer select-none"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Add as Stop</span>
                </button>
              )}

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Navigate to station in Google Maps"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 mt-4 -mb-4">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'reviews', label: `Reviews & Ratings (${stats.totalReviews})` },
              { id: 'media', label: `Photos & Videos (${stats.mediaCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#0a8754] text-[#0a8754]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ==================================================== */}
          {/* TAB 1: OVERVIEW                                      */}
          {/* ==================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Rating Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80">
                {/* Big Score Box */}
                <div className="flex flex-col items-center justify-center text-center p-3">
                  <div className="text-4xl sm:text-5xl font-black text-[#0d233a] leading-none mb-1">
                    {stats.averageRating > 0 ? stats.averageRating : '4.5'}
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(stats.averageRating || 4.5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Based on {stats.totalReviews} community reviews
                  </span>
                  <span className="mt-2 text-[11px] font-bold text-[#0a8754] bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                    {stats.recommendationPercentage || 92}% Recommend this charger
                  </span>
                </div>

                {/* Star Distribution Progress Bars */}
                <div className="col-span-2 space-y-1.5 justify-center flex flex-col">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = stats.ratingDistribution[stars] || 0;
                    const percent = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-8 font-bold text-slate-600 text-[11px] shrink-0">
                          {stars} ★
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-[11px] text-slate-400 text-right shrink-0">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Station Hardware Specifications Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Charging Hardware &amp; Operational Specs
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10.5px] font-bold text-slate-400 block uppercase">Max Power</span>
                    <span className="text-base font-black text-[#0d233a]">
                      {speedKw} kW
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {station.power_type || 'DC Fast Charging'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10.5px] font-bold text-slate-400 block uppercase">Connector Type</span>
                    <span className="text-base font-black text-[#0d233a] truncate block">
                      {station.charger_type || 'CCS2'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Standard EV Standard
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10.5px] font-bold text-slate-400 block uppercase">Availability</span>
                    <span className={`text-base font-black ${isAvailable ? 'text-emerald-700' : 'text-red-600'}`}>
                      {isAvailable ? `${station.available} Plugs Free` : 'Occupied'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Total {station.total || 2} Bays
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10.5px] font-bold text-slate-400 block uppercase">Tariff Rate</span>
                    <span className="text-base font-black text-[#0d233a]">
                      {station.cost_per_unit || '₹ 18 / kWh'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Standard Commercial
                    </span>
                  </div>
                </div>
              </div>

              {/* Community EV Sentiment Highlights */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0a8754]" />
                  <span className="font-extrabold text-[#0d233a]">Community EV Insights:</span>
                  <span className="text-slate-600">
                    High reliability, fast charging ramp, and verified working CCS2 connectors.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="font-bold text-[#0a8754] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Read all reviews</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Recent Community Review Highlight */}
              {reviews.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Recent Driver Experience
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveTab('reviews')}
                      className="text-xs font-bold text-[#0a8754] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#0a8754] flex items-center justify-center font-bold text-xs">
                          {reviews[0].userName.charAt(0)}
                        </div>
                        <span className="font-bold text-[#0d233a]">{reviews[0].userName}</span>
                        {reviews[0].isVerifiedVisit && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified Visit</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= reviews[0].rating ? 'fill-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed italic">
                      "{reviews[0].reviewText}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: REVIEWS & RATINGS                             */}
          {/* ==================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-5">
              {/* Controls Bar: Filter & Sort */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-200/80 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifiedOnly((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      verifiedOnly
                        ? 'bg-[#0a8754] text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Visits Only</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium text-[11px]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 font-semibold text-slate-700 focus:outline-none focus:border-[#0a8754]"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rated (5★ to 1★)</option>
                    <option value="lowest">Lowest Rated (1★ to 5★)</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>
              </div>

              {/* Reviews Loading State */}
              {loadingReviews && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#0a8754] border-t-transparent animate-spin"></div>
                  <span className="text-xs text-slate-500 font-semibold">Loading community reviews...</span>
                </div>
              )}

              {/* Reviews List */}
              {!loadingReviews && reviews.length === 0 ? (
                <div className="p-10 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-3">
                  <Star className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">No Reviews Found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {verifiedOnly
                      ? 'No verified visit reviews yet for this filter. Switch to all reviews to view community feedback.'
                      : 'Be the first driver to review this charging station and help fellow EV travelers!'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setActionNotice({ type: 'info', text: 'Please sign in to write a review.' });
                        setTimeout(() => setActionNotice(null), 3500);
                        return;
                      }
                      setIsWriteModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0a8754] hover:bg-[#087346] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Write First Review</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => {
                    const isAuthor = user && rev.user && rev.user.toString() === user._id.toString();
                    const dateFormatted = new Date(rev.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <div
                        key={rev._id}
                        className={`p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 bg-white shadow-2xs ${
                          rev.isVerifiedVisit
                            ? 'border-emerald-200/80 hover:border-emerald-300'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Reviewer Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-sm shadow-2xs">
                              {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-[#0d233a] text-sm">
                                  {rev.userName}
                                </span>
                                {rev.isVerifiedVisit && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black tracking-wide">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Verified Visit</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                Reviewed on {dateFormatted}
                              </span>
                            </div>
                          </div>

                          {/* Star Rating Badge */}
                          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                            <span className="text-xs font-black text-[#0d233a] ml-1">
                              {rev.rating}.0
                            </span>
                          </div>
                        </div>

                        {/* EV Experience Pills */}
                        {rev.evFeedback && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {rev.evFeedback.chargingSpeed && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                ⚡ {rev.evFeedback.chargingSpeed}
                              </span>
                            )}
                            {rev.evFeedback.stationCondition && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                ✓ {rev.evFeedback.stationCondition}
                              </span>
                            )}
                            {rev.evFeedback.waitTime && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                ⏱ {rev.evFeedback.waitTime}
                              </span>
                            )}
                            {rev.evFeedback.cleanlinessSafety && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                🛡️ {rev.evFeedback.cleanlinessSafety}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Review Body Text */}
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                          {rev.reviewText}
                        </p>

                        {/* Attached Photos / Videos Thumbnails */}
                        {Array.isArray(rev.media) && rev.media.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {rev.media.map((med, mIdx) => (
                              <div
                                key={med._id || mIdx}
                                onClick={() => handleOpenLightbox(rev.media, mIdx)}
                                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden aspect-square border border-slate-200 cursor-pointer group bg-black shadow-2xs"
                              >
                                {med.type === 'video' ? (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                    <Play className="w-6 h-6 text-white group-hover:scale-120 transition-transform fill-white" />
                                  </div>
                                ) : (
                                  <img
                                    src={getMediaUrl(med.url)}
                                    alt="Review attached media"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Review Footer Actions (Helpful, Report, Edit/Delete) */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleHelpfulVote(rev._id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                                rev.hasVotedHelpful
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                              title="Mark this review as helpful"
                            >
                              <ThumbsUp
                                className={`w-3.5 h-3.5 ${
                                  rev.hasVotedHelpful ? 'fill-emerald-800' : ''
                                }`}
                              />
                              <span>Helpful ({rev.helpfulCount || 0})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReport(rev._id)}
                              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Report inappropriate review"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Author Controls */}
                          {isAuthor && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingReview(rev);
                                  setIsWriteModalOpen(true);
                                }}
                                className="text-slate-500 hover:text-slate-800 font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev._id)}
                                className="text-red-500 hover:text-red-700 font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: PHOTOS & VIDEOS GALLERY                       */}
          {/* ==================================================== */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-[#0d233a]">
                    Community Media Gallery
                  </h4>
                  <p className="text-xs text-slate-400">
                    Real photos &amp; videos uploaded by EV drivers at this station
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      setActionNotice({ type: 'info', text: 'Please sign in to upload photos.' });
                      setTimeout(() => setActionNotice(null), 3500);
                      return;
                    }
                    setIsWriteModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#0a8754]" />
                  <span>Upload Media</span>
                </button>
              </div>

              {loadingMedia ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#0a8754] border-t-transparent animate-spin"></div>
                  <span className="text-xs text-slate-500 font-semibold">Loading media gallery...</span>
                </div>
              ) : mediaList.length === 0 ? (
                <div className="p-10 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No Photos or Videos Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Help fellow drivers by capturing the charger screen, parking bays, and entrance.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaList.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => handleOpenLightbox(mediaList, idx)}
                      className="relative rounded-2xl overflow-hidden aspect-square border border-slate-200 cursor-pointer group bg-black shadow-2xs hover:shadow-md transition-all"
                    >
                      {item.type === 'video' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                          <Play className="w-8 h-8 fill-white group-hover:scale-120 transition-transform duration-200" />
                          <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Video</span>
                        </div>
                      ) : (
                        <img
                          src={getMediaUrl(item.url)}
                          alt={item.originalName || 'Station Photo'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}

                      {/* Hover Info Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white text-[10.5px]">
                        <span className="font-bold truncate">{item.uploaderName}</span>
                        <span className="text-slate-300 text-[9.5px]">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Sub-modal: Write / Edit Review Modal */}
      {isWriteModalOpen && (
        <WriteReviewModal
          station={station}
          existingReview={editingReview}
          isVerifiedVisitEligible={Boolean(userStationStatus?.hasVisited)}
          isOpen={isWriteModalOpen}
          onClose={() => setIsWriteModalOpen(false)}
          onReviewSubmitted={async () => {
            // Refresh reviews & status
            const updated = await api.reviews.getStationReviews(stationId, { sort: sortBy });
            setReviewsData(updated);
            if (isAuthenticated) {
              const status = await api.reviews.getUserStatus(stationId);
              setUserStationStatus(status);
            }
            setActionNotice({ type: 'success', text: 'Review published successfully!' });
            setTimeout(() => setActionNotice(null), 3500);
          }}
        />
      )}

      {/* Sub-modal: Fullscreen Media Lightbox Viewer */}
      {lightboxOpen && (
        <MediaLightbox
          mediaList={mediaList}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setLightboxIndex((prev) => (prev + 1) % mediaList.length)}
          onPrev={() => setLightboxIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length)}
        />
      )}
    </div>
  );
}

