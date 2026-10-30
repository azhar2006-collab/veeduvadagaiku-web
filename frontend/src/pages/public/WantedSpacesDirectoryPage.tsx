import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, IndianRupee, Maximize2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { listWantedSpaces, WantedSpace } from '../../services/wantedSpace.service';

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

const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({ key, label }));

export default function WantedSpacesDirectoryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [reqType, setReqType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['wanted-spaces', search, category, city, reqType, page],
    queryFn: () =>
      listWantedSpaces({
        search: search || undefined,
        category: category || undefined,
        city: city || undefined,
        requirementType: reqType || undefined,
        page,
        limit: 12,
      }),
    staleTime: 30_000,
  });

  const spaces: WantedSpace[] = data?.data || [];
  const total: number = data?.total || 0;
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#0B3B60] text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">தேவை · REQUIREMENTS</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Wanted Spaces</h1>
          <p className="text-white/60 text-sm mb-6">Browse requirements posted by people looking for spaces to rent or lease.</p>
          {/* Search */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 max-w-xl">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, location…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 text-gray-800 text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="City / area"
            value={city}
            onChange={(e) => { setCity(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-36 focus:outline-none focus:border-amber-400"
          />

          <select
            value={reqType}
            onChange={(e) => { setReqType(e.target.value); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400"
          >
            <option value="">Rent or Lease</option>
            <option value="RENT">Rent</option>
            <option value="LEASE">Lease</option>
            <option value="EITHER">Either</option>
          </select>

          <Link
            to="/wanted-spaces/specify"
            className="ml-auto bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
          >
            + Post Requirement
          </Link>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No requirements found.</p>
            <Link to="/wanted-spaces/specify" className="mt-4 inline-block text-amber-600 font-semibold underline">
              Post the first requirement
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{total} requirement{total !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {spaces.map((s) => (
                <WantedCard key={s.id} space={s} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-amber-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-amber-400"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function WantedCard({ space }: { space: WantedSpace }) {
  const catLabel = CATEGORY_LABELS[space.category] || space.category;
  const budget = space.maxRentBudget
    ? `Up to ₹${space.maxRentBudget.toLocaleString('en-IN')}/mo`
    : space.maxLeaseBudget
    ? `Lease up to ₹${space.maxLeaseBudget.toLocaleString('en-IN')}`
    : 'Budget not specified';

  return (
    <Link
      to={`/wanted-spaces/${space.id}`}
      className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-amber-200 transition-all block"
    >
      {/* Category badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 font-medium">
          {catLabel}
        </span>
        {space.subcategory && (
          <span className="text-xs text-gray-400">{space.subcategory}</span>
        )}
      </div>

      <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2 line-clamp-2">{space.title}</h3>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{space.preferredLocality ? `${space.preferredLocality}, ` : ''}{space.preferredCity}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <IndianRupee className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{budget}</span>
        </div>
        {(space.minArea || space.maxArea) && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Maximize2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {space.minArea && space.maxArea
                ? `${space.minArea}–${space.maxArea} sq.ft`
                : space.maxArea
                ? `Up to ${space.maxArea} sq.ft`
                : `From ${space.minArea} sq.ft`}
            </span>
          </div>
        )}
        {space.expectedMoveIn && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Move-in: {new Date(space.expectedMoveIn).toLocaleDateString('en-IN')}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Posted {new Date(space.createdAt).toLocaleDateString('en-IN')}
        </span>
        <span className="text-xs text-amber-600 font-medium">View details →</span>
      </div>
    </Link>
  );
}

