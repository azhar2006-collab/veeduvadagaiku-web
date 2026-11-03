import React from 'react';
import { X, Lock, ShieldCheck, Phone } from 'lucide-react';
import { PhoneOTPForm } from './PhoneOTPForm';
import { useLanguage } from '../../context/LanguageContext';

interface PhoneLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
}

export const PhoneLoginModal: React.FC<PhoneLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { lang, t } = useLanguage();

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EFE8D8] space-y-6 animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-[#FAF6ED] transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FCFAF5] text-[#C5A059] border border-[#E8DFC8] flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            {lang === 'ta'
              ? 'மொபைல் எண் மூலம் உள்நுழைக'
              : 'Login with Mobile Number'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {lang === 'ta'
              ? 'உரிமையாளரின் தொலைபேசி எண்ணைப் பார்க்க உங்கள் மொபைல் எண்ணை உள்ளிட்டு உள்நுழையவும் (நேரடி உரிமையாளர் தொடர்பு).'
              : 'Sign in with your mobile number to view the landlord’s phone number & connect directly with verified owners.'}
          </p>
        </div>

        {/* Phone OTP Form */}
        <div className="bg-[#FCFAF5] p-4 sm:p-5 rounded-2xl border border-[#EFE8D8]">
          <PhoneOTPForm
            role="USER"
            containerId="recaptcha-modal-container"
            onSuccess={handleSuccess}
          />
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
          <span>
            {lang === 'ta'
              ? 'சரிபார்க்கப்பட்ட பாதுகாப்பான உள்நுழைவு'
              : '100% Secure & Verified Phone Login'}
          </span>
        </div>
      </div>
    </div>
  );
};
