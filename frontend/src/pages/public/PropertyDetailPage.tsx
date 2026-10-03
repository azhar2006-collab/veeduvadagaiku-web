import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Building2,
  Store,
  Calendar,
  Maximize2,
  Bed,
  Sofa,
  CheckCircle,
  ShieldCheck,
  Send,
  User,
  Eye,
} from 'lucide-react';
import { useProperty } from '../../hooks/useProperties';
import { useFavourites } from '../../hooks/useFavourites';
import { useCreateEnquiry } from '../../hooks/useEnquiries';
import { useAuth } from '../../hooks/useAuth';
import { PropertyImageGallery } from '../../components/property/PropertyImageGallery';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import toast from 'react-hot-toast';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: propRes, isLoading, error } = useProperty(id || '');
  const property = propRes?.data;

  const { isFavourite, toggleFavourite, isPending: favPending } = useFavourites();
  const { isAuthenticated } = useAuth();
  const createEnquiryMutation = useCreateEnquiry();

  // Enquiry modal / form state
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return <Loader fullScreen text="Loading property details..." />;
  }

  if (error || !property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
        <p className="text-gray-500 mb-6">
          This listing might have been rented out, removed, or is awaiting verification.
        </p>
        <Link
          to="/properties"
          className="inline-flex px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl"
        >
          Browse Other Chennai Properties
        </Link>
      </div>
    );
  }

  const favorited = isFavourite(property.id);

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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this rental property in ${property.locality}, Chennai on Veedu Vadagaiku:`,
          url,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Property link copied to clipboard!');
    }
  };

  const handleSendEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to send an enquiry');
      return;
    }
    if (!enquiryMessage.trim()) {
      toast.error('Please enter your enquiry message');
      return;
    }

    createEnquiryMutation.mutate(
      {
        propertyId: property.id,
        message: enquiryMessage.trim(),
        phone: enquiryPhone.trim() || undefined,
      },
      {
        onSuccess: () => {
          setEnquiryMessage('');
          setEnquiryPhone('');
          setIsModalOpen(false);
        },
      }
    );
  };

  const ownerPhone = property.owner?.user?.mobile || '';
  const cleanPhone = ownerPhone.replace(/\D/g, '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SEOHead
        title={`${property.title} in ${property.locality}, Chennai | Veedu Vadagaiku`}
        description={`${property.propertyType === 'HOUSE' ? 'House' : 'Shop'} for rent in ${
          property.locality
        }, Chennai. Rent: ${formattedRent}/month. Direct owner contact.`}
        image={property.images?.[0]?.imageUrl}
      />

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Link to="/" className="hover:text-orange-600">Home</Link>
          <span>/</span>
          <Link
            to={property.propertyType === 'HOUSE' ? '/houses' : '/shops'}
            className="hover:text-orange-600"
          >
            {property.propertyType === 'HOUSE' ? 'Houses' : 'Shops'}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-xs">{property.locality}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={() => toggleFavourite(property.id)}
            disabled={favPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
              favorited
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
            <span>{favorited ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Images Gallery */}
      <PropertyImageGallery images={property.images} title={property.title} />

      {/* Main 2-Column Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Property Specs, Details & Amenities */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-orange-100 text-orange-800">
                {property.propertyType === 'HOUSE' ? (
                  <>
                    <Building2 className="w-3.5 h-3.5" />
                    Residential House
                  </>
                ) : (
                  <>
                    <Store className="w-3.5 h-3.5" />
                    Commercial Shop
                  </>
                )}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Verified
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-gray-400 ml-auto">
                <Eye className="w-3.5 h-3.5" />
                {property.viewCount} views
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <span>{property.locality}, Chennai, Tamil Nadu</span>
            </div>
          </div>

          {/* Quick Highlights Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <Maximize2 className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Super Built-up</p>
              <p className="text-sm font-black text-gray-900">{property.propertySize} sq.ft</p>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                {property.propertyType === 'HOUSE' ? <Bed className="w-4 h-4" /> : <Store className="w-4 h-4" />}
              </div>
              <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                {property.propertyType === 'HOUSE' ? 'Bedrooms' : 'Rooms'}
              </p>
              <p className="text-sm font-black text-gray-900">
                {property.propertyType === 'HOUSE'
                  ? `${property.bedrooms || 1} BHK`
                  : `${property.rooms || 1} Rooms`}
              </p>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <Sofa className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Furnishing</p>
              <p className="text-sm font-black text-gray-900 capitalize">
                {property.furnishing.replace('_', ' ').toLowerCase()}
              </p>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Available From</p>
              <p className="text-sm font-black text-gray-900">
                {new Date(property.availability).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-lg font-black text-gray-900">About this Property</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities & Features */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-gray-900">Amenities & Highlights</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl text-xs font-semibold text-gray-800"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Address */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-2">
            <h3 className="text-lg font-black text-gray-900">Location Address</h3>
            <p className="text-sm text-gray-600 font-medium">{property.address}</p>
          </div>
        </div>

        {/* Right Sticky Card: Rent Details & Owner Actions */}
        <div className="lg:col-span-1 sticky top-24 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-6">
            {/* Rent Pricing Block */}
            <div className="pb-6 border-b border-gray-100 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-gray-900 tracking-tight">
                    {formattedRent}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold ml-1">/ month</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Security Deposit</span>
                <span className="font-bold text-gray-800">{formattedDeposit}</span>
              </div>
            </div>

            {/* Owner Profile Card */}
            <div className="flex items-center gap-3 p-3.5 bg-orange-50/60 rounded-2xl border border-orange-100">
              <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                {property.owner?.user?.name?.charAt(0) || <User className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-gray-900 truncate">
                  {property.owner?.user?.name || 'Chennai Property Owner'}
                </h4>
                <p className="text-xs text-orange-700 font-medium">Verified Owner</p>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="space-y-3">
              {/* WhatsApp Button */}
              {property.contactWhatsapp && cleanPhone && (
                <a
                  href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(
                    `Hi, I found your property listing on Veedu Vadagaiku: "${property.title}" in ${property.locality}. Is it still available for rent?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              {/* Call Owner Button */}
              {property.contactPhone && cleanPhone && (
                <a
                  href={`tel:+91${cleanPhone.slice(-10)}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-orange-600/20 transition active:scale-95"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Landlord</span>
                </a>
              )}

              {/* Send Enquiry Button */}
              {property.contactEnquiry && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-900 hover:bg-black text-white font-extrabold text-sm rounded-xl shadow-sm transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Direct Enquiry</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-gray-400 text-center leading-normal">
              Zero brokerage fee for tenants. Connect directly with landlords.
            </p>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900">Send Enquiry to Owner</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEnquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Your Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Hi, I am interested in renting this property. Please let me know when I can visit."
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="Your mobile number"
                  value={enquiryPhone}
                  onChange={(e) => setEnquiryPhone(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEnquiryMutation.isPending}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {createEnquiryMutation.isPending ? 'Sending...' : 'Submit Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
