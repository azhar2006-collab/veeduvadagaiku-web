import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
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
  Sparkles,
  Flame,
  IndianRupee,
  Store,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent?: 'gold' | 'wine' | 'emerald' | 'rose' | 'sky' | 'amber';
  sub?: string;
}

const DeepavaliStatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  accent = 'gold',
  sub,
}) => {
  const styles = {
    gold: {
      card: 'bg-gradient-to-br from-[#240a15] to-[#391121] border-[#f59e0b]/30',
      icon: 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30',
      title: 'text-[#fde68a]',
      value: 'text-[#f59e0b]',
      sub: 'text-[#edd8de]',
    },
    wine: {
      card: 'bg-white border-[#e8d5cb]',
      icon: 'bg-[#240a15]/10 text-[#240a15] border border-[#240a15]/20',
      title: 'text-gray-500',
      value: 'text-[#240a15]',
      sub: 'text-gray-500',
    },
    emerald: {
      card: 'bg-white border-[#e8d5cb]',
      icon: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      title: 'text-gray-500',
      value: 'text-emerald-700',
      sub: 'text-gray-500',
    },
    rose: {
      card: 'bg-white border-[#e8d5cb]',
      icon: 'bg-rose-50 text-rose-700 border border-rose-100',
      title: 'text-gray-500',
      value: 'text-rose-700',
      sub: 'text-gray-500',
    },
    sky: {
      card: 'bg-white border-[#e8d5cb]',
      icon: 'bg-sky-50 text-sky-700 border border-sky-100',
      title: 'text-gray-500',
      value: 'text-sky-700',
      sub: 'text-gray-500',
    },
    amber: {
      card: 'bg-white border-[#e8d5cb]',
      icon: 'bg-amber-50 text-amber-700 border border-amber-100',
      title: 'text-gray-500',
      value: 'text-amber-700',
      sub: 'text-gray-500',
    },
  }[accent];

  return (
    <div
      className={`rounded-2xl p-5 border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className={`text-[11px] font-bold uppercase tracking-wider truncate ${styles.title}`}>
            {title}
          </p>
          <h3 className={`text-2xl font-black tracking-tight ${styles.value}`}>{value}</h3>
          {sub && <p className={`text-[11px] font-semibold ${styles.sub}`}>{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${styles.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export const AdminDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  const stats = data?.data;

  if (isLoading) return <Loader fullScreen text="Loading platform statistics..." />;

  const pendingApprovalsCount = stats?.properties?.pendingApprovals || 0;

  return (
    <div className="space-y-6 pb-12">
      <SEOHead title="Admin Dashboard | Veedu Vadagaikku Chennai" />

      {/* ── DEEPAVALI FESTIVE HEADER BANNER ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1b0610] via-[#240a15] to-[#2d0c1b] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-[#3d1323]">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-rose-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#fcd34d] text-[11px] font-bold uppercase tracking-widest">
              <Flame className="w-3 h-3 text-[#f59e0b]" />
              <span>Deepavali 2026 Live Offer Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Platform Analytics &amp;{' '}
              <span className="text-[#f59e0b]">Control Centre</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#d4bac6] max-w-lg">
              Supervise active listings, review paid ads, and monitor platform revenue. Deepavali
              Free offer active until{' '}
              <span className="text-[#fcd34d] font-bold">8 Nov 2026</span>.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {pendingApprovalsCount > 0 && (
              <Link
                to="/admin/pending"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-[#eab308] text-[#1b0610] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/30 transition animate-pulse"
              >
                <Clock className="w-4 h-4" />
                <span>{pendingApprovalsCount} Listings Awaiting Review</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              to="/plans"
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#391121] hover:bg-[#4a162c] text-[#f59e0b] border border-[#f59e0b]/30 font-bold text-xs rounded-xl transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>View Live Deepavali Offer Page</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── DEEPAVALI OFFER STATUS STRIP ── */}
      <div className="bg-gradient-to-r from-amber-50 via-[#fff8ed] to-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#92400e] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-black text-[#92400e] uppercase tracking-wider">
              Deepavali 2026 Free Listing Offer — Currently Active
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              All listings posted on or before 8 Nov 2026 are being accepted at ₹0. Post-offer pricing: Residential ₹99 · Commercial ₹555 · Hall ₹1,000 · Service ₹444
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span className="text-xs font-bold text-emerald-700">Live</span>
        </div>
      </div>

      {/* ── KEY METRIC STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DeepavaliStatCard title="Total Users" value={stats?.users?.total || 0} icon={Users} accent="sky" sub="Registered seekers & owners" />
        <DeepavaliStatCard title="Property Owners" value={stats?.users?.owners || 0} icon={ShieldCheck} accent="wine" sub="Active advertisers" />
        <DeepavaliStatCard title="Active Published" value={stats?.properties?.PUBLISHED || 0} icon={CheckCircle2} accent="emerald" sub="Live & visible listings" />
        <DeepavaliStatCard title="Pending Approvals" value={pendingApprovalsCount} icon={Clock} accent="gold" sub="Awaiting admin review" />
        <DeepavaliStatCard title="Rejected / Issues" value={stats?.properties?.REJECTED || 0} icon={AlertTriangle} accent="rose" sub="Need attention" />
        <DeepavaliStatCard title="Total Payments" value={stats?.payments?.total || 0} icon={CreditCard} accent="wine" sub="Gateway transactions" />
        <DeepavaliStatCard title="Platform Revenue" value={`₹${(stats?.payments?.revenue || 0).toLocaleString('en-IN')}`} icon={TrendingUp} accent="emerald" sub="Total collected revenue" />
        <DeepavaliStatCard title="Total Properties" value={stats?.properties?.total || 0} icon={Building2} accent="amber" sub="Across Chennai pincodes" />
      </div>

      {/* ── TABLES: Recent Properties & Payments ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white rounded-3xl p-6 border border-[#e8d5cb] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0e6dc]">
            <div>
              <h3 className="font-extrabold text-base text-[#240a15]">Recent Property Submissions</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Latest listings pending review or published</p>
            </div>
            <Link to="/admin/properties" className="text-xs font-bold text-[#8b263e] hover:text-[#240a15] flex items-center gap-1 transition">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {stats?.recentProperties?.length ? (
              stats.recentProperties.map((prop) => (
                <div key={prop.id} className="p-3.5 bg-[#faf6ef] rounded-2xl flex items-center justify-between text-xs border border-[#f0e4d4]/60 hover:border-[#e8d5cb] transition">
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#240a15] truncate max-w-xs">{prop.title}</h4>
                    <p className="text-gray-500 mt-0.5">{prop.locality}, Chennai • ₹{prop.rent.toLocaleString('en-IN')}/mo</p>
                  </div>
                  <span className={`font-bold px-2.5 py-1 rounded-full text-[10px] shrink-0 ml-2 border ${prop.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : prop.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {prop.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No recent submissions</div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-3xl p-6 border border-[#e8d5cb] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0e6dc]">
            <div>
              <h3 className="font-extrabold text-base text-[#240a15]">Recent Gateway Transactions</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Latest payment gateway activity</p>
            </div>
            <Link to="/admin/payments" className="text-xs font-bold text-[#8b263e] hover:text-[#240a15] flex items-center gap-1 transition">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {stats?.recentPayments?.length ? (
              stats.recentPayments.map((pay) => (
                <div key={pay.id} className="p-3.5 bg-[#faf6ef] rounded-2xl flex items-center justify-between text-xs border border-[#f0e4d4]/60 hover:border-[#e8d5cb] transition">
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#240a15]">{pay.plan?.name} Plan</h4>
                    <p className="text-gray-500 truncate max-w-xs mt-0.5">{pay.property?.title}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="font-black text-emerald-700 block">₹{pay.amount}</span>
                    <span className={`text-[10px] font-semibold ${pay.paymentStatus === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {pay.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No recent payments</div>
            )}
          </div>
        </div>
      </div>

      {/* ── QUICK LINKS ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Manage Properties', to: '/admin/properties', icon: Building2 },
          { label: 'Manage Owners', to: '/admin/owners', icon: ShieldCheck },
          { label: 'Listing Plans', to: '/admin/plans', icon: IndianRupee },
          { label: 'All Enquiries', to: '/admin/enquiries', icon: Store },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#e8d5cb] hover:border-[#f59e0b]/50 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="p-2 rounded-xl bg-[#240a15]/5 group-hover:bg-[#f59e0b]/15 transition">
              <item.icon className="w-4 h-4 text-[#240a15] group-hover:text-[#92400e]" />
            </div>
            <span className="text-xs font-bold text-[#240a15] group-hover:text-[#8b263e] transition">{item.label}</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400 ml-auto group-hover:text-[#f59e0b] group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
};


