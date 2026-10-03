import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { Search, ShieldCheck, UserX, UserCheck, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageOwnersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminOwners', search],
    queryFn: () => adminService.getOwners({ search: search || undefined }),
  });

  const owners = data?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'ACTIVE' | 'SUSPENDED' }) =>
      adminService.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOwners'] });
      toast.success('Owner status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update owner');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      <SEOHead title="Manage Owners | Veedu Vadagaiku Admin" />

      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Property Owners ({data?.pagination?.total || owners.length})
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Landlords and commercial property owners listing on Veedu Vadagaiku
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search owners by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {isLoading ? (
        <Loader text="Loading owners..." />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Owner Name</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Properties</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Registered On</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {owners.map((owner) => {
                  const user = owner.user;
                  const isActive = user?.status === 'ACTIVE';

                  return (
                    <tr key={owner.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                          <span>{user?.name}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="flex items-center gap-1 text-gray-700 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{user?.mobile || 'No mobile'}</span>
                        </div>
                        {user?.email && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                          {owner._count?.properties || 0} Listed
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {user?.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {user?.createdAt &&
                          new Date(user.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                      </td>
                      <td className="p-4 text-right">
                        {user?.id && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                userId: user.id!,
                                status: isActive ? 'SUSPENDED' : 'ACTIVE',
                              })
                            }
                            className={`px-3 py-1.5 font-bold rounded-lg transition ${
                              isActive
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {isActive ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
