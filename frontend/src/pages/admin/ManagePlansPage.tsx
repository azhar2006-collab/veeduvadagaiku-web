import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { ListingPlan } from '../../types';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import {
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
  Check,
  Tag,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ManagePlansPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ListingPlan | null>(null);
  const [filterTab, setFilterTab] = useState<'ACTIVE' | 'ALL'>('ACTIVE');

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [durationDays, setDurationDays] = useState('60');
  const [description, setDescription] = useState('');
  const [featuresStr, setFeaturesStr] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['adminPlans'],
    queryFn: () => adminService.getPlans(),
  });

  const allPlans = data?.data || [];
  const activePlans = allPlans.filter((p) => p.isActive);
  const displayedPlans = filterTab === 'ACTIVE' ? activePlans : allPlans;

  const openCreate = () => {
    setEditingPlan(null);
    setName('');
    setPrice('99');
    setDurationDays('60');
    setDescription('');
    setFeaturesStr('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (plan: ListingPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(String(plan.price));
    setDurationDays(String(plan.durationDays));
    setDescription(plan.description);
    setFeaturesStr(plan.features?.join('\n') || '');
    setIsActive(plan.isActive);
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Partial<ListingPlan> = {
        name: name.trim(),
        price: parseFloat(price) || 0,
        durationDays: parseInt(durationDays) || 60,
        description: description.trim(),
        isActive,
        features: featuresStr
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      };

      if (editingPlan) {
        return adminService.updatePlan(editingPlan.id, payload);
      } else {
        return adminService.createPlan(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      queryClient.invalidateQueries({ queryKey: ['listingPlans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success(editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
      setModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminService.updatePlan(id, { isActive: active }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      queryClient.invalidateQueries({ queryKey: ['listingPlans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success(vars.active ? 'Plan activated' : 'Plan deactivated');
    },
    onError: () => toast.error('Failed to update plan status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      queryClient.invalidateQueries({ queryKey: ['listingPlans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast.success('Plan deactivated');
    },
    onError: () => toast.error('Failed to deactivate plan'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a plan name');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <SEOHead title="Manage Listing Plans | Veedu Vadagaikku Chennai Admin" />

      {/* Deepavali Festive Admin Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1b0610] via-[#240a15] to-[#2d0c1b] rounded-3xl p-6 sm:p-8 text-white border border-[#3d1323] shadow-xl">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#391121] border border-[#5a1b34] text-[#fcd34d] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Deepavali 2026 Listing Pricing &amp; Offers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Listing Subscription Plans
            </h1>
            <p className="text-xs sm:text-sm text-[#edd8de] max-w-2xl leading-relaxed">
              Configure owner listing pricing, promotional ₹0 Deepavali festive benefits, and listing durations across residential, commercial, halls, and home services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-2xl bg-[#320e1e]/90 border border-[#52192f] text-left">
              <span className="text-[10px] uppercase font-bold text-[#fcd34d] tracking-wider block">
                Active Offer
              </span>
              <span className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ₹0 till 8 Nov 2026
              </span>
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#f59e0b] hover:bg-[#eab308] text-[#1b0610] font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create New Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="inline-flex items-center p-1 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterTab === 'ACTIVE'
                ? 'bg-[#240a15] text-[#f59e0b] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Plans ({activePlans.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterTab === 'ALL'
                ? 'bg-[#240a15] text-[#f59e0b] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Plans ({allPlans.length})
          </button>
        </div>

        <p className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-800">{displayedPlans.length}</span> plans
        </p>
      </div>

      {isLoading ? (
        <Loader text="Loading plans..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPlans.map((plan) => {
            const isFreeOffer = plan.price === 0 || plan.id.includes('free');
            const isPremiumHall = plan.price >= 1000 || plan.name.toLowerCase().includes('mandapam') || plan.name.toLowerCase().includes('hall');

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 border-2 shadow-sm flex flex-col justify-between space-y-5 transition-all relative overflow-hidden
                  ${isPremiumHall
                    ? 'bg-[#240a15] text-white border-[#f59e0b] shadow-xl'
                    : isFreeOffer
                    ? 'bg-gradient-to-b from-[#fffbeb] to-white border-amber-300 shadow-md'
                    : 'bg-white text-gray-900 border-gray-200'
                  }
                `}
              >
                {/* Top Badge Ribbon */}
                <div className="flex items-center justify-between gap-2">
                  {isFreeOffer ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#f59e0b] text-[#1b0610] shadow-2xs">
                      DEEPAVALI OFFER (100% FREE)
                    </span>
                  ) : isPremiumHall ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#391121] text-[#f59e0b] border border-[#5a1b34]">
                      PREMIUM VENUE
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-[#92400e] border border-amber-200">
                      {plan.name.split('(')[0].trim().toUpperCase()}
                    </span>
                  )}

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      plan.isActive
                        ? isPremiumHall
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Plan Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className={`font-black text-xl tracking-tight leading-snug ${isPremiumHall ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isPremiumHall ? 'text-[#edd8de]' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-baseline gap-2">
                    {isFreeOffer && (
                      <span className={`text-xs line-through font-semibold ${isPremiumHall ? 'text-gray-400' : 'text-gray-400'}`}>
                        ₹99-₹2,500
                      </span>
                    )}
                    <span className={`text-4xl font-black tracking-tight ${isPremiumHall ? 'text-[#f59e0b]' : isFreeOffer ? 'text-[#92400e]' : 'text-gray-900'}`}>
                      ₹{plan.price.toLocaleString('en-IN')}
                    </span>
                    <span className={`text-xs font-semibold ${isPremiumHall ? 'text-[#edd8de]' : 'text-gray-500'}`}>
                      / {plan.durationDays} days
                    </span>
                  </div>

                  {/* Features list */}
                  <div className={`pt-3 border-t ${isPremiumHall ? 'border-[#3d1323]' : 'border-gray-100'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isPremiumHall ? 'text-[#fcd34d]' : 'text-gray-400'}`}>
                      Included Features:
                    </p>
                    <ul className="space-y-2 text-xs">
                      {plan.features?.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                            isPremiumHall
                              ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span className={isPremiumHall ? 'text-gray-200' : 'text-gray-700'}>
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Actions */}
                <div className={`pt-4 border-t flex items-center justify-between gap-2 ${isPremiumHall ? 'border-[#3d1323]' : 'border-gray-100'}`}>
                  <span className={`text-[11px] font-mono ${isPremiumHall ? 'text-gray-400' : 'text-gray-400'}`}>
                    ID: {plan.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(plan)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                        isPremiumHall
                          ? 'bg-[#391121] text-[#fcd34d] hover:bg-[#48162a]'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {plan.isActive ? (
                      <button
                        type="button"
                        onClick={() => toggleActiveMutation.mutate({ id: plan.id, active: false })}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                        title="Deactivate plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleActiveMutation.mutate({ id: plan.id, active: true })}
                        className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1"
                        title="Activate plan"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Activate</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-gray-900">
                {editingPlan ? 'Edit Listing Plan' : 'Create New Listing Plan'}
              </h3>
              <span className="text-xs font-mono text-gray-400">
                {editingPlan ? editingPlan.id : 'NEW_PLAN'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Residential (House / Flat)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Price (₹) — Enter 0 for Free
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="60"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detailed description of who this plan is for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Features (One feature per line)
                </label>
                <textarea
                  rows={5}
                  placeholder="60-Day Validity across Chennai&#10;Up to 10 HD Photos&#10;Direct WhatsApp & Call Leads"
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#f59e0b] font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 pb-1">
                <input
                  type="checkbox"
                  id="plan-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#f59e0b] rounded border-gray-300 focus:ring-[#f59e0b] cursor-pointer"
                />
                <label htmlFor="plan-active" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                  Plan is Active (visible to users on checkout & listing pages)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2.5 bg-[#240a15] hover:bg-[#320e1e] text-[#f59e0b] font-black text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlansPage;
