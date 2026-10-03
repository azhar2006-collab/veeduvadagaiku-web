import React, { useState } from 'react';
import { PropertyImage } from '../../types';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PropertyImageGalleryProps {
  images: PropertyImage[];
  title: string;
}

export const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ images, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-400">
        <ImageIcon className="w-12 h-12 mb-2" />
        <p className="text-sm font-medium">No images uploaded for this property</p>
      </div>
    );
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Large Image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-gray-900 shadow-lg group">
        <img
          src={images[selectedIndex]?.imageUrl}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* Counter Badge */}
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-md text-white text-xs font-semibold rounded-full">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-900 flex items-center justify-center shadow-md transition opacity-90 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-900 flex items-center justify-center shadow-md transition opacity-90 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition ${
                selectedIndex === idx
                  ? 'border-orange-600 scale-95 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
