import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, ArrowRight, CheckCircle2, Flame, Clock } from 'lucide-react';
import { getDeepavaliOffer, isOfferActive } from '../../config/offersConfig';

const SESSION_STORAGE_KEY = 'vv_deepavali_offer_dismissed_session';

export const DeepavaliPromotionalPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const offer = getDeepavaliOffer();

  useEffect(() => {
    // 1. Check if offer is active and not expired
    if (!isOfferActive(offer)) {
      return;
    }

    // 2. Check if already dismissed in this browsing session
    const isDismissed = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (isDismissed) {
      return;
    }

    // 3. Smooth entrance delay after homepage mounts
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [offer]);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
  };

  const handleAction = () => {
    handleDismiss();
    navigate(offer.ctaLink || '/owner/properties/add');
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={handleDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1b0610] via-[#240a15] to-[#2d0c1b] text-white rounded-3xl p-6 sm:p-8 border-2 border-[#f59e0b] shadow-2xl shadow-amber-950/40 overflow-hidden animate-scale-up"
      >
        {/* Festive background accents */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-gradient-to-tr from-rose-500/20 to-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button (✕) */}
        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Close promotional offer popup"
          className="absolute top-4 right-4 p-2 rounded-full text-[#edd8de] hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative space-y-5 text-center">
          {/* Festive Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#391121] border border-[#5a1b34] text-[#fcd34d] font-black text-xs uppercase tracking-wider shadow-md">
            <Flame className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>🪔 DEEPAVALI SPECIAL OFFER 🪔</span>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h2
              id="promo-title"
              className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight"
            >
              List your property &amp; services <span className="text-[#f59e0b]">free</span> till Deepavali
            </h2>
            <p className="text-xs sm:text-sm text-[#edd8de] font-medium max-w-md mx-auto">
              தீபாவளி வரை உங்கள் சொத்தையும் சேவைகளையும் இலவசமாக பதிவு செய்யுங்கள்
            </p>
          </div>

          {/* Highlight Cards / Bullet Points */}
          <div className="bg-[#320e1e]/90 border border-[#52192f] rounded-2xl p-4 sm:p-5 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white">
                ₹0 Listing Fee for Houses, Flats, Shops, Halls &amp; Services
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white">
                No Payment or Card Required — Instant Verification
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white">
                Valid Across All Chennai Pincodes for Full 60 Days
              </span>
            </div>
          </div>

          {/* Validity note */}
          <div className="pt-1 flex items-center justify-center gap-2 text-xs sm:text-sm text-[#edd8de] font-semibold">
            <Clock className="w-4 h-4 text-[#f59e0b]" />
            <span>Offer ends Deepavali, 8 Nov 2026</span>
          </div>

          {/* Action Button */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleAction}
              className="w-full py-3.5 px-6 rounded-full bg-[#f59e0b] hover:bg-[#eab308] active:scale-[0.98] text-[#1b0610] font-black text-sm sm:text-base shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-[#1b0610]" />
              <span>Post My Free Listing Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-semibold text-[#edd8de]/70 hover:text-white transition-colors py-1"
            >
              Maybe later, browse rentals first
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Backward compatibility alias
export const NavaratriPromotionalPopup = DeepavaliPromotionalPopup;
