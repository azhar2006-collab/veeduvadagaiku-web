import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { Search, CreditCard, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const ManagePaymentsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminPayments', search, statusFilter],
    queryFn: () =>
      adminService.getPayments({
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const payments = data?.data || [];

  return (
    <div className="space-y-6 pb-12">
      <SEOHead title="Manage Payments | Veedu Vadagaiku Admin" />

      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Transaction Records ({data?.pagination?.total || payments.length})
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Cashfree listing subscription transactions and server-verified payments
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by order or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
        >
          <option value="">All Payment Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {isLoading ? (
        <Loader text="Loading transactions..." />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Transaction / Order ID</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => {
                  const isSuccess = p.paymentStatus === 'SUCCESS';

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <div className="font-mono font-bold text-gray-900">
                          {p.transactionId || p.razorpayPaymentId || 'Awaiting Payment'}
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">
                          Order: {p.cfOrderId || p.razorpayOrderId}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800 line-clamp-1 max-w-xs">
                          {p.property?.title}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{p.user?.name}</div>
                        <div className="text-[10px] text-gray-400">{p.user?.email || ''}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-700">{p.plan?.name}</span>
                      </td>
                      <td className="p-4 font-black text-gray-900 text-sm">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.paymentStatus === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                          <span>{p.paymentStatus}</span>
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
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
