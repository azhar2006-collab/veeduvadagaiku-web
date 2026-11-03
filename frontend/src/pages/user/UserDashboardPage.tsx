import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Search, Building2, Store, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFavourites } from '../../hooks/useFavourites';
import { useUserEnquiries } from '../../hooks/useEnquiries';
import { StatCard } from '../../components/dashboard/StatCard';
import { SEOHead } from '../../components/common/SEOHead';
import { ownerService } from '../../services/owner.service';
import toast from 'react-hot-toast';

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { favouriteIds } = useFavourites();
  const { data: enquiriesRes } = useUserEnquiries();
  const enquiries = enquiriesRes?.data || [];
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgradeToOwner = async () => {
    try {
      setUpgrading(true);
      await ownerService.registerOwner();
      updateUser({ role: 'OWNER' });
      toast.success('Successfully activated Property Owner mode!');
      navigate('/owner/dashboard');
    } catch (err: any) {
      updateUser({ role: 'OWNER' });
      navigate('/owner/dashboard');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <SEOHead title="Tenant Dashboard | Veedu Vadagaikku Chennai" />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-200 uppercase tracking-wider">
            Tenant Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Hello, {user?.name || 'Chennai Resident'}!
          </h1>
          <p className="text-xs sm:text-sm text-orange-100 mt-1">
            Track your saved Chennai rentals and enquiry responses from landlords.
          </p>
        </div>

        <Link
          to="/properties"
          className="px-5 py-2.5 bg-gray-950 hover:bg-black text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition whitespace-nowrap flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" />
          <span>Search Rentals</span>
        </Link>
      </div>
 
      {/* Property Owner Switch Banner */}
      <div className="bg-[#FAF4E6] border border-[#E8DFC8] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-[#9A7818] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-[#E8DFC8]">
            Are you a Landlord or Service Provider?
          </span>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-1">
            Want to list your house, shop, or home service?
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Switch your account to Property Owner mode to access property posting and the Owner Dashboard.
          </p>
        </div>
        <button
          onClick={handleUpgradeToOwner}
          disabled={upgrading}
          className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:brightness-105 transition shrink-0 whitespace-nowrap"
        >
          {upgrading ? 'Activating...' : 'Switch to Property Owner →'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Saved Properties"
          value={favouriteIds.length}
          icon={Heart}
          color="red"
        />
        <StatCard
          title="Active Enquiries"
          value={enquiries.length}
          icon={MessageSquare}
          color="blue"
        />
      </div>

      {/* Quick Discovery Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-gray-900">Explore Chennai by Category</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/houses"
            className="p-5 rounded-2xl border border-gray-100 bg-orange-50/50 hover:border-orange-300 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition">
                  Houses & Apartments
                </h4>
                <p className="text-xs text-gray-500">1 BHK, 2 BHK, 3 BHK rentals</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/shops"
            className="p-5 rounded-2xl border border-gray-100 bg-amber-50/50 hover:border-amber-300 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition">
                  Commercial Shops
                </h4>
                <p className="text-xs text-gray-500">Retail & prime commercial spots</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
};
