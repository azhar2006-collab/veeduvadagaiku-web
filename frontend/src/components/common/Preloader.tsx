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
          src="/logo.png"
          alt="Veedu Vadagaikku Chennai"
          className="w-56 sm:w-72 max-w-[85vw] h-auto object-contain rounded-2xl drop-shadow-xl animate-pulse"
        />
      </div>
    </div>
  );
};

export default Preloader;
