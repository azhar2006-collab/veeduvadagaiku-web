import React from 'react';

interface PreloaderProps {
  fadeOut?: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ fadeOut = false }) => {
  return (
    <div
      className={`fixed inset-0 z-[99999] bg-white flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center p-6">
        <img
          src="/logo-full.png"
          alt="Veedu Vadagaiku"
          className="w-64 max-w-[78vw] h-auto object-contain animate-pulse"
        />
      </div>
    </div>
  );
};

export default Preloader;
