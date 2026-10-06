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
      className={`inline-flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 shadow-inner ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
          lang === 'en'
            ? 'bg-[#0B2545] text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLang('ta')}
        className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
          lang === 'ta'
            ? 'bg-[#C59B27] text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        தமிழ்
      </button>
    </div>
  );
};
