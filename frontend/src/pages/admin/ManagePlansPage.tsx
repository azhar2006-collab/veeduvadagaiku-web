import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { ListingPlan } from '../../types';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { PlusCircle, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManagePlansPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ListingPlan | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [description, setDescription] = useState('');
  const [featuresStr, setFeaturesStr] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminPlans'],
    queryFn: () => adminService.getPlans(),
  });

  const plans = data?.data || [];

  const openCreate = () => {
    setEditingPlan(null);
    setName('');
    setPrice('');
    setDurationDays('30');
    setDescription('');
    setFeaturesStr('');
    setModalOpen(true);
  };

  const openEdit = (plan: ListingPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setPrice(String(plan.price));
    setDurationDays(String(plan.durationDays));
    setDescription(plan.description);
    setFeaturesStr(plan.features?.join('\n') || '');
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        description: description.trim(),
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
      toast.success(editingPlan ? 'Plan updated' : 'Plan created successfully');
      setModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      queryClient.invalidateQueries({ queryKey: ['listingPlans'] });
      toast.success('Plan deactivated');
    },
    onError: () => toast.error('Failed to deactivate plan'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error('Please enter name and price');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6 pb-12">
      <SEOHead title="Manage Listing Plans | Veedu Vadagaiku Admin" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Listing Subscription Plans ({plans.length})
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Configure listing prices, valid durations, and promotional benefits for owners
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create New Plan</span>
        </button>
      </div>

      {isLoading ? (
        <Loader text="Loading plans..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-gray-900">{plan.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      plan.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">
                    / {plan.durationDays} days
                  </span>
                </div>

                <p className="text-xs text-gray-500">{plan.description}</p>

                <ul className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  {plan.features?.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(plan)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                {plan.isActive && (
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(plan.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Deactivate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-gray-900">
              {editingPlan ? 'Edit Listing Plan' : 'Create New Listing Plan'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard 60 Days"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="999"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  placeholder="Short description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Features (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="60-day listing&#10;Up to 8 photos&#10;Priority support"
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
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
