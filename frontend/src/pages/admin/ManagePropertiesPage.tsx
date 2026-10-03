import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { PropertyStatusBadge } from '../../components/property/PropertyStatusBadge';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { Search, Eye, Building2, Store, Trash2, PowerOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManagePropertiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminProperties', search, statusFilter, typeFilter],
    queryFn: () =>
      adminService.getProperties({
        search: search || undefined,
        status: statusFilter || undefined,
        propertyType: typeFilter || undefined,
      }),
  });

  const properties = data?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminService.updatePropertyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProperties'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success('Property status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      <SEOHead title="Manage Properties | Veedu Vadagaiku Admin" />

      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          All Platform Properties ({data?.pagination?.total || properties.length})
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Supervise published, draft, pending, and expired houses & shops across Chennai
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title or locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="PAYMENT_PENDING">Payment Pending</option>
          <option value="DRAFT">Draft</option>
          <option value="REJECTED">Rejected</option>
          <option value="EXPIRED">Expired</option>
          <option value="REMOVED">Removed</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="HOUSE">House / Flat</option>
          <option value="SHOP">Commercial Shop</option>
        </select>
      </div>

      {/* Properties Table */}
      {isLoading ? (
        <Loader text="Loading properties..." />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Property</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Locality</th>
                  <th className="p-4">Rent / Deposit</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 line-clamp-1 max-w-xs">{prop.title}</div>
                      <span className="text-[10px] text-gray-400">ID: {prop.id.slice(0, 8)}...</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-700">{prop.propertyType}</span>
                    </td>
                    <td className="p-4 font-semibold text-orange-600">{prop.locality}</td>
                    <td className="p-4">
                      <div className="font-extrabold text-gray-900">
                        ₹{prop.rent.toLocaleString('en-IN')}/mo
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Dep: ₹{prop.deposit.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">
                        {prop.owner?.user?.name || 'Owner'}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {prop.owner?.user?.mobile || ''}
                      </div>
                    </td>
                    <td className="p-4">
                      <PropertyStatusBadge status={prop.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {prop.status === 'PUBLISHED' ? (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatusMutation.mutate({ id: prop.id, status: 'REMOVED' })
                            }
                            className="px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition"
                            title="Unpublish / Remove"
                          >
                            Unpublish
                          </button>
                        ) : prop.status === 'REMOVED' ? (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatusMutation.mutate({ id: prop.id, status: 'PUBLISHED' })
                            }
                            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition"
                          >
                            Re-publish
                          </button>
                        ) : null}
                      </div>
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
