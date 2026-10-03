import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { Property } from '../../types';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { SEOHead } from '../../components/common/SEOHead';
import {
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Store,
  MapPin,
  ExternalLink,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PendingApprovalsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [rejectingProp, setRejectingProp] = useState<Property | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminPendingProperties'],
    queryFn: () => adminService.getProperties({ status: 'PENDING_APPROVAL' }),
  });

  const properties = data?.data || [];

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingProperties'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success('Property approved and published to Chennai public listings!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to approve property');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.rejectProperty(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingProperties'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success('Property rejected with feedback sent to owner');
      setRejectingProp(null);
      setRejectReason('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject property');
    },
  });

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProp) return;
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    rejectMutation.mutate({ id: rejectingProp.id, reason: rejectReason.trim() });
  };

  return (
    <div className="space-y-6 pb-12">
      <SEOHead title="Review Pending Approvals | Veedu Vadagaiku Admin" />

      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
          <Clock className="w-4 h-4" />
          <span>Moderation Queue</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
          Paid Listings Awaiting Admin Review ({properties.length})
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          These properties have completed verified payment and require your verification before becoming visible publicly in Chennai.
        </p>
      </div>

      {isLoading ? (
        <Loader text="Loading pending listings..." />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All caught up!"
          description="There are currently no paid listings waiting in the approval queue."
        />
      ) : (
        <div className="space-y-6">
          {properties.map((prop) => {
            const primaryImg =
              prop.images?.[0]?.imageUrl ||
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={prop.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-200 shadow-lg space-y-6"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-lg">
                      {prop.propertyType}
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                      Paid via Cashfree
                    </span>
                    <span className="text-xs text-gray-400">
                      Submitted on{' '}
                      {new Date(prop.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => approveMutation.mutate(prop.id)}
                      disabled={approveMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Publish</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRejectingProp(prop)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs rounded-xl border border-red-200 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Ad</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Photo Thumbnail */}
                  <div className="space-y-2">
                    <img
                      src={primaryImg}
                      alt=""
                      className="w-full aspect-[4/3] rounded-2xl object-cover bg-gray-100 shadow-sm"
                    />
                    <p className="text-[11px] text-gray-400 text-center">
                      {prop.images?.length || 1} photo(s) uploaded
                    </p>
                  </div>

                  {/* Property Specs */}
                  <div className="md:col-span-2 space-y-3 text-xs text-gray-600">
                    <h2 className="text-lg font-black text-gray-900 leading-snug">{prop.title}</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <span className="text-gray-400 block font-bold">Rent</span>
                        <span className="font-extrabold text-sm text-gray-900">
                          ₹{prop.rent.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold">Deposit</span>
                        <span className="font-extrabold text-sm text-gray-900">
                          ₹{prop.deposit.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold">Locality</span>
                        <span className="font-bold text-orange-600">{prop.locality}, Chennai</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold">Size</span>
                        <span className="font-bold text-gray-800">{prop.propertySize} sq.ft</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold">Configuration</span>
                        <span className="font-bold text-gray-800">
                          {prop.bedrooms ? `${prop.bedrooms} BHK` : `${prop.rooms || 1} Room(s)`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold">Furnishing</span>
                        <span className="font-bold text-gray-800 capitalize">
                          {prop.furnishing.replace('_', ' ').toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-gray-700">Full Physical Address: </span>
                      <span>{prop.address}</span>
                    </div>

                    <div>
                      <span className="font-bold text-gray-700">Description: </span>
                      <p className="mt-1 line-clamp-3 leading-relaxed">{prop.description}</p>
                    </div>

                    {prop.owner?.user && (
                      <div className="pt-2 border-t border-gray-100 text-gray-500 flex items-center gap-4">
                        <span>
                          Owner: <strong>{prop.owner.user.name}</strong>
                        </span>
                        {prop.owner.user.mobile && (
                          <span>
                            Contact: <strong>{prop.owner.user.mobile}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-black text-gray-900">Reject Property Listing</h3>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Please enter the reason for rejecting <strong>"{rejectingProp.title}"</strong>. The owner will see this feedback and can edit & resubmit.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={4}
                required
                placeholder="e.g. Unclear property photos, incorrect address format, or invalid rental pricing."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingProp(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectMutation.isPending}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
