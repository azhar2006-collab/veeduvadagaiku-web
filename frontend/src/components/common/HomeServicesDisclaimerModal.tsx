import React, { useEffect, useRef } from 'react';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeServicesDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HomeServicesDisclaimerModal: React.FC<HomeServicesDisclaimerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus primary button for accessibility
    setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Support Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-services-disclaimer-heading"
      aria-describedby="home-services-disclaimer-body"
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#E8DFC8] shadow-2xl space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto"
      >
        {/* Visible Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-[#FAF4E6] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon / Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E2B4D] to-[#0F172A] text-[#D4AF37] border border-[#E8DFC8] flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-6 h-6 text-[#C5A059]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF4E6] border border-[#E8DFC8] text-[#9A7818] text-[11px] font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Platform Notice</span>
            </div>
            <h2
              id="home-services-disclaimer-heading"
              className="text-xl sm:text-2xl font-extrabold text-[#1E2329] tracking-tight mt-0.5"
            >
              Welcome to VeeduVadagaikkuChennai!
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div
          id="home-services-disclaimer-body"
          className="space-y-3.5 text-xs sm:text-sm text-gray-600 leading-relaxed bg-[#FCFAF6] p-4 sm:p-5 rounded-2xl border border-[#EFE8D8]"
        >
          <p>
            VeeduVadagaikkuChennai is a platform that helps customers discover and connect with independent
            home service providers, workers, and service owners.
          </p>
          <p>
            We act as a connecting platform, helping customers find the right professionals for
            their needs. The actual services are provided by the respective service providers, who
            are responsible for carrying out the work.
          </p>
          <p className="font-semibold text-gray-800">
            Please confirm the service details, pricing, availability, and other relevant terms
            directly with the service provider before proceeding.
          </p>
          <p className="text-[#9A7818] font-bold">
            Our goal is simple: to connect customers with the right people for their home needs!
          </p>
        </div>

        {/* Link to Full Terms Disclaimer */}
        <div className="text-center text-[11px] text-gray-500">
          For full details, please review our{' '}
          <Link
            to="/terms"
            onClick={onClose}
            className="text-[#9A7818] hover:text-[#C5A059] font-bold underline transition"
          >
            Home Services Platform Disclaimer
          </Link>
          .
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            ref={primaryButtonRef}
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:brightness-105 active:scale-98 transition text-center cursor-pointer"
          >
            I Understand
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-5 bg-white border-2 border-[#C5A059] text-[#9A7818] hover:bg-[#FAF4E6] font-bold rounded-xl text-xs sm:text-sm transition text-center cursor-pointer"
          >
            Explore Services
          </button>
        </div>
      </div>
    </div>
  );
};
