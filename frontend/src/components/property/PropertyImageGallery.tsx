import React, { useState } from 'react';
import { PropertyImage } from '../../types';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Building2 } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

interface PropertyImageGalleryProps {
  images: PropertyImage[];
  title: string;
  propertyType?: string;
  propertyId?: string;
}

export const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
  images,
  title,
  propertyType,
  propertyId,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter out any default stock photos — only show real uploaded images
  const validImages = (images || []).filter(
    (img) => img.imageUrl && !img.imageUrl.includes('indian-properties')
  );

  if (validImages.length === 0) {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF7F0] to-[#EFE8D8] border border-[#E8DFC8] flex flex-col items-center justify-center text-gray-400 p-6 text-center">
        <Building2 className="w-12 h-12 text-[#C5A059]/40 mb-2" />
        <span className="text-sm font-bold text-[#8C7647]">Verified Listing</span>
        <span className="text-xs text-gray-400 mt-1">{title}</span>
      </div>
    );
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const activeUrl = getImageUrl(validImages[selectedIndex]?.imageUrl);

  return (
    <div className="space-y-4">
      {/* Main Large Image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-gray-950 shadow-lg group flex items-center justify-center">
        {/* Ambient Blur Backdrop */}
        {activeUrl && (
          <img
            src={activeUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none select-none"
          />
        )}
        <img
          src={activeUrl}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          className="relative z-10 w-full h-full object-contain p-2 max-h-[560px] transition-all duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />

        {/* Counter Badge */}
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1 bg-black/70 backdrop-blur-md text-white text-xs font-semibold rounded-full">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-900 flex items-center justify-center shadow-md transition opacity-90 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-900 flex items-center justify-center shadow-md transition opacity-90 group-hover:opacity-100"
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
          {images.map((img, idx) => {
            const thumbUrl = getImageUrl(img.imageUrl);
            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition ${
                  selectedIndex === idx
                    ? 'border-orange-600 scale-95 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <div className="relative w-full h-full bg-gray-950 flex items-center justify-center">
                  <img
                    src={thumbUrl}
                    alt=""
                    className="w-full h-full object-contain p-0.5"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
