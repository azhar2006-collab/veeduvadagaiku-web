import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Maximize2, Sofa, Building2, Store } from 'lucide-react';
import { Property } from '../../types';
import { useFavourites } from '../../hooks/useFavourites';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { isFavourite, toggleFavourite, isPending } = useFavourites();
  const favorited = isFavourite(property.id);

  // Format currency
  const formattedRent = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(property.rent);

  const formattedDeposit = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(property.deposit);

  // Primary image or first image or placeholder
  const primaryImg =
    property.images?.find((img) => img.isPrimary)?.imageUrl ||
    property.images?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';

  const furnishingLabel: Record<string, string> = {
    FURNISHED: 'Furnished',
    SEMI_FURNISHED: 'Semi-Furnished',
    UNFURNISHED: 'Unfurnished',
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={primaryImg}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Type Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/80 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-sm">
          {property.propertyType === 'HOUSE' ? (
            <>
              <Building2 className="w-3.5 h-3.5 text-orange-400" />
              <span>House</span>
            </>
          ) : (
            <>
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Commercial Shop</span>
            </>
          )}
        </div>

        {/* Favourite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavourite(property.id);
          }}
          disabled={isPending}
          aria-label="Save Property"
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            favorited
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-white/80 text-gray-700 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Rent Tag */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-orange-600/95 backdrop-blur-md text-white rounded-lg shadow-md">
          <div className="text-base font-extrabold leading-none">{formattedRent}</div>
          <span className="text-[10px] font-medium text-orange-100">/ month</span>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Locality */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{property.locality}, Chennai</span>
        </div>

        {/* Title */}
        <Link to={`/property/${property.id}`}>
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1 group-hover:text-orange-600 transition">
            {property.title}
          </h3>
        </Link>

        {/* Features row */}
        <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-gray-100 text-gray-600 text-xs">
          {property.propertyType === 'HOUSE' ? (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{property.bedrooms ? `${property.bedrooms} BHK` : '1 Room'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{property.rooms ? `${property.rooms} Rooms` : 'Shop Space'}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{property.propertySize} sq.ft</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Sofa className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{furnishingLabel[property.furnishing] || 'Unfurnished'}</span>
          </div>
        </div>

        {/* Deposit & View details action */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div>
            <span className="text-[11px] text-gray-400 block">Deposit</span>
            <span className="text-xs font-semibold text-gray-700">{formattedDeposit}</span>
          </div>

          <Link
            to={`/property/${property.id}`}
            className="px-4 py-2 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-bold text-xs rounded-xl transition-all"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
