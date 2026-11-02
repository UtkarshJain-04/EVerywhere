import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Star,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  Trash2,
  Zap,
  Clock,
  Shield,
  Tag,
  Wrench,
} from 'lucide-react';
import { api } from '../../services/api';

const RATING_LABELS = {
  1: 'Poor – Subpar Charging Experience',
  2: 'Fair – Several Issues Encountered',
  3: 'Average – Met Basic Expectations',
  4: 'Very Good – Smooth & Reliable',
  5: 'Exceptional – Top-tier EV Charger!',
};

export default function WriteReviewModal({
  station,
  existingReview = null,
  isVerifiedVisitEligible = false,
  isOpen,
  onClose,
  onReviewSubmitted,
}) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');

  // EV Experience categories
  const [chargingSpeed, setChargingSpeed] = useState(existingReview?.evFeedback?.chargingSpeed || '');
  const [stationCondition, setStationCondition] = useState(existingReview?.evFeedback?.stationCondition || '');
  const [connectorAvailability, setConnectorAvailability] = useState(existingReview?.evFeedback?.connectorAvailability || '');
  const [waitTime, setWaitTime] = useState(existingReview?.evFeedback?.waitTime || '');
  const [cleanlinessSafety, setCleanlinessSafety] = useState(existingReview?.evFeedback?.cleanlinessSafety || '');
  const [pricingExperience, setPricingExperience] = useState(existingReview?.evFeedback?.pricingExperience || '');

  // Files state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [existingMedia, setExistingMedia] = useState(existingReview?.media || []);
  const [removedMediaIds, setRemovedMediaIds] = useState([]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setReviewText(existingReview.reviewText || '');
      setChargingSpeed(existingReview.evFeedback?.chargingSpeed || '');
      setStationCondition(existingReview.evFeedback?.stationCondition || '');
      setConnectorAvailability(existingReview.evFeedback?.connectorAvailability || '');
      setWaitTime(existingReview.evFeedback?.waitTime || '');
      setCleanlinessSafety(existingReview.evFeedback?.cleanlinessSafety || '');
      setPricingExperience(existingReview.evFeedback?.pricingExperience || '');
      setExistingMedia(existingReview.media || []);
    }
  }, [existingReview]);

  if (!isOpen) return null;

  // Handle files selection
  const handleFiles = (files) => {
    setError(null);
    const newFiles = Array.from(files);
    const totalCount = existingMedia.length - removedMediaIds.length + selectedFiles.length + newFiles.length;

    if (totalCount > 6) {
      setError('You can upload a maximum of 6 photos/videos per review.');
      return;
    }

    const validNewFiles = [];
    const newPreviews = [];

    for (const file of newFiles) {
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');

      if (!isImg && !isVid) {
        setError(`"${file.name}" is not a supported file type. Please upload JPG, PNG, WEBP or MP4, WEBM.`);
        continue;
      }

      if (isImg && file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 10MB image limit.`);
        continue;
      }

      if (isVid && file.size > 45 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 45MB video limit.`);
        continue;
      }

      validNewFiles.push(file);
      newPreviews.push({
        file,
        name: file.name,
        type: isVid ? 'video' : 'image',
        previewUrl: URL.createObjectURL(file),
      });
    }

    setSelectedFiles((prev) => [...prev, ...validNewFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingMedia = (mediaId) => {
    setRemovedMediaIds((prev) => [...prev, mediaId]);
    setExistingMedia((prev) => prev.filter((m) => m._id !== mediaId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (reviewText.trim().length < 5) {
      setError('Please write at least a few words (min 5 characters) about your charging experience.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('reviewText', reviewText.trim());

      const evFeedback = {
        chargingSpeed,
        stationCondition,
        connectorAvailability,
        waitTime,
        cleanlinessSafety,
        pricingExperience,
      };
      formData.append('evFeedback', JSON.stringify(evFeedback));

      // Append new files
      selectedFiles.forEach((file) => {
        formData.append('media', file);
      });

      // If updating, include removed media IDs
      if (removedMediaIds.length > 0) {
        formData.append('removeMediaIds', JSON.stringify(removedMediaIds));
      }

      let res;
      if (existingReview?._id) {
        res = await api.reviews.updateReview(existingReview._id, formData);
      } else {
        res = await api.reviews.submitReview(station.uid, formData);
      }

      if (res && res.success) {
        onReviewSubmitted(res.review);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeStarCount = hoverRating || rating;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1500] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0a8754]"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0a8754]">
                Community Charging Review
              </span>
            </div>
            <h3 className="text-lg font-black text-[#0d233a] leading-tight mt-0.5 truncate max-w-md">
              {existingReview ? 'Edit Your Review' : `Review ${station?.name || 'Charging Station'}`}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Verified Visit Banner Notice */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              isVerifiedVisitEligible || existingReview?.isVerifiedVisit
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck
                className={`w-5 h-5 shrink-0 ${
                  isVerifiedVisitEligible || existingReview?.isVerifiedVisit
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              />
              <div>
                <span className="font-extrabold block text-[11.5px]">
                  {isVerifiedVisitEligible || existingReview?.isVerifiedVisit
                    ? 'Verified Visit Eligible'
                    : 'Standard Community Review'}
                </span>
                <span className="text-[10.5px] opacity-80 block">
                  {isVerifiedVisitEligible || existingReview?.isVerifiedVisit
                    ? 'Your review will feature the official Verified Visit badge.'
                    : 'Complete a charging session with ChargeNav to earn a Verified badge.'}
                </span>
              </div>
            </div>
            {(isVerifiedVisitEligible || existingReview?.isVerifiedVisit) && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wide shrink-0">
                Verified
              </span>
            )}
          </div>

          {/* Interactive Star Rating */}
          <div className="text-center py-2 bg-slate-50/60 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Your Overall Rating
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:scale-115 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= activeStarCount
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-extrabold text-[#0d233a] mt-2 block">
              {RATING_LABELS[activeStarCount]}
            </span>
          </div>

          {/* Written Review Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="review-text-input" className="text-xs font-bold text-slate-700">
                Detailed Review Thoughts *
              </label>
              <span className="text-[10.5px] text-slate-400 font-medium">
                {reviewText.length} / 2000 characters
              </span>
            </div>
            <textarea
              id="review-text-input"
              rows={4}
              maxLength={2000}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="How was your charging experience? Mention charging speed, payment reliability, accessibility, parking condition, or tips for other EV owners..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0a8754] focus:ring-2 focus:ring-[#0a8754]/10 transition-all resize-y"
            />
          </div>

          {/* Optional EV Experience Categories */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Zap className="w-3.5 h-3.5 text-[#0a8754]" />
              <span className="text-xs font-bold text-slate-800">
                EV-Specific Experience (Optional)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Category 1: Charging Speed */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10.5px] font-bold text-slate-600 block mb-1.5">
                  Charging Speed Experience
                </span>
                <select
                  value={chargingSpeed}
                  onChange={(e) => setChargingSpeed(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-[#0a8754]"
                >
                  <option value="">Select speed experience...</option>
                  <option value="Blazing Fast">⚡ Blazing Fast (Full rated speed)</option>
                  <option value="Expected Speed">✓ Expected &amp; Steady Speed</option>
                  <option value="Slow / Throttled">🐢 Slower than advertised</option>
                  <option value="Failed to Charge">❌ Failed to deliver charge</option>
                </select>
              </div>

              {/* Category 2: Station Condition */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10.5px] font-bold text-slate-600 block mb-1.5">
                  Charger Operational Status
                </span>
                <select
                  value={stationCondition}
                  onChange={(e) => setStationCondition(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-[#0a8754]"
                >
                  <option value="">Select operational status...</option>
                  <option value="All Chargers Working">✓ All Chargers 100% Operational</option>
                  <option value="Some Chargers Offline">⚠️ Some Plugs Offline</option>
                  <option value="Needs Maintenance">🔧 Needs Maintenance</option>
                  <option value="Out of Service">🚫 Entire Station Out of Service</option>
                </select>
              </div>

              {/* Category 3: Waiting Time */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10.5px] font-bold text-slate-600 block mb-1.5">
                  Wait Time for a Plug
                </span>
                <select
                  value={waitTime}
                  onChange={(e) => setWaitTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-[#0a8754]"
                >
                  <option value="">Select wait time...</option>
                  <option value="No Wait">⏱ No Wait (Bays immediately free)</option>
                  <option value="< 15 mins">⏱ Short Wait (&lt; 15 mins)</option>
                  <option value="15-30 mins">⏱ Moderate Wait (15-30 mins)</option>
                  <option value="> 30 mins">⏱ Long Queue (&gt; 30 mins)</option>
                </select>
              </div>

              {/* Category 4: Cleanliness & Safety */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10.5px] font-bold text-slate-600 block mb-1.5">
                  Safety &amp; Lighting
                </span>
                <select
                  value={cleanlinessSafety}
                  onChange={(e) => setCleanlinessSafety(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-[#0a8754]"
                >
                  <option value="">Select lighting &amp; safety...</option>
                  <option value="Safe & Well-Lit">🛡️ Safe, Clean &amp; Well-Lit 24/7</option>
                  <option value="Average / Adequate">👍 Adequate / Standard Parking</option>
                  <option value="Poor / Isolated">⚠️ Dimly Lit / Isolated Location</option>
                </select>
              </div>
            </div>
          </div>

          {/* Photo & Video Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-[#0a8754]" />
                <span>Upload Photos &amp; Videos (Optional)</span>
              </label>
              <span className="text-[10.5px] text-slate-400">
                JPG, PNG, WEBP, MP4 • Max 6 files
              </span>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-[#0a8754] bg-emerald-50/50'
                  : 'border-slate-300 hover:border-[#0a8754] bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-emerald-100/70 text-[#0a8754] flex items-center justify-center mx-auto mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Click or drag &amp; drop photos &amp; videos here
              </p>
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                Share your charger setup, parking bay, and dashboard charging screen
              </p>
            </div>

            {/* Media Thumbnails Preview */}
            {(existingMedia.length > 0 || filePreviews.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                {/* Existing media */}
                {existingMedia.map((media) => (
                  <div key={media._id} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-slate-900">
                    {media.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                        <Video className="w-6 h-6 text-amber-400" />
                      </div>
                    ) : (
                      <img src={media.url} alt="Media" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingMedia(media._id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-80 hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Newly selected files */}
                {filePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-emerald-300 bg-slate-900 shadow-2xs">
                    {preview.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                        <Video className="w-6 h-6 text-emerald-400" />
                      </div>
                    ) : (
                      <img src={preview.previewUrl} alt={preview.name} className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#0a8754] hover:bg-[#087346] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading &amp; Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

