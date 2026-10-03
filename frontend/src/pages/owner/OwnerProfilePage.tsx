import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerService } from '../../services/owner.service';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { User, Phone, Mail, ShieldCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const OwnerProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();

  const { data: ownerRes, isLoading } = useQuery({
    queryKey: ['ownerProfile'],
    queryFn: () => ownerService.getProfile(),
  });

  const owner = ownerRes?.data;

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (owner) {
      if (owner.user?.name) setName(owner.user.name);
      if (owner.bio) setBio(owner.bio);
    }
  }, [owner]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await ownerService.updateProfile({ name: name.trim(), bio: bio.trim() });
      updateUser({ name: name.trim() });
      queryClient.invalidateQueries({ queryKey: ['ownerProfile'] });
      toast.success('Owner profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading owner profile..." />;

  return (
    <div className="max-w-3xl space-y-6">
      <SEOHead title="Owner Profile | Veedu Vadagaiku" />

      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Owner Profile</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your landlord details and public profile
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
          <div className="w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center font-extrabold text-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-gray-900">{user?.name}</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Owner
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Managing {owner?._count?.properties || 0} Chennai properties
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Owner Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Verified Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                disabled
                value={user?.mobile || 'Not linked'}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Owner Bio / Description
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Property owner with independent residential units and commercial shops in Anna Nagar and T. Nagar."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
