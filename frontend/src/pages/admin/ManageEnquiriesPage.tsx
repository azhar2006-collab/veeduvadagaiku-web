import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { MessageSquare, Phone, User, Building2 } from 'lucide-react';

export const ManageEnquiriesPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminEnquiries'],
    queryFn: () => adminService.getEnquiries(),
  });

  const enquiries = data?.data || [];

  return (
    <div className="space-y-6 pb-12">
      <SEOHead title="Manage Enquiries | Veedu Vadagaiku Admin" />

      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Platform Enquiries ({data?.pagination?.total || enquiries.length})
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Monitor communications between tenants and Chennai property owners
        </p>
      </div>

      {isLoading ? (
        <Loader text="Loading enquiries log..." />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Property</th>
                  <th className="p-4">Tenant (Sender)</th>
                  <th className="p-4">Owner (Recipient)</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold text-gray-900 line-clamp-1 max-w-xs">
                      {enq.property?.title}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{enq.user?.name}</div>
                      <div className="text-[10px] text-gray-400">{enq.phone || enq.user?.mobile}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{enq.owner?.user?.name}</div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="line-clamp-2 text-gray-600 italic">"{enq.message}"</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        {enq.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-500">
                      {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
