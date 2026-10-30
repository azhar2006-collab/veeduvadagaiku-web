import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  myWantedSpaces, markWantedSpaceFulfilled, deleteWantedSpace, renewWantedSpace,
  initiateWantedSpacePayment, WantedSpace,
} from '../../services/wantedSpace.service';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Plus, CheckCircle, Trash2, RefreshCw, CreditCard, Edit, Clock, Eye,
} from 'lucide-react';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  DRAFT:            { label: 'Draft',           cls: 'bg-gray-100 text-gray-600' },
  PAYMENT_PENDING:  { label: 'Payment Pending',  cls: 'bg-yellow-100 text-yellow-700' },
  PENDING_APPROVAL: { label: 'Under Review',     cls: 'bg-blue-100 text-blue-700' },
  PUBLISHED:        { label: 'Published',        cls: 'bg-green-100 text-green-700' },
  FULFILLED:        { label: 'Fulfilled',        cls: 'bg-purple-100 text-purple-700' },
  EXPIRED:          { label: 'Expired',          cls: 'bg-red-100 text-red-600' },
  REMOVED:          { label: 'Removed',          cls: 'bg-gray-100 text-gray-500' },
  REJECTED:         { label: 'Rejected',         cls: 'bg-red-100 text-red-700' },
};

export default function MyWantedSpacesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-wanted-spaces'],
    queryFn: () => myWantedSpaces({ limit: 50 }),
    enabled: !!user,
  });

  const spaces: WantedSpace[] = data?.data || [];

  const fulfillMut = useMutation({
    mutationFn: (id: string) => markWantedSpaceFulfilled(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-wanted-spaces'] }); toast.success('Marked as fulfilled'); },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteWantedSpace(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-wanted-spaces'] }); toast.success('Deleted'); setDeletingId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  const renewMut = useMutation({
    mutationFn: (id: string) => renewWantedSpace(id),
    onSuccess: (data, id) => {
      qc.invalidateQueries({ queryKey: ['my-wanted-spaces'] });
      toast.success('Renewed! Please complete payment.');
      navigate(`/user/wanted-spaces/payment?wantedSpaceId=${id}`);
    },
    onError: () => toast.error('Failed to renew'),
  });

  const payMut = useMutation({
    mutationFn: (id: string) => initiateWantedSpacePayment(id),
    onSuccess: (data, id) => {
      if (data.isFree) {
        qc.invalidateQueries({ queryKey: ['my-wanted-spaces'] });
        toast.success('Submitted for review!');
        return;
      }
      navigate(`/user/wanted-spaces/payment?wantedSpaceId=${id}&session=${data.payment_session_id}&orderId=${data.order_id}&amount=${data.amount}`);
    },
    onError: () => toast.error('Payment initiation failed'),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Requirements</h1>
          <p className="text-sm text-gray-500">Manage your wanted-space listings</p>
        </div>
        <Link
          to="/wanted-spaces/specify"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          <Plus className="w-4 h-4" /> Post New
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}
        </div>
      ) : spaces.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
          <p className="text-gray-400 mb-4">You haven't posted any requirements yet.</p>
          <Link to="/wanted-spaces/specify" className="bg-amber-500 text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-amber-400">
            Post a Requirement
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {spaces.map((s) => {
            const badge = STATUS_BADGE[s.status] || { label: s.status, cls: 'bg-gray-100 text-gray-600' };
            const isActive = s.status === 'PUBLISHED';
            const canPay = s.status === 'DRAFT' || s.status === 'REJECTED';
            const canFulfill = s.status === 'PUBLISHED';
            const canRenew = s.status === 'EXPIRED';
            const canDelete = ['DRAFT', 'REJECTED', 'FULFILLED', 'EXPIRED', 'REMOVED'].includes(s.status);
            const daysLeft = s.expiresAt
              ? Math.max(0, Math.ceil((new Date(s.expiresAt).getTime() - Date.now()) / 86_400_000))
              : null;

            return (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-gray-400">₹{s.paymentAmount} · {s.category?.replace(/_/g, ' ')}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{s.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.preferredLocality ? `${s.preferredLocality}, ` : ''}{s.preferredCity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isActive && (
                      <Link
                        to={`/wanted-spaces/${s.id}`}
                        className="p-1.5 rounded-lg border border-gray-200 hover:border-amber-400 text-gray-500 hover:text-amber-600"
                        title="View public listing"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeletingId(s.id)}
                        className="p-1.5 rounded-lg border border-gray-200 hover:border-red-300 text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expiry */}
                {isActive && daysLeft !== null && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{daysLeft > 0 ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'Expired today'}</span>
                  </div>
                )}

                {/* Rejection reason */}
                {s.status === 'REJECTED' && s.rejectionReason && (
                  <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-3">
                    Rejected: {s.rejectionReason}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {canPay && (
                    <button
                      onClick={() => payMut.mutate(s.id)}
                      disabled={payMut.isPending}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-60"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay ₹{s.paymentAmount}
                    </button>
                  )}
                  {canFulfill && (
                    <button
                      onClick={() => fulfillMut.mutate(s.id)}
                      disabled={fulfillMut.isPending}
                      className="flex items-center gap-1.5 border border-green-400 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-green-50 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Fulfilled
                    </button>
                  )}
                  {canRenew && (
                    <button
                      onClick={() => renewMut.mutate(s.id)}
                      disabled={renewMut.isPending}
                      className="flex items-center gap-1.5 border border-amber-400 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-amber-50 transition-colors disabled:opacity-60"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Renew
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-800 mb-2">Delete Requirement?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMut.mutate(deletingId)}
                disabled={deleteMut.isPending}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white rounded-xl py-2 text-sm font-semibold disabled:opacity-60"
              >
                {deleteMut.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
