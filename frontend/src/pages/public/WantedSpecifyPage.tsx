import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createWantedSpace } from '../../services/wantedSpace.service';
import toast from 'react-hot-toast';

// ─── Category Data ─────────────────────────────────────────────────────────────

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

const ALL_CATEGORIES = [...RESIDENTIAL_CATEGORIES, ...COMMERCIAL_CATEGORIES];

const RESIDENTIAL_KEYS = RESIDENTIAL_CATEGORIES.map((c) => c.key);

const QUICK_REQUIREMENTS = [
  'Furnished',
  'Car parking',
  'Bike parking',
  'Lift',
  'Ground floor',
  'Pet friendly',
  'Near metro or bus stop',
  'Near school or college',
  'Immediate move-in',
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function WantedSpecifyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [areaLocation, setAreaLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [quickReqs, setQuickReqs] = useState<string[]>([]);
  const [otherReqs, setOtherReqs] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleQuickReq = (req: string) => {
    setQuickReqs((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
    );
  };

  const selectedCategoryData = ALL_CATEGORIES.find((c) => c.key === selectedCategory);
  const isResidential = selectedCategory ? RESIDENTIAL_KEYS.includes(selectedCategory) : null;

  async function handlePost(commercial: boolean) {
    if (!user) {
      toast.error('Please log in to post a requirement');
      navigate('/login', { state: { from: '/wanted-spaces/specify' } });
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a property category first');
      return;
    }

    if (!areaLocation.trim()) {
      toast.error('Please enter an area or location');
      return;
    }

    if (!contactNumber.trim()) {
      toast.error('Please enter your contact number');
      return;
    }

    const priceType = commercial ? 'COMMERCIAL' : 'RESIDENTIAL';
    const paymentAmount = commercial ? 555 : 99;

    // Build amenities list from quick requirements
    const amenities = [...quickReqs];

    // Build title
    const catLabel = selectedCategoryData?.title || selectedCategory;
    const title = `Looking for ${selectedSubcategory || catLabel} in ${areaLocation.trim()}`;

    const payload = {
      title,
      category: selectedCategory,
      subcategory: selectedSubcategory || undefined,
      preferredCity: 'Chennai',
      preferredLocality: areaLocation.trim(),
      maxRentBudget: maxBudget ? Number(maxBudget) : undefined,
      minArea: undefined,
      maxArea: undefined,
      amenities,
      additionalNotes: [
        otherReqs.trim(),
        `Budget: ₹${minBudget || '0'} – ₹${maxBudget || 'any'}/mo`,
        `Listing type: ${priceType}`,
      ]
        .filter(Boolean)
        .join('\n'),
      contactName: user.name || 'User',
      contactPhone: contactNumber.trim(),
      contactWhatsapp: contactNumber.trim(),
      contactMethod: 'whatsapp',
      showContact: true,
      paymentAmount,
    };

    setSubmitting(true);
    try {
      const created = await createWantedSpace(payload);
      toast.success('Requirement saved! Redirecting to payment…');
      navigate(`/user/wanted-spaces/payment?wantedSpaceId=${created.id}&amount=${paymentAmount}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save requirement');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* ── Header ── */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-4">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-1">
          தேவை · REQUIREMENTS
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Wanted – Specify</h1>
        <p className="text-gray-500 text-sm">Looking for any space for rental? Specify your choice.</p>
      </div>

      {/* ── Category Grid ── */}
      <div className="max-w-5xl mx-auto px-4 pb-2">
        {/* Residential row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {RESIDENTIAL_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.key}
              cat={cat}
              selected={selectedCategory === cat.key}
              selectedSubcategory={selectedCategory === cat.key ? selectedSubcategory : null}
              onSelect={() => {
                setSelectedCategory(cat.key);
                setSelectedSubcategory(null);
              }}
              onPill={(pill) => {
                setSelectedCategory(cat.key);
                setSelectedSubcategory(pill);
              }}
            />
          ))}
          {/* Placeholder to keep 3-col on md for residential (2 cards) */}
          <div className="hidden md:block" />
        </div>

        {/* Commercial row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {COMMERCIAL_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.key}
              cat={cat}
              selected={selectedCategory === cat.key}
              selectedSubcategory={selectedCategory === cat.key ? selectedSubcategory : null}
              onSelect={() => {
                setSelectedCategory(cat.key);
                setSelectedSubcategory(null);
              }}
              onPill={(pill) => {
                setSelectedCategory(cat.key);
                setSelectedSubcategory(pill);
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Dark Form ── */}
      <div className="bg-[#2D0A18] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-lg md:text-xl font-bold mb-1">
            Tell us what you need · உங்கள் தேவையைக் குறிப்பிடுங்கள்
          </h2>
          <p className="text-sm text-white/60 mb-6">
            Choose a space above, then add your budget, location and any special requirements.
          </p>

          {/* Row 1: Budget / Location / Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Monthly budget (₹) · மாத வாடகை
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
                <span className="text-white/50 text-sm">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Area / location · இடம்
              </label>
              <input
                type="text"
                placeholder="Area name or pincode, e.g. Velachery"
                value={areaLocation}
                onChange={(e) => setAreaLocation(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Your contact number · தொடர்பு எண்
              </label>
              <input
                type="tel"
                placeholder="Mobile number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Quick Requirements */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-white/70 mb-3 uppercase tracking-wide">
              Quick requirements – tick what matters
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {QUICK_REQUIREMENTS.map((req) => (
                <label key={req} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quickReqs.includes(req)}
                    onChange={() => toggleQuickReq(req)}
                    className="w-4 h-4 rounded accent-amber-400"
                  />
                  <span className="text-sm text-white/85">{req}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Other Requirements */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">
              Any other requirements · மற்ற தேவைகள்
            </label>
            <textarea
              rows={3}
              placeholder="For example: family size, floor, vegetarian only, hall capacity, shop frontage, move-in date"
              value={otherReqs}
              onChange={(e) => setOtherReqs(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              onClick={() => handlePost(false)}
              disabled={submitting}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-full py-3 px-6 text-sm transition-colors disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Post residential requirement · ₹99'}
            </button>
            <button
              onClick={() => handlePost(true)}
              disabled={submitting}
              className="flex-1 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-[#2D0A18] font-semibold rounded-full py-3 px-6 text-sm transition-colors disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Post commercial requirement · ₹555'}
            </button>
          </div>

          <p className="text-xs text-white/40 text-center">
            Residential: houses, flats, PG and rooms. Commercial: shops, offices, godowns, halls and land.
            Owners with a matching space can then reach you.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── CategoryCard Sub-component ────────────────────────────────────────────────

interface CategoryCardProps {
  cat: { key: string; title: string; titleTa: string; pills: string[] };
  selected: boolean;
  selectedSubcategory: string | null;
  onSelect: () => void;
  onPill: (pill: string) => void;
}

function CategoryCard({ cat, selected, selectedSubcategory, onSelect, onPill }: CategoryCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${
        selected
          ? 'border-amber-500 bg-amber-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-sm'
      }`}
    >
      <p className="font-semibold text-gray-900 text-sm leading-tight">{cat.title}</p>
      <p className="text-xs text-gray-400 mb-3">{cat.titleTa}</p>
      <div className="flex flex-wrap gap-1.5">
        {cat.pills.map((pill) => (
          <button
            key={pill}
            onClick={(e) => {
              e.stopPropagation();
              onPill(pill);
            }}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              selectedSubcategory === pill
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'border-gray-300 text-gray-600 hover:border-amber-400 hover:text-amber-700'
            }`}
          >
            {pill}
          </button>
        ))}
      </div>
    </div>
  );
}
