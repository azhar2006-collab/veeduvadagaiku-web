import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../services/property.service';
import { PropertyStatusBadge } from '../../components/property/PropertyStatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import {
  Building2,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyPropertiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['ownerProperties'],
    queryFn: () => propertyService.getOwnerProperties(),
  });

  const properties = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyService.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['ownerDashboard'] });
      toast.success('Property removed successfully');
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove property');
      setDeleteId(null);
    },
  });

  return (
    <div className="space-y-6">
      <SEOHead title="My Properties | Veedu Vadagaiku" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            My Chennai Properties ({properties.length})
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your houses, commercial shops, photos, and listing subscriptions
          </p>
        </div>

        <Link
          to="/owner/properties/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Another Property</span>
        </Link>
      </div>

      {isLoading ? (
        <Loader text="Loading your listed properties..." />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties listed yet"
          description="Start renting out your house or commercial shop in Chennai. Create your first listing now."
          actionText="+ Add Your First Property"
          actionLink="/owner/properties/add"
        />
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => {
            const primaryImg =
              prop.images?.[0]?.imageUrl ||
              '/properties/property-1.png';

            const canEdit = prop.status === 'DRAFT' || prop.status === 'REJECTED';

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 transition overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left: Thumbnail */}
                  <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={primaryImg}
                      alt={prop.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/properties/property-1.png';
                      }}
                    />
                  </div>

                  {/* Center: Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PropertyStatusBadge status={prop.status} />
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                        {prop.propertyType === 'HOUSE' ? 'House' : 'Commercial Shop'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-gray-900 line-clamp-1 leading-snug">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-gray-500 font-medium">
                      {prop.locality}, Chennai
                    </p>

                    <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 flex-wrap">
                      <span className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                        Rent: ₹{prop.rent.toLocaleString('en-IN')}/mo
                      </span>
                      <span className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                        Deposit: ₹{prop.deposit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row sm:flex-col items-center gap-2 sm:shrink-0 sm:pt-1 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                    {/* Select Plan & Pay (if DRAFT or PAYMENT_PENDING) */}
                    {(prop.status === 'DRAFT' || prop.status === 'PAYMENT_PENDING') && (
                      <Link
                        to={`/owner/payment?propertyId=${prop.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold text-xs rounded-xl shadow-xs transition hover:brightness-105 whitespace-nowrap"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Select Plan & Pay</span>
                      </Link>
                    )}

                    {/* View Live (if published) */}
                    {prop.status === 'PUBLISHED' && (
                      <Link
                        to={`/property/${prop.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Page</span>
                      </Link>
                    )}

                    {/* Edit button */}
                    {canEdit && (
                      <Link
                        to={`/owner/properties/${prop.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setDeleteId(prop.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Remove Property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Draft / Payment Required Banner */}
                {(prop.status === 'DRAFT' || prop.status === 'PAYMENT_PENDING') && (
                  <div className="mx-4 mb-4 p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900 flex-wrap">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#C5A059] shrink-0" />
                      <span>Subscription listing plan required to activate and submit this property.</span>
                    </div>
                    <Link
                      to={`/owner/payment?propertyId=${prop.id}`}
                      className="px-3 py-1 bg-[#C5A059] hover:bg-[#9A7818] text-white font-bold rounded-lg transition"
                    >
                      Choose Plan →
                    </Link>
                  </div>
                )}

                {/* Pending Admin Approval Banner */}
                {prop.status === 'PENDING_APPROVAL' && (
                  <div className="mx-4 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-2.5 text-xs text-blue-800">
                    <Eye className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                    <div>
                      <span className="font-bold block text-blue-900">
                        Pending Admin Approval
                      </span>
                      <span className="text-blue-700 leading-relaxed">
                        Payment verified! Your property has been submitted and is under review by our admin team. It will be published once approved.
                      </span>
                    </div>
                  </div>
                )}

                {/* Rejection Notice Banner */}
                {prop.status === 'REJECTED' && prop.rejectionReason && (
                  <div className="mx-4 mb-4 p-3 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Admin Rejection Feedback: </span>
                      <span>{prop.rejectionReason}</span>
                      <p className="mt-1 font-semibold text-red-800">
                        Please click 'Edit' to correct the details and resubmit for approval.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Remove Property Listing?"
        message="Are you sure you want to remove this property? It will no longer appear on Veedu Vadagaiku."
        confirmText="Yes, Remove"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
