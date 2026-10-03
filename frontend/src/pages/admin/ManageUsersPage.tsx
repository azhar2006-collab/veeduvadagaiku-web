import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { Search, User, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', search, roleFilter],
    queryFn: () =>
      adminService.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
      }),
  });

  const users = data?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' }) =>
      adminService.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  return (
    <div className="space-y-6 pb-12">
      <SEOHead title="Manage Platform Users | Veedu Vadagaiku Admin" />

      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Platform Users ({data?.pagination?.total || users.length})
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Registered tenants, renters, and property owners across Chennai
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="USER">Tenants (Users)</option>
          <option value="OWNER">Property Owners</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      {isLoading ? (
        <Loader text="Loading user directory..." />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Mobile / Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Enquiries Sent</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const isActive = u.status === 'ACTIVE';

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{u.name}</div>
                        <span className="text-[10px] text-gray-400">ID: {u.id.slice(0, 8)}...</span>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="font-medium text-gray-700">{u.mobile || 'No phone'}</div>
                        <div className="text-gray-400">{u.email || ''}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-600">
                        {u._count?.enquiries || 0}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: u.id,
                                status: isActive ? 'SUSPENDED' : 'ACTIVE',
                              })
                            }
                            className={`px-3 py-1 font-bold rounded-lg transition ${
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
