import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ownerService } from '../../services/owner.service';
import { StatCard } from '../../components/dashboard/StatCard';
import { SEOHead } from '../../components/common/SEOHead';
import { Loader } from '../../components/common/Loader';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['ownerDashboard'],
    queryFn: () => ownerService.getDashboard(),
  });

  const dashboard = data?.data;
  const stats = dashboard?.stats || {};

  const publishedCount = stats['PUBLISHED'] || 0;
  const pendingCount = stats['PENDING_APPROVAL'] || 0;
  const paymentPendingCount = stats['PAYMENT_PENDING'] || 0;
  const draftCount = stats['DRAFT'] || 0;
  const rejectedCount = stats['REJECTED'] || 0;
  const totalProperties =
    publishedCount + pendingCount + paymentPendingCount + draftCount + rejectedCount;

  return (
    <div className="space-y-8">
      <SEOHead title="Owner Dashboard | Veedu Vadagaiku" />

      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-orange-200 uppercase tracking-wider">
            Owner Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Manage Your Chennai Rentals</h1>
          <p className="text-xs sm:text-sm text-orange-100">
            List multiple houses & commercial shops, view tenant leads, and track approvals.
          </p>
        </div>

        <Link
          to="/owner/properties/add"
          className="px-5 py-3 bg-gray-950 hover:bg-black text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4 text-orange-400" />
          <span>+ Add New Property</span>
        </Link>
      </div>

      {isLoading ? (
        <Loader text="Loading your dashboard analytics..." />
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Total Listed"
              value={totalProperties}
              icon={Building2}
              color="orange"
            />
            <StatCard
              title="Published"
              value={publishedCount}
              icon={CheckCircle2}
              color="green"
            />
            <StatCard
              title="Pending Approval"
              value={pendingCount}
              icon={Clock}
              color="blue"
            />
            <StatCard
              title="Draft / Issues"
              value={draftCount + rejectedCount}
              icon={AlertTriangle}
              color="red"
            />
          </div>

          {/* Quick Management Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/owner/properties"
              className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-300 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-600">
                    My Properties
                  </h4>
                  <p className="text-xs text-gray-500">Edit, upload photos, remove</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/owner/enquiries"
              className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-300 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600">
                    Tenant Enquiries
                  </h4>
                  <p className="text-xs text-gray-500">Respond to tenant leads</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          {/* Recent Activity: Enquiries */}
          <div className="grid grid-cols-1 gap-6">
            {/* Recent Enquiries */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">Recent Tenant Enquiries</h3>
                <Link to="/owner/enquiries" className="text-xs font-bold text-orange-600 hover:underline">
                  View All
                </Link>
              </div>

              {dashboard?.recentEnquiries && dashboard.recentEnquiries.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentEnquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="p-3.5 bg-gray-50 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{enq.user?.name || 'Interested Tenant'}</p>
                        <p className="text-gray-500 truncate max-w-xs">{enq.property?.title}</p>
                      </div>
                      <span className="font-medium text-gray-400">
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">No enquiries received yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
