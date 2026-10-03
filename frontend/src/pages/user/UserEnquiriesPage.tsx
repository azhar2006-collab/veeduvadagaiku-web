import React from 'react';
import { Link } from 'react-router-dom';
import { useUserEnquiries } from '../../hooks/useEnquiries';
import { SEOHead } from '../../components/common/SEOHead';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { MessageSquare, Calendar, Building2, MapPin, ArrowRight } from 'lucide-react';

export const UserEnquiriesPage: React.FC = () => {
  const { data, isLoading } = useUserEnquiries();
  const enquiries = data?.data || [];

  return (
    <div className="space-y-6">
      <SEOHead title="My Enquiries | Veedu Vadagaiku" />

      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          My Sent Enquiries
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review the status of your messages sent to Chennai landlords and owners
        </p>
      </div>

      {isLoading ? (
        <Loader text="Loading your enquiry history..." />
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No enquiries sent yet"
          description="You haven't sent any enquiries yet. Browse properties and contact landlords directly."
          actionText="Search Rentals"
          actionLink="/properties"
        />
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => {
            const prop = enq.property;
            const primaryImg =
              prop?.images?.[0]?.imageUrl ||
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80';

            const statusColors: Record<string, string> = {
              NEW: 'bg-blue-50 text-blue-700 border-blue-200',
              READ: 'bg-amber-50 text-amber-700 border-amber-200',
              REPLIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              CLOSED: 'bg-gray-100 text-gray-600',
            };

            return (
              <div
                key={enq.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={primaryImg}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                  />
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-1 ${
                        statusColors[enq.status] || statusColors.NEW
                      }`}
                    >
                      {enq.status}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                      {prop?.title || 'Property Listing'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      <span>{prop?.locality}, Chennai</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 italic bg-gray-50 p-2 rounded-lg border border-gray-100 max-w-lg">
                      "{enq.message}"
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <span className="text-[11px] text-gray-400">
                    {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {prop?.id && (
                    <Link
                      to={`/property/${prop.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                    >
                      <span>View Listing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
