import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createWantedSpace } from '../../services/wantedSpace.service';
import { CHENNAI_LOCALITIES } from '../../utils/chennaiLocalities';
import toast from 'react-hot-toast';
import {
  Search,
  MapPin,
  CheckCircle2,
  ChevronDown,
  Phone,
  ArrowRight,
  IndianRupee,
  X,
  Sparkles,
  Building2,
  FileText,
  User,
} from 'lucide-react';

// ─── Property Type Options ─────────────────────────────────────────────────────

export interface PropertyTypeOption {
  value: string;
  label: string;
  category: string;
  subcategory: string;
  group: 'Residential Properties' | 'Shops' | 'Office' | 'Commercial Building' | 'Room Sharing' | 'Others';
}

export const PROPERTY_TYPES: PropertyTypeOption[] = [
  // Residential Properties
  { value: 'Independent House', label: 'Independent House', category: 'RESIDENTIAL', subcategory: 'Independent house', group: 'Residential Properties' },
  { value: 'Apartment / Flat', label: 'Apartment / Flat', category: 'RESIDENTIAL', subcategory: 'Apartment / Flat', group: 'Residential Properties' },
  // Shops
  { value: 'Commercial Shop', label: 'Commercial Shop', category: 'SHOPS_RETAIL', subcategory: 'Shop', group: 'Shops' },
  { value: 'Showroom', label: 'Showroom', category: 'SHOPS_RETAIL', subcategory: 'Showroom', group: 'Shops' },
  // Office
  { value: 'Office Space', label: 'Office Space', category: 'OFFICES', subcategory: 'Office space', group: 'Office' },
  // Commercial Building
  { value: 'Building for Rent', label: 'Building for Rent', category: 'COMMERCIAL_BUILDINGS', subcategory: 'Commercial Buildings', group: 'Commercial Building' },
  // Room Sharing
  { value: 'Bachelor Room', label: 'Bachelor Room', category: 'ROOMS_ACCOMMODATION', subcategory: 'Single room', group: 'Room Sharing' },
  { value: 'PG Accommodation', label: 'PG Accommodation', category: 'ROOMS_ACCOMMODATION', subcategory: 'Hostel', group: 'Room Sharing' },
  { value: 'Shared Room', label: 'Shared Room', category: 'ROOMS_ACCOMMODATION', subcategory: 'Shared room', group: 'Room Sharing' },
  // Others
  { value: 'Other', label: 'Other', category: 'OTHER', subcategory: 'Other', group: 'Others' },
];

// ─── Per-Property-Type Textarea Placeholders ───────────────────────────────────

const PROPERTY_PLACEHOLDERS: Record<string, string[]> = {
  'Independent House': [
    'Looking for a 3BHK independent house with car parking and garden space...',
    'Need a gated independent house for a family of 5, preferably with 2 bathrooms...',
    'Looking for a house with 24/7 water supply, car parking, and a separate entrance...',
    'Prefer a house close to school and hospital, semi-furnished preferred...',
  ],
  'Apartment / Flat': [
    'Looking for a 2BHK apartment with lift and covered parking in a gated complex...',
    'Need a 3BHK flat near metro, fully furnished preferred, for a family of 4...',
    'Looking for a flat with power backup, security, and water supply...',
    'Need an affordable 1BHK near OMR for a working couple, semi-furnished is OK...',
  ],
  'Commercial Shop': [
    'Looking for a 300-500 sq. ft. road-facing shop for a clothing business...',
    'Need a ground-floor shop with good footfall area for a grocery store...',
    'Looking for a shop near a bus stand or market area, with water and power connection...',
    'Need a shop space suitable for a mobile accessories or stationery business...',
  ],
  'Showroom': [
    'Looking for a 1000+ sq. ft. showroom space on a main road for a furniture business...',
    'Need a glass-front showroom suitable for jewellery or electronics display...',
    'Looking for a showroom with ample parking, preferably ground floor on a commercial road...',
    'Need a wide showroom space for an automobile or lifestyle brand...',
  ],
  'Office Space': [
    'Looking for a 500-800 sq. ft. office space for a team of 10-15 people...',
    'Need a co-working or private office with high-speed internet and AC facility...',
    'Looking for an office near IT corridor with parking and lift...',
    'Need a furnished office space for a startup, conference room access preferred...',
  ],
  'Building for Rent': [
    'Looking for a multi-floor commercial building suitable for a school or institution...',
    'Need an entire building for a co-working hub or business centre setup...',
    'Looking for a 3-4 floor building near a main road, suitable for retail or office use...',
    'Need a standalone building with basement parking for a corporate office...',
  ],
  'Bachelor Room': [
    'Need a bachelor-friendly room for 2-3 working professionals near OMR...',
    'Looking for a single room with attached bathroom, cooking allowed preferred...',
    'Need a room with WiFi and 24hr water supply near Guindy or T. Nagar...',
    'Looking for an affordable bachelor room close to metro or bus stand...',
  ],
  'PG Accommodation': [
    'Looking for a PG for working men/women with meals, laundry, and WiFi...',
    'Need a PG with AC rooms, 24hr security, and power backup near Velachery...',
    'Looking for a girls PG with curfew-free policy and shared or private room...',
    'Need an affordable PG close to college with homely food and clean rooms...',
  ],
  'Shared Room': [
    'Looking for a flatmate in a 2BHK flat, seeking 1 or 2 professionals to share...',
    'Need a shared room in Anna Nagar or Adyar, split rent preferred below Rs.6000...',
    'Looking to share a 3BHK apartment near Sholinganallur for IT professionals...',
    'Need shared accommodation with a friendly flatmate, vegetarian household preferred...',
  ],
  'Other': [
    'Describe what type of space or property you are looking for...',
    'Mention any specific requirements such as location, size, usage, or budget...',
    'Type your requirements in your own words, we will match you with the right property...',
  ],
};

const DEFAULT_PLACEHOLDERS: string[] = [
  'Describe your requirement in detail...',
  'Mention size, location preference, budget range, or any special needs...',
  'Type anything, our team will match you with the right property...',
];

const PROPERTY_CHIPS: Record<string, string[]> = {
  'Independent House': [
    'Car parking required',
    'Gated community preferred',
    '24hr water supply needed',
    'Family with school-going kids',
    'Pet friendly',
    'Near school or hospital',
  ],
  'Apartment / Flat': [
    'Lift is a must',
    'Car parking required',
    'Power backup needed',
    'Gated community preferred',
    'Near metro station',
    '24hr security needed',
  ],
  'Commercial Shop': [
    'Road-facing preferred',
    'Ground floor only',
    'Good footfall area',
    'Water and power connection needed',
    'Near bus stand or market',
    'Need signage space',
  ],
  'Showroom': [
    'Main road frontage required',
    'Glass front / display area',
    'Ample parking needed',
    'Ground floor preferred',
    'High ceiling required',
    'Power backup needed',
  ],
  'Office Space': [
    'High-speed internet needed',
    'AC facility required',
    'Conference room access',
    'Near metro or bus stop',
    'Lift access required',
    'Suitable for IT company',
  ],
  'Building for Rent': [
    'Multi-floor building needed',
    'Basement parking required',
    'Suitable for institution',
    'Lift access required',
    'Main road facing',
    'Independent building preferred',
  ],
  'Bachelor Room': [
    'Cooking allowed',
    'Attached bathroom',
    'WiFi needed',
    'Near bus stand or metro',
    '24hr water supply',
    'Looking for immediate move-in',
  ],
  'PG Accommodation': [
    'Meals included',
    'AC room needed',
    'Laundry facility needed',
    '24hr security required',
    'Power backup needed',
    'Near college or office',
  ],
  'Shared Room': [
    'Vegetarian flatmate preferred',
    'Working professionals only',
    'Immediate availability',
    'Cooking allowed',
    'Near IT park',
    'Split rent equally',
  ],
};

const DEFAULT_CHIPS: string[] = [
  'Looking for immediate move-in',
  'Car parking is essential',
  'Need lift access',
  'Good water supply required',
];

export default function WantedSpecifyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core Form State
  const [propertyType, setPropertyType] = useState<string>('Apartment / Flat');
  const [title, setTitle] = useState<string>('');
  const [preferredLocality, setPreferredLocality] = useState<string>('');
  const [cityArea, setCityArea] = useState<string>('Chennai');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');
  const [minBudget, setMinBudget] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [description, setDescription] = useState<string>('');

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
  const [activePlaceholder, setActivePlaceholder] = useState<string>('');
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

  // Rotate textarea placeholder based on selected property type
  useEffect(() => {
    const placeholders = PROPERTY_PLACEHOLDERS[propertyType] ?? DEFAULT_PLACEHOLDERS;
    setPlaceholderIndex(0);
    setActivePlaceholder(placeholders[0]);
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => {
        const next = (prev + 1) % placeholders.length;
        setActivePlaceholder(placeholders[next]);
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [propertyType]);

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

  // Filter all Chennai localities by name or 6-digit pin code
  const filteredLocalities = CHENNAI_LOCALITIES.filter((loc) => {
    const q = localityQuery.trim().toLowerCase();
    if (!q) return true;
    return loc.toLowerCase().includes(q);
  });

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

  // Add chip to textarea
  const appendChipToDescription = (chipText: string) => {
    setDescription((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return chipText + '.';
      if (trimmed.includes(chipText)) return prev;
      return `${trimmed}\n• ${chipText}.`;
    });
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
            minArea,
            maxArea,
            minBudget,
            maxBudget,
            description,
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
      additionalNotes: description.trim() || undefined,
      contactName: contactName.trim(),
      contactPhone: mobileNumber.trim(),
      contactWhatsapp: (sameAsMobile ? mobileNumber : whatsappNumber).trim(),
      contactMethod: 'phone',
      showContact: true,
      categoryExtras: {
        propertyType,
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
    <div className="min-h-screen bg-[#FAF7F2] text-gray-900 pb-16">
      {/* ── Page Header ── */}
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-bold text-[#8C6D15] uppercase tracking-wider bg-[#FAF4E6] border border-[#E8DFC8] px-3 py-1 rounded-full">
            தேவை · REQUIREMENTS
          </span>
          <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
            Zero Brokerage · Free to Post
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
          Wanted – Specify
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
          Tell us what kind of house, room, shop, office, or space you are looking for in Chennai.
          Property owners with matching spaces will contact you directly.
        </p>
      </div>

      {/* ── Requirement Form (Beige / Warm Ivory Theme) ── */}
      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── BLOCK 0: Requirement Title (first, prominent) ── */}
          <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-7 shadow-sm">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Give Your Requirement a Title · தேவையின் தலைப்பு
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 2BHK House Required in Anna Nagar"
              className="w-full bg-[#FAF8F5] border border-[#D5C9B1] text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white focus:ring-1 focus:ring-[#C5A059] transition-all"
            />
            <p className="text-gray-500 text-[11px] mt-1.5">
              Optional · விரும்பினால் உள்ளிடுங்கள்: If left blank, we'll auto-name it from your property &amp; location.
            </p>
          </div>

          {/* ── BLOCK 1: Property Type ── */}
          <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F0E9DA] pb-3.5">
              <Building2 className="w-5 h-5 text-[#C5A059]" />
              <h2 className="text-base font-bold text-gray-900">
                1. What are you looking for? · எந்த இடம் தேவை?
              </h2>
            </div>

            {/* Property Type Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Select Property Type · சொத்து வகை <span className="text-red-500">*</span>
              </label>
              <div className="relative sm:max-w-sm">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className={`w-full bg-[#FAF8F5] border ${
                    errors.propertyType ? 'border-red-400' : 'border-[#D5C9B1]'
                  } text-gray-900 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-[#C5A059] focus:bg-white focus:ring-1 focus:ring-[#C5A059] transition-all pr-10`}
                >
                  <optgroup label="Residential Properties">
                    <option value="Independent House">Independent House</option>
                    <option value="Apartment / Flat">Apartment / Flat</option>
                  </optgroup>
                  <optgroup label="Shops">
                    <option value="Commercial Shop">Commercial Shop</option>
                    <option value="Showroom">Showroom</option>
                  </optgroup>
                  <optgroup label="Office">
                    <option value="Office Space">Office Space</option>
                  </optgroup>
                  <optgroup label="Commercial Building">
                    <option value="Building for Rent">Building for Rent</option>
                  </optgroup>
                  <optgroup label="Room Sharing">
                    <option value="Bachelor Room">Bachelor Room</option>
                    <option value="PG Accommodation">PG Accommodation</option>
                    <option value="Shared Room">Shared Room</option>
                  </optgroup>
                  <optgroup label="Others">
                    <option value="Other">Other</option>
                  </optgroup>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.propertyType && (
                <p className="text-red-600 text-xs mt-1.5">{errors.propertyType}</p>
              )}
            </div>
          </div>

          {/* ── BLOCK 2: Location & Space Details ── */}
          <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F0E9DA] pb-3.5">
              <MapPin className="w-5 h-5 text-[#C5A059]" />
              <h2 className="text-base font-bold text-gray-900">
                2. Location & Space Details · இடம் & அளவு
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Searchable Preferred Locality */}
              <div className="relative" ref={localityDropdownRef}>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Preferred Locality in Chennai <span className="text-red-500">*</span>
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
                    placeholder="Search or enter locality (e.g. Velachery, Anna Nagar)"
                    className={`w-full bg-[#FAF8F5] border ${
                      errors.preferredLocality ? 'border-red-400' : 'border-[#D5C9B1]'
                    } text-gray-900 placeholder-gray-400 rounded-xl pl-10 pr-9 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white focus:ring-1 focus:ring-[#C5A059] transition-all`}
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {(preferredLocality || localityQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreferredLocality('');
                        setLocalityQuery('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {errors.preferredLocality && (
                  <p className="text-red-600 text-xs mt-1.5">{errors.preferredLocality}</p>
                )}

                {/* Locality Autocomplete Dropdown with All PIN Codes */}
                {showLocalityDropdown && (
                  <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-[#D5C9B1] rounded-2xl shadow-xl max-h-72 overflow-y-auto divide-y divide-[#F0E9DA]">
                    <div className="sticky top-0 z-10 px-3.5 py-2 bg-[#FAF8F5] border-b border-[#F0E9DA] flex items-center justify-between text-[11px] text-gray-500 font-medium">
                      <span>Chennai Localities & Postal PIN Codes</span>
                      <span className="text-[#8C6D15] font-bold bg-[#FAF4E6] px-2 py-0.5 rounded-full border border-[#E8DFC8]">
                        {filteredLocalities.length} Areas
                      </span>
                    </div>

                    {filteredLocalities.length > 0 ? (
                      filteredLocalities.map((loc) => {
                        const [areaName, pinCode] = loc.includes(' - ') ? loc.split(' - ') : [loc, ''];
                        return (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setPreferredLocality(loc);
                              setLocalityQuery('');
                              setShowLocalityDropdown(false);
                            }}
                            className="w-full text-left px-3.5 py-2.5 text-xs text-gray-800 hover:bg-[#FAF4E6] hover:text-[#8C6D15] transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                              <span className="font-semibold text-gray-900 truncate group-hover:text-[#8C6D15]">
                                {areaName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {pinCode && (
                                <span className="bg-[#FAF8F5] border border-[#E2D7C3] text-[#8C6D15] font-mono font-bold text-[11px] px-2 py-0.5 rounded-md group-hover:bg-[#C5A059] group-hover:text-white group-hover:border-[#C5A059] transition-colors">
                                  {pinCode}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400">Chennai</span>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-xs text-gray-600">
                        <p>No matching Chennai locality or pin code found.</p>
                        <button
                          type="button"
                          onClick={() => setShowLocalityDropdown(false)}
                          className="mt-1 text-[#8C6D15] underline font-semibold"
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  City / Region
                </label>
                <input
                  type="text"
                  value={cityArea}
                  onChange={(e) => setCityArea(e.target.value)}
                  placeholder="e.g. Chennai (OMR, ECR, Central)"
                  className="w-full bg-[#FAF8F5] border border-[#D5C9B1] text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white focus:ring-1 focus:ring-[#C5A059] transition-all"
                />
              </div>
            </div>

            {/* Required Area (Min & Max Sq. Ft.) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Required Area (Square Feet) · பரப்பு
              </label>
              <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                <div className="relative">
                  <input
                    type="number"
                    value={minArea}
                    onChange={(e) => setMinArea(e.target.value)}
                    placeholder="Min Sq. Ft."
                    className="w-full bg-[#FAF8F5] border border-[#D5C9B1] text-gray-900 placeholder-gray-400 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                  <span className="text-[11px] text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    sq.ft
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={maxArea}
                    onChange={(e) => setMaxArea(e.target.value)}
                    placeholder="Max Sq. Ft."
                    className="w-full bg-[#FAF8F5] border border-[#D5C9B1] text-gray-900 placeholder-gray-400 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                  <span className="text-[11px] text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    sq.ft
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── BLOCK 3: Budget Details ── */}
          <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F0E9DA] pb-3.5">
              <IndianRupee className="w-5 h-5 text-[#C5A059]" />
              <h2 className="text-base font-bold text-gray-900">
                3. Expected Monthly Budget · மாத வாடகை பட்ஜெட்
              </h2>
            </div>

            {/* Expected Monthly Budget */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Expected Monthly Rent / Budget (₹) · மாத வாடகை
              </label>
              <div className="flex items-center gap-2 sm:max-w-md">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    placeholder="Min Budget"
                    className="w-full bg-[#FAF8F5] border border-[#D5C9B1] text-gray-900 placeholder-gray-400 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
                <span className="text-gray-400 text-xs font-medium">to</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="Max Budget"
                    className="w-full bg-[#FAF8F5] border border-[#D5C9B1] text-gray-900 placeholder-gray-400 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── BLOCK 4: Detailed Requirements (Free Text) ── */}
          <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0E9DA] pb-3.5">
              <FileText className="w-5 h-5 text-[#C5A059]" />
              <h2 className="text-base font-bold text-gray-900">
                4. Describe Your Requirements · விரிவான தேவைகள்
              </h2>
            </div>

            <div>
              <p className="text-gray-600 text-xs mb-2.5">
                Type your specifications in your own words. You are not restricted to predefined options.
              </p>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={activePlaceholder}
                className="w-full bg-[#FAF8F5] border border-[#D5C9B1] text-gray-900 placeholder-gray-400 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white focus:ring-1 focus:ring-[#C5A059] transition-all"
              />
            </div>

            {/* Quick Prompt Chips */}
            <div>
              <p className="text-[11px] text-gray-500 mb-2 font-medium">
                Click to quickly append common requirements:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(PROPERTY_CHIPS[propertyType] ?? DEFAULT_CHIPS).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => appendChipToDescription(chip)}
                    className="text-[11px] bg-[#FAF4E6] hover:bg-[#F3E8CE] border border-[#E8DFC8] text-[#8C6D15] rounded-full px-3 py-1 transition-colors font-medium"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── BLOCK 5: Contact Information ── */}
          <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0E9DA] pb-3.5">
              <User className="w-5 h-5 text-[#C5A059]" />
              <h2 className="text-base font-bold text-gray-900">
                5. Contact Information · தொடர்பு விவரம்
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full bg-[#FAF8F5] border ${
                    errors.contactName ? 'border-red-400' : 'border-[#D5C9B1]'
                  } text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white`}
                />
                {errors.contactName && (
                  <p className="text-red-600 text-xs mt-1">{errors.contactName}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`w-full bg-[#FAF8F5] border ${
                    errors.mobileNumber ? 'border-red-400' : 'border-[#D5C9B1]'
                  } text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white`}
                />
                {errors.mobileNumber && (
                  <p className="text-red-600 text-xs mt-1">{errors.mobileNumber}</p>
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
                  className="w-4 h-4 rounded accent-[#C5A059]"
                />
                <span className="text-xs text-gray-700 font-medium">
                  WhatsApp number is same as mobile number
                </span>
              </label>

              {!sameAsMobile && (
                <div className="sm:max-w-md mt-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="WhatsApp phone number"
                    maxLength={10}
                    className="w-full bg-[#FAF8F5] border border-[#D5C9B1] text-gray-900 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C5A059] focus:bg-white"
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
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:from-[#C5A059] hover:to-[#B38E42] text-gray-950 font-black rounded-2xl py-4 px-8 text-base shadow-lg shadow-amber-900/10 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-3 cursor-pointer"
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

            <p className="text-xs text-gray-500 text-center mt-3">
              No listing fee required. Your requirement will be verified and connected with matching
              space owners across Chennai.
            </p>
          </div>
        </form>
      </div>

      {/* ── Success Confirmation Modal ── */}
      {submittedSpace && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center border border-[#E8DFC8] animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-1.5">
              Requirement Posted!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your requirement for{' '}
              <span className="font-bold text-gray-900">
                {submittedSpace.title || propertyType}
              </span>{' '}
              has been received. Our team will review it, and property owners with matching spaces
              will contact you directly.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                to="/user/wanted-spaces"
                className="w-full bg-[#D4AF37] hover:bg-[#C5A059] text-gray-950 font-bold rounded-xl py-3 text-sm transition-colors text-center shadow-xs"
              >
                View in My Requirements
              </Link>
              <Link
                to="/wanted-spaces"
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl py-2.5 text-sm transition-colors text-center"
              >
                Browse All Wanted Specify
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
