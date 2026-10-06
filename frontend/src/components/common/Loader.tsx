import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', fullScreen = false, text }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  const content = (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses} border-orange-500 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="mt-3 text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <img
          src="/logo-full.png"
          alt="Loading..."
          className="w-60 max-w-[78vw] h-auto object-contain animate-pulse"
        />
        {text && <p className="mt-4 text-xs font-medium text-gray-500 tracking-wide">{text}</p>}
      </div>
    );
  }

  return content;
};
