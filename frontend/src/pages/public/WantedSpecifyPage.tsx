import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createWantedSpace } from '../../services/wantedSpace.service';
import { CHENNAI_LOCALITIES } from '../../utils/chennaiLocalities';
import toast from 'react-hot-toast';
import {
  Search,
  MapPin,
  Building,
  Home,
  CheckCircle2,
  ChevronDown,
  Layers,
  Users,
  Car,
  Sofa,
  Sparkles,
  Phone,
  MessageSquare,
  ArrowRight,
  Info,
  Maximize2,
  IndianRupee,
  X,
} from 'lucide-react';

// ─── 1. Property Type Options ──────────────────────────────────────────────────

export interface PropertyTypeOption {
  value: string;
  label: string;
  category: string;
  subcategory: string;
  group: 'Residential' | 'Rooms & Hostels' | 'Commercial & Retail' | 'Offices & Corporate' | 'Industrial & Land';
  isResidentialTier: boolean;
}

export const PROPERTY_TYPES: PropertyTypeOption[] = [
  { value: 'Independent House', label: 'Independent House', category: 'RESIDENTIAL', subcategory: 'Independent house', group: 'Residential', isResidentialTier: true },
  { value: 'Apartment / Flat', label: 'Apartment / Flat', category: 'RESIDENTIAL', subcategory: 'Apartment / Flat', group: 'Residential', isResidentialTier: true },
  { value: 'Bachelor Room', label: 'Bachelor Room', category: 'ROOMS_ACCOMMODATION', subcategory: 'Single room', group: 'Rooms & Hostels', isResidentialTier: true },
  { value: 'PG Accommodation', label: 'PG Accommodation', category: 'ROOMS_ACCOMMODATION', subcategory: 'Hostel', group: 'Rooms & Hostels', isResidentialTier: true },
  { value: 'Shared Room', label: 'Shared Room', category: 'ROOMS_ACCOMMODATION', subcategory: 'Shared room', group: 'Rooms & Hostels', isResidentialTier: true },
  { value: 'Commercial Shop', label: 'Commercial Shop', category: 'SHOPS_RETAIL', subcategory: 'Shop', group: 'Commercial & Retail', isResidentialTier: false },
  { value: 'Office Space', label: 'Office Space', category: 'OFFICES', subcategory: 'Office space', group: 'Offices & Corporate', isResidentialTier: false },
  { value: 'Warehouse / Godown', label: 'Warehouse / Godown', category: 'INDUSTRIAL', subcategory: 'Godown', group: 'Industrial & Land', isResidentialTier: false },
  { value: 'Showroom', label: 'Showroom', category: 'SHOPS_RETAIL', subcategory: 'Showroom', group: 'Commercial & Retail', isResidentialTier: false },
  { value: 'Industrial Space', label: 'Industrial Space', category: 'INDUSTRIAL', subcategory: 'Factory shed', group: 'Industrial & Land', isResidentialTier: false },
  { value: 'Land / Plot', label: 'Land / Plot', category: 'LAND_PLOTS', subcategory: 'Open plot', group: 'Industrial & Land', isResidentialTier: false },
  { value: 'Building for Rent', label: 'Building for Rent', category: 'COMMERCIAL_BUILDINGS', subcategory: 'Commercial Buildings', group: 'Commercial & Retail', isResidentialTier: false },
  { value: 'Other', label: 'Other', category: 'OTHER', subcategory: 'Other', group: 'Industrial & Land', isResidentialTier: false },
];

// ─── 2. Category Cards (Header Visuals) ────────────────────────────────────────

const RESIDENTIAL_CATEGORIES = [
  {
    key: 'RESIDENTIAL',
    title: 'Houses & Flats',
    titleTa: 'வீடு · அடுக்குமாடி',
    pills: ['1 BHK', '2 BHK', '3 BHK', '4 BHK & above', 'Independent house', 'Independent floor', 'Villa'],
  },
  {
    key: 'ROOMS_ACCOMMODATION',
    title: 'PG, Hostels & Rooms',
    titleTa: 'விடுதி · அறை',
    pills: ['PG for men', 'PG for women', 'Hostel', 'Single room', 'Shared room', 'Flatmates'],
  },
];

const COMMERCIAL_CATEGORIES = [
  {
    key: 'SHOPS_RETAIL',
    title: 'Shops & Commercial',
    titleTa: 'கடை, வணிக இடம்',
    pills: ['Shop', 'Showroom', 'Office space', 'Clinic', 'Restaurant space', 'Co-working'],
  },
  {
    key: 'INDUSTRIAL',
    title: 'Godown & Industrial',
    titleTa: 'கிடங்கு · தொழிற்சாலை',
    pills: ['Godown', 'Warehouse', 'Factory shed', 'Workshop'],
  },
  {
    key: 'HOSPITALITY',
    title: 'Mandapam & Event Halls',
    titleTa: 'கல்யாண மண்டபம் · அரங்கம்',
    pills: ['Kalyana mandapam', 'Convention hall', 'Party hall', 'Meeting hall'],
  },
  {
    key: 'LAND_PLOTS',
    title: 'Land & Other Spaces',
    titleTa: 'நிலம் · மற்ற இடங்கள்',
    pills: ['Open plot', 'Parking space', 'Farm house', 'Terrace / hoarding space', 'Any other space'],
  },
];

// ─── 3. Floor Options ──────────────────────────────────────────────────────────

const FLOOR_OPTIONS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor or Above',
  'Any Floor',
];

// ─── 4. Rotating Textarea Placeholders ────────────────────────────────────────

const ROTATING_PLACEHOLDERS = [
  'Looking for a 2BHK independent house with parking facilities...',
  'Need a bachelor-friendly room for 3 working professionals...',
  'Looking for a 300 sq. ft. shop with road-facing access...',
  'Need an office space with 10–15 workstations...',
  'Looking for a warehouse with loading and unloading facilities...',
  'Prefer a furnished property with lift and parking...',
];

const QUICK_DESCRIPTION_CHIPS = [
  'Looking for immediate move-in',
  'Car parking is essential',
  'Need lift access',
  'Family with school-going kids',
  'Bachelor-friendly',
  'Road-facing shop preferred',
  'Good water supply required',
  'Ground floor preferred',
];

// ─── 5. Amenities List ─────────────────────────────────────────────────────────

const AMENITY_OPTIONS = [
  'Lift',
  '24x7 Security',
  'Water Supply',
  'Power Backup',
  'Car Parking',
  'Bike Parking',
  'Near Metro or Bus Stand',
  'Pet Friendly',
  'Road Facing',
  'Loading / Unloading Area',
  'Air Conditioning',
  'CCTV Surveillance',
];

export default function WantedSpecifyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core Form State
  const [propertyType, setPropertyType] = useState<string>('Apartment / Flat');
  const [title, setTitle] = useState<string>('');
  const [preferredLocality, setPreferredLocality] = useState<string>('');
  const [cityArea, setCityArea] = useState<string>('Chennai');
  const [preferredFloor, setPreferredFloor] = useState<string>('Any Floor');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');
  const [minBudget, setMinBudget] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Additional Preferences
  const [furnishing, setFurnishing] = useState<string>('Any');
  const [parking, setParking] = useState<string>('Required');
  const [occupants, setOccupants] = useState<string>('3');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Water Supply',
    'Car Parking',
  ]);

  // Contact Information
  const [contactName, setContactName] = useState<string>(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState<string>(user?.mobile || '');
  const [whatsappNumber, setWhatsappNumber] = useState<string>(user?.mobile || '');
  const [sameAsMobile, setSameAsMobile] = useState<boolean>(true);

  // UI state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localityQuery, setLocalityQuery] = useState<string>('');
  const [showLocalityDropdown, setShowLocalityDropdown] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState<number>(0);
  const [submittedSpace, setSubmittedSpace] = useState<any>(null);

  const localityDropdownRef = useRef<HTMLDivElement>(null);

  // Sync user info when available
  useEffect(() => {
    if (user?.name && !contactName) setContactName(user.name);
    if (user?.mobile && !mobileNumber) {
      setMobileNumber(user.mobile);
      if (sameAsMobile) setWhatsappNumber(user.mobile);
    }
  }, [user]);

  // Rotate textarea placeholder smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Sync WhatsApp number when "sameAsMobile" is checked
  useEffect(() => {
    if (sameAsMobile) {
      setWhatsappNumber(mobileNumber);
    }
  }, [mobileNumber, sameAsMobile]);

  // Close locality dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (localityDropdownRef.current && !localityDropdownRef.current.contains(e.target as Node)) {
        setShowLocalityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter localities
  const filteredLocalities = CHENNAI_LOCALITIES.filter((loc) =>
    loc.toLowerCase().includes(localityQuery.toLowerCase())
  ).slice(0, 15);

  const currentPropTypeObj =
    PROPERTY_TYPES.find((pt) => pt.value === propertyType) || PROPERTY_TYPES[0];

  // Dynamic checks for property type
  const isResidentialType = [
    'Independent House',
    'Apartment / Flat',
    'Bachelor Room',
    'PG Accommodation',
    'Shared Room',
  ].includes(propertyType);

  const isRoomOrPG = ['Bachelor Room', 'PG Accommodation', 'Shared Room'].includes(propertyType);
  const isLand = propertyType === 'Land / Plot';

  // Toggle amenities
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Add chip to textarea
  const appendChipToDescription = (chipText: string) => {
    setDescription((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return chipText + '.';
      if (trimmed.includes(chipText)) return prev;
      return `${trimmed}\n• ${chipText}.`;
    });
  };

  // Helper when clicking a top category pill
  const handlePillClick = (catKey: string, pill: string) => {
    // Attempt matching with property type
    const matched = PROPERTY_TYPES.find(
      (pt) =>
        pt.subcategory.toLowerCase() === pill.toLowerCase() ||
        pt.value.toLowerCase().includes(pill.toLowerCase())
    );
    if (matched) {
      setPropertyType(matched.value);
    } else {
      // Find based on category
      const fallback = PROPERTY_TYPES.find((pt) => pt.category === catKey);
      if (fallback) setPropertyType(fallback.value);
    }

    // Auto update title if empty
    if (!title) {
      setTitle(`Looking for ${pill} in Chennai`);
    }

    // Smooth scroll down to form
    const formElement = document.getElementById('requirement-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!propertyType) {
      newErrors.propertyType = 'Please select what property type you are looking for.';
    }

    if (!preferredLocality && !localityQuery.trim()) {
      newErrors.preferredLocality = 'Please select or enter your preferred locality.';
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
    }

    if (!contactName.trim()) {
      newErrors.contactName = 'Please enter your full name.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in the required fields highlighted below.');
      return;
    }

    if (!user) {
      // Save state in localStorage so the user won't lose typed form
      try {
        localStorage.setItem(
          'vv_temp_wanted_req',
          JSON.stringify({
            propertyType,
            title,
            preferredLocality: preferredLocality || localityQuery.trim(),
            cityArea,
            preferredFloor,
            minArea,
            maxArea,
            minBudget,
            maxBudget,
            description,
            furnishing,
            parking,
            occupants,
            selectedAmenities,
            contactName,
            mobileNumber,
            whatsappNumber,
          })
        );
      } catch (_) {}

      toast.error('Please log in or create an account to post your requirement.');
      navigate('/login', { state: { from: '/wanted-spaces/specify' } });
      return;
    }

    const localityFinal = preferredLocality || localityQuery.trim() || 'Chennai';
    const computedTitle =
      title.trim() ||
      `${propertyType} Required in ${localityFinal.split('-')[0].trim()}`;

    // Map furnishing
    const furnishingMap: Record<string, string> = {
      Furnished: 'FULLY_FURNISHED',
      'Semi-Furnished': 'SEMI_FURNISHED',
      Unfurnished: 'UNFURNISHED',
      Any: 'ANY',
    };

    const payload = {
      title: computedTitle,
      category: currentPropTypeObj.category,
      subcategory: propertyType,
      preferredCity: cityArea.trim() || 'Chennai',
      preferredLocality: localityFinal,
      minArea: minArea ? parseFloat(minArea) : undefined,
      maxArea: maxArea ? parseFloat(maxArea) : undefined,
      maxRentBudget: maxBudget ? parseFloat(maxBudget) : undefined,
      minRentBudget: minBudget ? parseFloat(minBudget) : undefined,
      occupantsCount: isResidentialType && occupants ? parseInt(occupants) : undefined,
      amenities: selectedAmenities,
      furnishingPreference: furnishingMap[furnishing] || 'ANY',
      additionalNotes: description.trim() || undefined,
      contactName: contactName.trim(),
      contactPhone: mobileNumber.trim(),
      contactWhatsapp: (sameAsMobile ? mobileNumber : whatsappNumber).trim(),
      contactMethod: 'phone',
      showContact: true,
      categoryExtras: {
        propertyType,
        preferredFloor: isLand ? 'Not Applicable' : preferredFloor,
        parkingRequired: parking,
        minBudget: minBudget ? parseFloat(minBudget) : undefined,
        maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
        cityArea: cityArea.trim(),
      },
    };

    setSubmitting(true);
    try {
      const created = await createWantedSpace(payload as any);
      setSubmittedSpace(created);
      toast.success('Your requirement has been posted successfully!');
      try {
        localStorage.removeItem('vv_temp_wanted_req');
      } catch (_) {}
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to submit requirement. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-gray-900">
      {/* ── Top Header ── */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100/70 px-2.5 py-0.5 rounded-full">
            தேவை · REQUIREMENTS
          </span>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
            Zero Brokerage · Free to Post
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          Wanted – Specify
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
          Looking for any space for rental or lease in Chennai? Specify your choice below and let
          property owners connect with you directly.
        </p>
      </div>

      {/* ── Visual Category Cards Grid ── */}
      <div className="max-w-5xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-3.5">
          {RESIDENTIAL_CATEGORIES.map((cat) => (
            <VisualCategoryCard
              key={cat.key}
              cat={cat}
              isSelectedCategory={currentPropTypeObj.category === cat.key}
              onPillClick={(pill) => handlePillClick(cat.key, pill)}
            />
          ))}
          <div className="hidden md:flex items-center justify-center p-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 text-center">
            <div>
              <Sparkles className="w-6 h-6 text-amber-600 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-amber-900">Direct Owner Connect</p>
              <p className="text-[11px] text-gray-500">Owners matching your specs will contact you</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {COMMERCIAL_CATEGORIES.map((cat) => (
            <VisualCategoryCard
              key={cat.key}
              cat={cat}
              isSelectedCategory={currentPropTypeObj.category === cat.key}
              onPillClick={(pill) => handlePillClick(cat.key, pill)}
            />
          ))}
        </div>
      </div>

      {/* ── Requirement Form Section ── */}
      <section
        id="requirement-form-section"
        className="bg-[#2D0A18] text-white pt-10 pb-16 px-4 shadow-xl relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto">
          {/* Section Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Step 2 · Fill in your specifications</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tell us what you need · உங்கள் தேவையைக் குறிப்பிடுங்கள்
            </h2>
            <p className="text-white/70 text-sm mt-1 max-w-2xl">
              Select property type, location, preferred floor, and budget. You can describe your
              exact requirements in your own words.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* ── BLOCK 1: What Are You Looking For & Title ── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Property Type Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wide mb-1.5">
                    What are you looking for? <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className={`w-full bg-[#1F0711] border ${
                        errors.propertyType ? 'border-red-400' : 'border-white/25'
                      } text-white rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors pr-10`}
                    >
                      <optgroup label="Residential Properties" className="bg-[#1F0711] text-white">
                        <option value="Independent House">Independent House</option>
                        <option value="Apartment / Flat">Apartment / Flat</option>
                      </optgroup>
                      <optgroup label="Rooms & Hostels" className="bg-[#1F0711] text-white">
                        <option value="Bachelor Room">Bachelor Room</option>
                        <option value="PG Accommodation">PG Accommodation</option>
                        <option value="Shared Room">Shared Room</option>
                      </optgroup>
                      <optgroup label="Commercial & Retail" className="bg-[#1F0711] text-white">
                        <option value="Commercial Shop">Commercial Shop</option>
                        <option value="Office Space">Office Space</option>
                        <option value="Showroom">Showroom</option>
                        <option value="Building for Rent">Building for Rent</option>
                      </optgroup>
                      <optgroup label="Industrial & Land" className="bg-[#1F0711] text-white">
                        <option value="Warehouse / Godown">Warehouse / Godown</option>
                        <option value="Industrial Space">Industrial Space</option>
                        <option value="Land / Plot">Land / Plot</option>
                        <option value="Other">Other</option>
                      </optgroup>
                    </select>
                    <ChevronDown className="w-4 h-4 text-white/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.propertyType && (
                    <p className="text-red-300 text-xs mt-1.5">{errors.propertyType}</p>
                  )}
                </div>

                {/* Requirement Title */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wide mb-1.5">
                    Give Your Requirement a Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 2BHK House Required in Anna Nagar"
                    className="w-full bg-[#1F0711] border border-white/25 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                  <p className="text-white/40 text-[11px] mt-1">
                    Leave blank to auto-create from your chosen property type and locality.
                  </p>
                </div>
              </div>
            </div>

            {/* ── BLOCK 2: Location & Space Details ── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-5">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Location & Space Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Searchable Preferred Locality */}
                <div className="relative" ref={localityDropdownRef}>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Preferred Locality in Chennai <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={preferredLocality || localityQuery}
                      onChange={(e) => {
                        setPreferredLocality('');
                        setLocalityQuery(e.target.value);
                        setShowLocalityDropdown(true);
                      }}
                      onFocus={() => setShowLocalityDropdown(true)}
                      placeholder="Search or enter area (e.g. Velachery, Anna Nagar)"
                      className={`w-full bg-[#1F0711] border ${
                        errors.preferredLocality ? 'border-red-400' : 'border-white/25'
                      } text-white placeholder-white/40 rounded-xl pl-10 pr-9 py-3 text-sm focus:outline-none focus:border-amber-400`}
                    />
                    <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {(preferredLocality || localityQuery) && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreferredLocality('');
                          setLocalityQuery('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {errors.preferredLocality && (
                    <p className="text-red-300 text-xs mt-1.5">{errors.preferredLocality}</p>
                  )}

                  {/* Locality Autocomplete Dropdown */}
                  {showLocalityDropdown && (
                    <div className="absolute z-30 left-0 right-0 mt-1.5 bg-[#1F0711] border border-amber-500/40 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-white/5">
                      {filteredLocalities.length > 0 ? (
                        filteredLocalities.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setPreferredLocality(loc);
                              setLocalityQuery('');
                              setShowLocalityDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-white/90 hover:bg-amber-500/20 hover:text-amber-200 transition-colors flex items-center justify-between"
                          >
                            <span>{loc}</span>
                            <span className="text-[10px] text-white/40">Chennai</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-xs text-white/60">
                          <p>No exact match in common list.</p>
                          <button
                            type="button"
                            onClick={() => setShowLocalityDropdown(false)}
                            className="mt-1 text-amber-400 underline font-semibold"
                          >
                            Use "{localityQuery}" as custom area
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* City / Area */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    City / Region
                  </label>
                  <input
                    type="text"
                    value={cityArea}
                    onChange={(e) => setCityArea(e.target.value)}
                    placeholder="e.g. Chennai (OMR, ECR, Central)"
                    className="w-full bg-[#1F0711] border border-white/25 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Preferred Floor (Hidden if Land / Plot) */}
              {!isLand && (
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Preferred Floor
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FLOOR_OPTIONS.map((floor) => (
                      <button
                        key={floor}
                        type="button"
                        onClick={() => setPreferredFloor(floor)}
                        className={`text-xs px-3.5 py-2 rounded-xl font-medium border transition-all ${
                          preferredFloor === floor
                            ? 'bg-amber-500 border-amber-400 text-gray-950 font-bold shadow-md'
                            : 'border-white/20 bg-white/5 text-white/80 hover:border-amber-400 hover:text-white'
                        }`}
                      >
                        {floor}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Area (Min & Max Sq. Ft.) */}
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Required Area (Square Feet)
                </label>
                <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                  <div className="relative">
                    <input
                      type="number"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      placeholder="Min Sq. Ft."
                      className="w-full bg-[#1F0711] border border-white/25 text-white placeholder-white/40 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-[10px] text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      sq.ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      placeholder="Max Sq. Ft."
                      className="w-full bg-[#1F0711] border border-white/25 text-white placeholder-white/40 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-[10px] text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      sq.ft
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BLOCK 3: Budget & Preferences ── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-5">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-amber-400" />
                <span>Budget & Additional Preferences</span>
              </h3>

              {/* Expected Monthly Budget */}
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">
                  Expected Monthly Rent / Budget (₹) · மாத வாடகை
                </label>
                <div className="flex items-center gap-2 sm:max-w-md">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      placeholder="Min Budget"
                      className="w-full bg-[#1F0711] border border-white/25 text-white placeholder-white/40 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-white/40 text-xs">to</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      placeholder="Max Budget"
                      className="w-full bg-[#1F0711] border border-white/25 text-white placeholder-white/40 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Number of People (Shown for residential/rooms/PG/shared) */}
              {isResidentialType && (
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Number of People / Occupants
                  </label>
                  <div className="flex gap-2">
                    {['1', '2', '3', '4', '5+'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setOccupants(num)}
                        className={`w-12 h-10 rounded-xl font-bold text-xs border transition-all ${
                          occupants === num
                            ? 'bg-amber-500 border-amber-400 text-gray-950 shadow-md'
                            : 'border-white/20 bg-white/5 text-white/80 hover:border-amber-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Furnishing Preference */}
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2">
                  Furnishing Preference
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Furnished', 'Semi-Furnished', 'Unfurnished', 'Any'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFurnishing(f)}
                      className={`text-xs px-3.5 py-2 rounded-xl font-medium border transition-all ${
                        furnishing === f
                          ? 'bg-amber-500 border-amber-400 text-gray-950 font-bold shadow-md'
                          : 'border-white/20 bg-white/5 text-white/80 hover:border-amber-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parking */}
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2">Parking</label>
                <div className="flex gap-3">
                  {['Required', 'Not Required'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setParking(p)}
                      className={`text-xs px-4 py-2 rounded-xl font-medium border transition-all ${
                        parking === p
                          ? 'bg-amber-500 border-amber-400 text-gray-950 font-bold shadow-md'
                          : 'border-white/20 bg-white/5 text-white/80 hover:border-amber-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities Checklist */}
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2">
                  Preferred Amenities (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((amenity) => {
                    const active = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                          active
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-semibold'
                            : 'border-white/15 bg-white/5 text-white/70 hover:border-white/40'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${active ? 'text-amber-400' : 'text-white/30'}`}
                        />
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── BLOCK 4: Detailed Requirements (Free Text) ── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wide mb-1">
                  Describe Your Requirements · விரிவான தேவைகள்
                </label>
                <p className="text-white/60 text-xs mb-2">
                  Type your needs in your own words. You are not restricted to predefined choices.
                </p>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
                  className="w-full bg-[#1F0711] border border-white/25 text-white placeholder-white/40 rounded-xl p-4 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
              </div>

              {/* Quick Prompt Chips */}
              <div>
                <p className="text-[11px] text-white/50 mb-2 font-medium">
                  Click to quickly append common preferences:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_DESCRIPTION_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => appendChipToDescription(chip)}
                      className="text-[11px] bg-white/10 hover:bg-amber-400/20 hover:text-amber-300 border border-white/15 text-white/80 rounded-full px-3 py-1 transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── BLOCK 5: Contact Information ── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter your name"
                    className={`w-full bg-[#1F0711] border ${
                      errors.contactName ? 'border-red-400' : 'border-white/25'
                    } text-white placeholder-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400`}
                  />
                  {errors.contactName && (
                    <p className="text-red-300 text-xs mt-1">{errors.contactName}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`w-full bg-[#1F0711] border ${
                      errors.mobileNumber ? 'border-red-400' : 'border-white/25'
                    } text-white placeholder-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400`}
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-300 text-xs mt-1">{errors.mobileNumber}</p>
                  )}
                </div>
              </div>

              {/* WhatsApp Checkbox & Input */}
              <div className="pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={sameAsMobile}
                    onChange={(e) => setSameAsMobile(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-400"
                  />
                  <span className="text-xs text-white/85">
                    WhatsApp number is same as mobile number
                  </span>
                </label>

                {!sameAsMobile && (
                  <div className="sm:max-w-md mt-2">
                    <label className="block text-xs font-medium text-white/80 mb-1.5">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="WhatsApp phone number"
                      maxLength={10}
                      className="w-full bg-[#1F0711] border border-white/25 text-white placeholder-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── Submit CTA ── */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-extrabold rounded-2xl py-4 px-8 text-base shadow-xl hover:shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <span>Submitting your requirement...</span>
                ) : (
                  <>
                    <span>Post Requirement · இலவசமாக பதிவு செய்க</span>
                    <ArrowRight className="w-5 h-5 text-gray-950" />
                  </>
                )}
              </button>

              <p className="text-xs text-white/50 text-center mt-3">
                No listing fee required. Your requirement will be verified and connected with matching
                space owners across Chennai.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* ── Success Confirmation Modal ── */}
      {submittedSpace && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-1.5">
              Requirement Posted!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your requirement for <span className="font-bold text-gray-900">{submittedSpace.title || propertyType}</span> has been received. Our team is reviewing it and property owners with matching spaces will be able to contact you directly.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                to="/user/wanted-spaces"
                className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl py-3 text-sm transition-colors text-center shadow-sm"
              >
                View in My Requirements
              </Link>
              <Link
                to="/wanted-spaces"
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl py-2.5 text-sm transition-colors text-center"
              >
                Browse All Wanted Spaces
              </Link>
              <button
                type="button"
                onClick={() => setSubmittedSpace(null)}
                className="text-xs text-gray-400 hover:text-gray-600 pt-1"
              >
                Post another requirement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── VisualCategoryCard Subcomponent ───────────────────────────────────────────

interface VisualCategoryCardProps {
  cat: {
    key: string;
    title: string;
    titleTa: string;
    pills: string[];
  };
  isSelectedCategory: boolean;
  onPillClick: (pill: string) => void;
}

function VisualCategoryCard({ cat, isSelectedCategory, onPillClick }: VisualCategoryCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isSelectedCategory
          ? 'border-amber-400 bg-amber-50/70 shadow-sm ring-1 ring-amber-400'
          : 'border-gray-200 bg-white hover:border-amber-300'
      }`}
    >
      <div className="mb-2.5">
        <p className="font-bold text-gray-900 text-sm leading-tight">{cat.title}</p>
        <p className="text-xs text-gray-400">{cat.titleTa}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {cat.pills.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => onPillClick(pill)}
            className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-amber-500 hover:text-amber-800 hover:bg-amber-50 transition-colors shadow-2xs"
          >
            {pill}
          </button>
        ))}
      </div>
    </div>
  );
}
