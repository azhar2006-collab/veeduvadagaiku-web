import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { StatCard } from '../../components/dashboard/StatCard';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import {
  Users,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  const stats = data?.data;

  if (isLoading) return <Loader fullScreen text="Loading platform statistics..." />;

  const pendingApprovalsCount = stats?.properties?.pendingApprovals || 0;

  return (
    <div className="space-y-8 pb-12">
      <SEOHead title="Admin Dashboard | Veedu Vadagaiku" />

      {/* Header Banner */}
      <div className="bg-gray-900 rounded-3xl p-6 sm:p-8 text-white border border-gray-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            Chennai Platform Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Platform Analytics & Control</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Supervise active listings, review paid ads, and monitor Cashfree revenue.
          </p>
        </div>

        {pendingApprovalsCount > 0 && (
          <Link
            to="/admin/pending"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-600/30 transition animate-pulse"
          >
            <Clock className="w-4 h-4" />
            <span>{pendingApprovalsCount} Listings Awaiting Review</span>
          </Link>
        )}
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Property Owners"
          value={stats?.users?.owners || 0}
          icon={ShieldCheck}
          color="purple"
        />
        <StatCard
          title="Active Published"
          value={stats?.properties?.PUBLISHED || 0}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingApprovalsCount}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Rejected / Issues"
          value={stats?.properties?.REJECTED || 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Total Payments"
          value={stats?.payments?.total || 0}
          icon={CreditCard}
          color="purple"
        />
        <StatCard
          title="Total Platform Revenue"
          value={`₹${(stats?.payments?.revenue || 0).toLocaleString('en-IN')}`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Properties"
          value={stats?.properties?.total || 0}
          icon={Building2}
          color="orange"
        />
      </div>

      {/* Tables: Recent Properties & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900">Recent Property Submissions</h3>
            <Link to="/admin/properties" className="text-xs font-bold text-orange-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentProperties?.map((prop) => (
              <div
                key={prop.id}
                className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-gray-900 truncate max-w-xs">{prop.title}</h4>
                  <p className="text-gray-500">
                    {prop.locality}, Chennai • ₹{prop.rent.toLocaleString('en-IN')}/mo
                  </p>
                </div>
                <span className="font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
                  {prop.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900">Recent Gateway Transactions</h3>
            <Link to="/admin/payments" className="text-xs font-bold text-orange-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentPayments?.map((pay) => (
              <div
                key={pay.id}
                className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-gray-900">{pay.plan?.name} Plan Subscription</h4>
                  <p className="text-gray-500 truncate max-w-xs">{pay.property?.title}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 block">₹{pay.amount}</span>
                  <span className="text-[10px] text-gray-400">{pay.paymentStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
