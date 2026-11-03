import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full bg-[#FAF7F0] border border-[#E8DFC8] shadow-xs ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
          lang === 'en'
            ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-xs'
            : 'text-gray-600 hover:text-gray-900 hover:bg-[#F3ECE0]'
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLang('ta')}
        className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
          lang === 'ta'
            ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-xs'
            : 'text-gray-600 hover:text-gray-900 hover:bg-[#F3ECE0]'
        }`}
      >
        தமிழ்
      </button>
    </div>
  );
};
