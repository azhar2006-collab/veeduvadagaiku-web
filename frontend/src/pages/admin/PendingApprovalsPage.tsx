import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { homeServiceApi, HomeServiceItem } from '../../services/homeService.service';
import { Property } from '../../types';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { SEOHead } from '../../components/common/SEOHead';
import {
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Store,
  MapPin,
  ExternalLink,
  Eye,
  AlertTriangle,
  Wrench,
  Phone,
  Mail,
  Trash2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PendingApprovalsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'services' ? 'services' : 'properties';
  const [activeTab, setActiveTab] = useState<'properties' | 'services'>(initialTab);
  const [rejectingProp, setRejectingProp] = useState<Property | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminPendingProperties'],
    queryFn: () => adminService.getProperties({ status: 'PENDING_APPROVAL' }),
  });

  const { data: servicesData, isLoading: isServicesLoading } = useQuery({
    queryKey: ['adminPendingHomeServices'],
    queryFn: () => homeServiceApi.getServices({ status: 'PENDING' }),
  });

  const properties = data?.data || [];
  const homeServices: HomeServiceItem[] = servicesData?.services || [];

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingProperties'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success('Property approved and published to Chennai public listings!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to approve property');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.rejectProperty(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingProperties'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success('Property rejected with feedback sent to owner');
      setRejectingProp(null);
      setRejectReason('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject property');
    },
  });

  const approveServiceMutation = useMutation({
    mutationFn: (id: string) => homeServiceApi.updateStatus(id, 'PUBLISHED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingHomeServices'] });
      queryClient.invalidateQueries({ queryKey: ['homeServices'] });
      toast.success('Home Service approved and published live!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to approve service');
    },
  });

  const rejectServiceMutation = useMutation({
    mutationFn: (id: string) => homeServiceApi.updateStatus(id, 'REJECTED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingHomeServices'] });
      toast.success('Home Service rejected.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to reject service');
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => homeServiceApi.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingHomeServices'] });
      toast.success('Home Service deleted.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to delete service');
    },
  });

  const handleTabChange = (tab: 'properties' | 'services') => {
    setActiveTab(tab);
    setSearchParams(tab === 'services' ? { tab: 'services' } : {});
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProp) return;
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    rejectMutation.mutate({ id: rejectingProp.id, reason: rejectReason.trim() });
  };

  return (
    <div className="space-y-6 pb-12">
      <SEOHead title="Review Pending Approvals | Veedu Vadagaikku Chennai Admin" />

      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
          <Clock className="w-4 h-4" />
          <span>Moderation Queue</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
          {activeTab === 'properties'
            ? `Paid Properties Awaiting Admin Review (${properties.length})`
            : `Home Services Awaiting Admin Review (${homeServices.length})`}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {activeTab === 'properties'
            ? 'These properties have completed verified payment and require your verification before becoming visible publicly in Chennai.'
            : 'Review incoming home service listings submitted by owners/providers and approve them to display live on the Home Services page.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => handleTabChange('properties')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'properties'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Rental Properties</span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'properties' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {properties.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('services')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'services'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Home Services</span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'services' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {homeServices.length}
          </span>
        </button>
      </div>

      {/* Properties Tab Content */}
      {activeTab === 'properties' && (
        isLoading ? (
          <Loader text="Loading pending listings..." />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All caught up!"
          description="There are currently no paid listings waiting in the approval queue."
        />
      ) : (
        <div className="space-y-6">
          {properties.map((prop) => {
            const primaryImg =
              prop.images?.[0]?.imageUrl ||
              '/properties/property-1.png';

            return (
              <div
                key={prop.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-200 shadow-lg space-y-6"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-lg">
                      {prop.propertyType}
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                      Payment Verified
                    </span>
                    <span className="text-xs text-gray-400">
                      Submitted on{' '}
                      {new Date(prop.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => approveMutation.mutate(prop.id)}
                      disabled={approveMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Publish</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRejectingProp(prop)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs rounded-xl border border-red-200 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Ad</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Photo Thumbnail */}
                  <div className="space-y-2">
                    <img
                      src={primaryImg}
                      alt=""
                      className="w-full aspect-[4/3] rounded-2xl object-cover bg-gray-100 shadow-sm"
                    />
                    <p className="text-[11px] text-gray-400 text-center">
                      {prop.images?.length || 1} photo(s) uploaded
                    </p>
                  </div>

                  {/* Property Specs */}
                  <div className="md:col-span-2 space-y-3 text-xs text-gray-600">
                    <h2 className="text-lg font-black text-gray-900 leading-snug">{prop.title}</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <span className="text-gray-400 block font-bold">Rent</span>
                        <span className="font-extrabold text-sm text-gray-900">
                          ₹{prop.rent.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold">Deposit</span>
                        <span className="font-extrabold text-sm text-gray-900">
                          ₹{prop.deposit.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold">Locality</span>
                        <span className="font-bold text-orange-600">{prop.locality}, Chennai</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold">Size</span>
                        <span className="font-bold text-gray-800">{prop.propertySize} sq.ft</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold">Configuration</span>
                        <span className="font-bold text-gray-800">
                          {prop.bedrooms ? `${prop.bedrooms} BHK` : `${prop.rooms || 1} Room(s)`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold">Furnishing</span>
                        <span className="font-bold text-gray-800 capitalize">
                          {prop.furnishing.replace('_', ' ').toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-gray-700">Full Physical Address: </span>
                      <span>{prop.address}</span>
                    </div>

                    <div>
                      <span className="font-bold text-gray-700">Description: </span>
                      <p className="mt-1 line-clamp-3 leading-relaxed">{prop.description}</p>
                    </div>

                    {prop.owner?.user && (
                      <div className="pt-2 border-t border-gray-100 text-gray-500 flex items-center gap-4">
                        <span>
                          Owner: <strong>{prop.owner.user.name}</strong>
                        </span>
                        {prop.owner.user.mobile && (
                          <span>
                            Contact: <strong>{prop.owner.user.mobile}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )
    )}

      {/* Home Services Tab Content */}
      {activeTab === 'services' && (
        isServicesLoading ? (
          <Loader text="Loading pending home services..." />
        ) : homeServices.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="All caught up!"
            description="There are currently no home services waiting in the approval queue."
          />
        ) : (
          <div className="space-y-6">
            {homeServices.map((svc) => (
              <div
                key={svc.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-200 shadow-lg space-y-5"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-lg">
                      {svc.category}
                    </span>
                    {svc.subcategory && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                        {svc.subcategory}
                      </span>
                    )}
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-800 text-xs font-bold rounded-lg border border-yellow-200">
                      Pending Review
                    </span>
                    <span className="text-xs text-gray-400">
                      Submitted on{' '}
                      {new Date(svc.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => approveServiceMutation.mutate(svc.id)}
                      disabled={approveServiceMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Publish</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => rejectServiceMutation.mutate(svc.id)}
                      disabled={rejectServiceMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs rounded-xl border border-red-200 transition disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this service listing permanently?')) {
                          deleteServiceMutation.mutate(svc.id);
                        }
                      }}
                      disabled={deleteServiceMutation.isPending}
                      className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                      {svc.title}
                    </h2>
                    <div className="flex items-center gap-1 text-gray-500 font-medium mt-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>Locality: {svc.locality}, Chennai</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 border-y border-gray-100 font-semibold text-gray-600">
                    <div>
                      Pricing:{' '}
                      <span className="text-amber-700 font-black">{svc.pricing}</span>
                    </div>
                    {svc.priceFrom && (
                      <div>
                        Starting from:{' '}
                        <span className="text-emerald-700 font-black">₹{svc.priceFrom.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {svc.experience && (
                      <div>
                        Experience:{' '}
                        <span className="text-gray-800 font-bold">{svc.experience} Years</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-gray-700">Description: </span>
                    <p className="mt-1 leading-relaxed text-gray-600 whitespace-pre-line">{svc.description}</p>
                  </div>

                  {svc.serviceAreas && svc.serviceAreas.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="font-bold text-gray-700 mr-1">Areas Covered:</span>
                      {svc.serviceAreas.map((area, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px]">
                          {area}
                        </span>
                      ))}
                    </div>
                  )}

                  {svc.features && svc.features.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="font-bold text-gray-700 mr-1">Highlights:</span>
                      {svc.features.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[11px] font-medium">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-6 text-gray-600">
                    <span>
                      Provider: <strong className="text-gray-900">{svc.providerName}</strong>
                    </span>
                    <a
                      href={`tel:${svc.phone}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{svc.phone}</span>
                    </a>
                    {svc.email && (
                      <a
                        href={`mailto:${svc.email}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{svc.email}</span>
                      </a>
                    )}
                    {svc.whatsapp && (
                      <span>WhatsApp: <strong className="text-emerald-700">{svc.whatsapp}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Rejection Modal */}
      {rejectingProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-black text-gray-900">Reject Property Listing</h3>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Please enter the reason for rejecting <strong>"{rejectingProp.title}"</strong>. The owner will see this feedback and can edit & resubmit.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={4}
                required
                placeholder="e.g. Unclear property photos, incorrect address format, or invalid rental pricing."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingProp(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectMutation.isPending}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
