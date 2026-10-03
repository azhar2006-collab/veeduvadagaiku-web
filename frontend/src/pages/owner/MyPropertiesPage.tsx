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
  Store,
  PlusCircle,
  Edit,
  Trash2,
  CreditCard,
  Eye,
  AlertCircle,
  ExternalLink,
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
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80';

            const canEdit = prop.status === 'DRAFT' || prop.status === 'REJECTED';
            const needsPayment = prop.status === 'DRAFT' || prop.status === 'PAYMENT_PENDING';

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-gray-200 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Thumbnail & Main info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={primaryImg}
                      alt=""
                      className="w-20 h-20 rounded-xl object-cover bg-gray-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <PropertyStatusBadge status={prop.status} />
                        <span className="text-[11px] font-bold text-gray-400 uppercase">
                          {prop.propertyType}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                        {prop.title}
                      </h3>

                      <p className="text-xs text-gray-500 font-medium">
                        {prop.locality}, Chennai • Rent: ₹{prop.rent.toLocaleString('en-IN')}/mo •
                        Deposit: ₹{prop.deposit.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    {/* Pay button if pending */}
                    {needsPayment && (
                      <Link
                        to={`/owner/payment?propertyId=${prop.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Listing Fee</span>
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

                {/* Rejection Notice Banner */}
                {prop.status === 'REJECTED' && prop.rejectionReason && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2 text-xs text-red-700">
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
