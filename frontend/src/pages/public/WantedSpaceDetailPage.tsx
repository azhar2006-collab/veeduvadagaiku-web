import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, IndianRupee, Maximize2, Calendar, Phone, MessageCircle, Mail, Flag, ArrowLeft, Eye } from 'lucide-react';
import { getWantedSpace } from '../../services/wantedSpace.service';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const CATEGORY_LABELS: Record<string, string> = {
  RESIDENTIAL: 'Houses & Flats',
  ROOMS_ACCOMMODATION: 'PG / Rooms',
  OFFICES: 'Offices',
  SHOPS_RETAIL: 'Shops & Retail',
  INDUSTRIAL: 'Industrial / Godown',
  COMMERCIAL_BUILDINGS: 'Commercial Buildings',
  INSTITUTIONAL: 'Institutional',
  HOSPITALITY: 'Mandapam / Event Halls',
  PARKING_STORAGE: 'Parking & Storage',
  LAND_PLOTS: 'Land & Plots',
  OTHER: 'Other',
};

export default function WantedSpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reported, setReported] = useState(false);

  const { data: space, isLoading, isError } = useQuery({
    queryKey: ['wanted-space', id],
    queryFn: () => getWantedSpace(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !space) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Requirement not found or has been removed.</p>
        <Link to="/wanted-spaces" className="text-amber-600 underline font-medium">← Back to listings</Link>
      </div>
    );
  }

  const catLabel = CATEGORY_LABELS[space.category] || space.category;
  const budget = space.maxRentBudget
    ? `Up to ₹${space.maxRentBudget.toLocaleString('en-IN')}/mo`
    : space.maxLeaseBudget
    ? `Lease up to ₹${space.maxLeaseBudget.toLocaleString('en-IN')}`
    : 'Budget not specified';

  const waLink = space.contactWhatsapp
    ? `https://wa.me/91${space.contactWhatsapp.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
        `Hi, I saw your requirement for "${space.title}" on Veedu Vadagaiku. I have a matching property.`
      )}`
    : null;

  function handleReport() {
    if (!user) {
      toast.error('Please log in to report a listing');
      return;
    }
    setReported(true);
    toast.success('Thank you for reporting. Our team will review this listing.');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0B3B60] text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-400/30 rounded-full px-2.5 py-0.5 font-medium">
              {catLabel}
            </span>
            {space.subcategory && (
              <span className="text-xs text-white/50">{space.subcategory}</span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold">{space.title}</h1>
          <div className="flex items-center gap-1.5 mt-2 text-white/60 text-sm">
            <Eye className="w-3.5 h-3.5" />
            <span>{space.viewCount} views</span>
            <span className="mx-2">·</span>
            <span>Posted {new Date(space.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Key Details */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Requirement Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Detail icon={<MapPin className="w-4 h-4 text-amber-500" />} label="Preferred Location">
              {space.preferredLocality ? `${space.preferredLocality}, ` : ''}{space.preferredCity}
            </Detail>
            <Detail icon={<IndianRupee className="w-4 h-4 text-amber-500" />} label="Budget">
              {budget}
            </Detail>
            {(space.minArea || space.maxArea) && (
              <Detail icon={<Maximize2 className="w-4 h-4 text-amber-500" />} label="Area Required">
                {space.minArea && space.maxArea
                  ? `${space.minArea}–${space.maxArea} sq.ft`
                  : space.maxArea
                  ? `Up to ${space.maxArea} sq.ft`
                  : `From ${space.minArea} sq.ft`}
              </Detail>
            )}
            <Detail label="Requirement Type">{space.requirementType}</Detail>
            <Detail label="Furnishing">{space.furnishingPreference?.replace(/_/g, ' ')}</Detail>
            {space.occupantsCount && (
              <Detail label="Occupants">{space.occupantsCount}</Detail>
            )}
            {space.expectedMoveIn && (
              <Detail icon={<Calendar className="w-4 h-4 text-amber-500" />} label="Move-in Date">
                {new Date(space.expectedMoveIn).toLocaleDateString('en-IN')}
              </Detail>
            )}
          </div>
        </div>

        {/* Amenities */}
        {space.amenities && space.amenities.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-3">Required Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {space.amenities.map((a) => (
                <span key={a} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {space.additionalNotes && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-2">Additional Requirements</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{space.additionalNotes}</p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">
            {space.showContact ? 'Contact Person' : 'Contact Info'}
          </h2>
          {!space.showContact ? (
            <p className="text-sm text-gray-400 italic">Contact info is hidden for this listing.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">{space.contactName}</p>
              <div className="flex flex-wrap gap-3">
                {space.contactPhone && (
                  <a
                    href={`tel:${space.contactPhone}`}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> {space.contactPhone}
                  </a>
                )}
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {space.contactEmail && !space.contactEmail.includes('****') && (
                  <a
                    href={`mailto:${space.contactEmail}`}
                    className="flex items-center gap-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Report */}
        <div className="flex justify-end">
          <button
            onClick={handleReport}
            disabled={reported}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <Flag className="w-3.5 h-3.5" />
            {reported ? 'Reported' : 'Report this listing'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800">{children}</p>
    </div>
  );
}
