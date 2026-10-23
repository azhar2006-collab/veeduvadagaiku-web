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
          src="/logo-circle.png"
          alt="Veedu Vadagaikku Chennai"
          className="w-36 h-36 sm:w-44 sm:h-44 max-w-[70vw] object-contain rounded-full drop-shadow-xl animate-pulse"
        />
      </div>
    </div>
  );
};

export default Preloader;
