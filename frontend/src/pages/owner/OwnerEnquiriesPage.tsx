import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enquiryService } from '../../services/enquiry.service';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { SEOHead } from '../../components/common/SEOHead';
import { MessageSquare, Phone, User, Check, Clock, CheckCheck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const OwnerEnquiriesPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['ownerEnquiries'],
    queryFn: () => enquiryService.getOwnerEnquiries(),
  });

  const enquiries = data?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      enquiryService.updateEnquiryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerEnquiries'] });
      toast.success('Enquiry status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  return (
    <div className="space-y-6">
      <SEOHead title="Tenant Enquiries | Veedu Vadagaiku" />

      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Tenant Enquiries ({enquiries.length})
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Prospective tenants interested in your Chennai rental properties
        </p>
      </div>

      {isLoading ? (
        <Loader text="Loading tenant enquiries..." />
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No tenant enquiries yet"
          description="When tenants browse your published Chennai houses or shops and submit an enquiry, they will appear here."
        />
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => {
            return (
              <div
                key={enq.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Property: {enq.property?.title}
                    </h3>
                    <p className="text-xs text-orange-600 font-semibold">{enq.property?.locality}, Chennai</p>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Tenant detail */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>{enq.user?.name || 'Prospective Tenant'}</span>
                  </div>

                  {(enq.phone || enq.user?.mobile) && (
                    <a
                      href={`tel:${enq.phone || enq.user?.mobile}`}
                      className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{enq.phone || enq.user?.mobile}</span>
                    </a>
                  )}
                </div>

                {/* Enquiry message */}
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                  "{enq.message}"
                </p>

                {/* Status action buttons */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="font-bold text-gray-400">Current Status: {enq.status}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate({ id: enq.id, status: 'REPLIED' })}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition"
                    >
                      Mark as Replied
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate({ id: enq.id, status: 'CLOSED' })}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold rounded-lg transition"
                    >
                      Close Lead
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
