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
  SendHorizonal,
  Clock,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl, getPropertyFallbackImage } from '../../utils/imageUrl';

export const MyPropertiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);

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

  const submitMutation = useMutation({
    mutationFn: (id: string) => propertyService.submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['ownerDashboard'] });
      toast.success('Property submitted for admin review! It will be published once approved.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit. Please ensure at least one photo is uploaded.');
    },
  });

  const renewMutation = useMutation({
    mutationFn: (id: string) => propertyService.renewProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['ownerDashboard'] });
      toast.success('Property listing renewed successfully! Validity period extended.');
      setRenewingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to renew listing');
      setRenewingId(null);
    },
  });

  return (
    <div className="space-y-6">
      <SEOHead title="My Properties | Veedu Vadagaikku Chennai" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            My Chennai Properties ({properties.length})
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your houses, commercial shops, photos, and listing status
          </p>
        </div>

        <Link
          to="/owner/properties/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition hover:brightness-105 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add New Property</span>
        </Link>
      </div>

      {/* How it works */}
      <div className="bg-[#FAF7F0] border border-[#E8DFC8] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-[#9A7818]">
          <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</div>
          <span className="font-semibold">Add Property + Photos</span>
        </div>
        <div className="hidden sm:block text-[#C5A059]">→</div>
        <div className="flex items-center gap-2.5 text-[#9A7818]">
          <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</div>
          <span className="font-semibold">Submit for Review</span>
        </div>
        <div className="hidden sm:block text-[#C5A059]">→</div>
        <div className="flex items-center gap-2.5 text-[#9A7818]">
          <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</div>
          <span className="font-semibold">Admin Approves → Live for All Users</span>
        </div>
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
            const fallbackImg = getPropertyFallbackImage(prop.propertyType, prop.id);
            const primaryImg =
              prop.images?.[0]?.imageUrl
                ? getImageUrl(prop.images[0].imageUrl, fallbackImg)
                : fallbackImg;

            const canEdit = prop.status !== 'REMOVED';
            const canSubmit = prop.status === 'DRAFT' || prop.status === 'REJECTED';

            const isPublished = prop.status === 'PUBLISHED';
            const nowMs = Date.now();
            const expiresMs = prop.expiresAt ? new Date(prop.expiresAt).getTime() : null;
            const isExpired = prop.status === 'EXPIRED' || (isPublished && expiresMs !== null && expiresMs <= nowMs);
            const diffDays = expiresMs !== null ? Math.ceil((expiresMs - nowMs) / (1000 * 60 * 60 * 24)) : null;
            const isExpiringSoon = isPublished && !isExpired && diffDays !== null && diffDays <= 7;
            const canRenew = isExpired || isExpiringSoon;

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-[#E8DFC8] transition overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left: Thumbnail */}
                  <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-900/5 border border-gray-200 relative flex items-center justify-center">
                    {primaryImg ? (
                      <>
                        <img
                          src={primaryImg}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-110 pointer-events-none select-none"
                        />
                        <img
                          src={primaryImg}
                          alt={prop.title}
                          loading="lazy"
                          decoding="async"
                          className="relative z-10 w-full h-full object-contain p-1"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes('indian-properties')) {
                              target.src = fallbackImg;
                            }
                          }}
                        />
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                        <Building2 className="w-6 h-6 text-gray-300" />
                        <span className="text-[10px] font-semibold mt-1">No photo</span>
                      </div>
                    )}
                  </div>

                  {/* Center: Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PropertyStatusBadge status={prop.status} expiresAt={prop.expiresAt} />
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                        {prop.propertyType === 'HOUSE' ? 'House' : 'Commercial'}
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        {prop.plan?.name || (prop.validityDays ? `${prop.validityDays} Days Plan` : 'Deepavali Free Offer')}
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

                    {prop.expiresAt && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>
                          {isExpired ? (
                            <span className="text-purple-700 font-semibold">
                              Expired on {new Date(prop.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          ) : isExpiringSoon ? (
                            <span className="text-amber-700 font-bold">
                              Expires in {diffDays} {diffDays === 1 ? 'day' : 'days'} ({new Date(prop.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})
                            </span>
                          ) : (
                            <span>
                              Valid until {new Date(prop.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ({diffDays} days left)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row sm:flex-col items-center gap-2 sm:shrink-0 sm:pt-1 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">

                    {/* Renew button for Expired or Expiring Soon */}
                    {canRenew && (
                      <button
                        type="button"
                        disabled={renewMutation.isPending && renewingId === prop.id}
                        onClick={() => {
                          setRenewingId(prop.id);
                          renewMutation.mutate(prop.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition whitespace-nowrap disabled:opacity-60"
                        title="Renew listing validity"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${renewMutation.isPending && renewingId === prop.id ? 'animate-spin' : ''}`} />
                        <span>Renew Listing</span>
                      </button>
                    )}

                    {/* Choose Plan & Pay / Upgrade button */}
                    {(canSubmit || prop.status === 'PENDING_APPROVAL') && (
                      <Link
                        to={`/owner/payment?propertyId=${prop.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold text-xs rounded-xl shadow-xs transition hover:brightness-105 whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>{prop.status === 'PENDING_APPROVAL' ? 'Upgrade Plan' : 'Select Plan & Pay'}</span>
                      </Link>
                    )}

                    {/* View Live (if published and not expired) */}
                    {prop.status === 'PUBLISHED' && !isExpired && (
                      <Link
                        to={`/property/${prop.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-xl transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Live</span>
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

                {/* EXPIRED Banner */}
                {isExpired && (
                  <div className="mx-4 mb-4 p-3.5 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between gap-3 text-xs text-purple-900 flex-wrap">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <span className="font-bold block">Listing Expired</span>
                        <span className="text-purple-700">
                          This property is hidden from public seekers. Click Renew Listing to reactivate it immediately!
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={renewMutation.isPending && renewingId === prop.id}
                      onClick={() => {
                        setRenewingId(prop.id);
                        renewMutation.mutate(prop.id);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-105 text-white font-bold rounded-lg transition text-xs shadow-xs disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${renewMutation.isPending && renewingId === prop.id ? 'animate-spin' : ''}`} />
                      <span>Renew Listing Now →</span>
                    </button>
                  </div>
                )}

                {/* EXPIRING SOON Banner */}
                {isExpiringSoon && (
                  <div className="mx-4 mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Listing expires in <strong>{diffDays} {diffDays === 1 ? 'day' : 'days'}</strong> ({new Date(prop.expiresAt!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}). Renew now to keep your listing active without interruption.
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={renewMutation.isPending && renewingId === prop.id}
                      onClick={() => {
                        setRenewingId(prop.id);
                        renewMutation.mutate(prop.id);
                      }}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition text-xs shadow-xs disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${renewMutation.isPending && renewingId === prop.id ? 'animate-spin' : ''}`} />
                      <span>Renew Early</span>
                    </button>
                  </div>
                )}

                {/* DRAFT Banner — needs to be submitted */}
                {prop.status === 'DRAFT' && (
                  <div className="mx-4 mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900 flex-wrap">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Property saved as draft. Submit for admin review to get it published.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={submitMutation.isPending}
                        onClick={() => submitMutation.mutate(prop.id)}
                        className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:brightness-105 text-white font-bold rounded-lg transition text-xs shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Submit for Admin Review (Free) →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* PENDING_APPROVAL Banner */}
                {prop.status === 'PENDING_APPROVAL' && (
                  <div className="mx-4 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-2.5 text-xs text-blue-800">
                    <Clock className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                    <div>
                      <span className="font-bold block text-blue-900">Under Admin Review</span>
                      <span className="text-blue-700 leading-relaxed">
                        Your property has been submitted and is being reviewed by our team. Once approved, it will be live for all users — even non-registered visitors.
                      </span>
                    </div>
                  </div>
                )}

                {/* PUBLISHED Banner */}
                {prop.status === 'PUBLISHED' && !isExpired && !isExpiringSoon && (
                  <div className="mx-4 mb-4 p-3 bg-green-50 rounded-xl border border-green-200 flex items-start gap-2.5 text-xs text-green-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
                    <div>
                      <span className="font-semibold block">
                        Live & Visible to all users including non-registered visitors across Chennai.
                      </span>
                      {prop.expiresAt && (
                        <span className="text-green-700 block mt-0.5">
                          Active validity: {diffDays} days remaining (expires on {new Date(prop.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}).
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejection Notice Banner */}
                {prop.status === 'REJECTED' && prop.rejectionReason && (
                  <div className="mx-4 mb-4 p-3 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Admin Feedback: </span>
                      <span>{prop.rejectionReason}</span>
                      <p className="mt-1 font-semibold text-red-800">
                        Click 'Edit' to fix the issues, then click 'Submit for Review' again.
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
        message="Are you sure you want to remove this property? It will no longer appear on Veedu Vadagaikku Chennai."
        confirmText="Yes, Remove"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
