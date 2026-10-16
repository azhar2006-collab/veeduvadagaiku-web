import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, ArrowRight, CheckCircle2, Gift } from 'lucide-react';
import { getNavaratriOffer, isOfferActive } from '../../config/offersConfig';

const SESSION_STORAGE_KEY = 'vv_navaratri_offer_dismissed_session';

export const NavaratriPromotionalPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const offer = getNavaratriOffer();

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={handleDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-gradient-to-b from-[#FFFDF9] via-white to-[#FAF6ED] rounded-3xl p-6 sm:p-8 border-2 border-[#D4AF37]/50 shadow-2xl shadow-orange-950/25 overflow-hidden animate-scale-up"
      >
        {/* Festive background accents */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-amber-300/30 to-orange-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-gradient-to-tr from-red-400/20 to-amber-300/30 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button (✕) */}
        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Close promotional offer popup"
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative space-y-5 text-center">
          {/* Festive Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-orange-500/25">
            <span>🎉 NAVARATRI SPECIAL OFFER 🎉</span>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h2
              id="promo-title"
              className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight"
            >
              Grab the Opportunity!
            </h2>
            <p className="text-sm sm:text-base text-gray-700 font-semibold max-w-md mx-auto">
              Post your property for <span className="text-emerald-600 font-black">FREE</span> during this Navaratri season!
            </p>
          </div>

          {/* Highlight Cards / Bullet Points */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-900">
                ₹0 Posting Fee
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-900">
                No Payment Required to Post a Property
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-900">
                Limited-Time Festive Offer
              </span>
            </div>
          </div>

          {/* Validity note */}
          <div className="pt-1">
            <p className="text-xs sm:text-sm font-bold text-amber-800">
              Offer valid until the end of Navaratri.
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {offer.expiryDisplay}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleAction}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 active:scale-[0.98] text-white font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Post Your Property for FREE</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              Maybe later, browse rentals first
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
