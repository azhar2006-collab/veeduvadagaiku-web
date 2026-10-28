import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../services/property.service';
import { useLocalities } from '../../hooks/useProperties';
import { CHENNAI_LOCALITIES } from '../../utils/chennaiLocalities';
import { ImageUploader } from '../../components/property/ImageUploader';
import { Loader } from '../../components/common/Loader';
import { SEOHead } from '../../components/common/SEOHead';
import { Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const EditPropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: localitiesData } = useLocalities();
  const localities = (Array.isArray(localitiesData) && localitiesData.length > 0) ? localitiesData : CHENNAI_LOCALITIES;

  const { data: propRes, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyById(id || ''),
    enabled: !!id,
  });

  const property = propRes?.data;

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [propertySize, setPropertySize] = useState('');
  const [bedrooms, setBedrooms] = useState('2');
  const [furnishing, setFurnishing] = useState<'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED'>('UNFURNISHED');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (property) {
      setTitle(property.title);
      setDescription(property.description);
      setRent(String(property.rent));
      setDeposit(String(property.deposit));
      setLocality(property.locality);
      setAddress(property.address);
      setPropertySize(String(property.propertySize));
      if (property.bedrooms) setBedrooms(String(property.bedrooms));
      setFurnishing(property.furnishing);
    }
  }, [property]);

  const handleDeleteImage = async (imageId: string) => {
    if (!id) return;
    try {
      await propertyService.deleteImage(id, imageId);
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!id || !property?.images) return;
    try {
      const reordered = property.images.map((img) => ({
        id: img.id,
        displayOrder: img.id === imageId ? 0 : 1,
        isPrimary: img.id === imageId,
      }));
      await propertyService.reorderImages(id, reordered);
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      toast.success('Primary photo updated');
    } catch {
      toast.error('Failed to set primary photo');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const remainingImages = property?.images?.length || 0;
    if (remainingImages === 0 && files.length === 0) {
      toast.error('Please upload at least 1 photo of your property');
      return;
    }

    try {
      setIsSubmitting(true);
      await propertyService.updateProperty(id, {
        title: title.trim(),
        description: description.trim(),
        rent: parseFloat(rent),
        deposit: parseFloat(deposit),
        locality,
        address: address.trim(),
        propertySize: parseFloat(propertySize),
        bedrooms: property?.propertyType === 'HOUSE' ? parseInt(bedrooms) : null,
        furnishing,
      });

      if (files.length > 0) {
        await propertyService.uploadImages(id, files);
      }

      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      toast.success('Property updated successfully!');
      navigate('/owner/properties');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update property');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading property details..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <SEOHead title={`Edit Property | Veedu Vadagaikku Chennai`} />

      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <button
          onClick={() => navigate('/owner/properties')}
          className="p-2 hover:bg-gray-100 rounded-xl transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Edit Property Listing
          </h1>
          <p className="text-xs text-gray-500">Update pricing, description, or upload new photos</p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Property Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Monthly Rent (₹)
                </label>
                <span className="text-[10px] text-gray-400 font-medium">No limit (₹1 to Infinity)</span>
              </div>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 50000+"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Deposit (₹)
              </label>
              <input
                type="number"
                required
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Chennai Locality
              </label>
              <select
                required
                value={
                  localities.includes(locality)
                    ? locality
                    : (localities.find((l) => l.toLowerCase().startsWith(locality.toLowerCase())) || locality)
                }
                onChange={(e) => setLocality(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              >
                <option value="">Select Chennai Area</option>
                {locality && !localities.includes(locality) && !localities.some((l) => l.toLowerCase().startsWith(locality.toLowerCase())) && (
                  <option value={locality}>{locality}</option>
                )}
                {localities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Size (Sq.Ft)
              </label>
              <input
                type="number"
                required
                value={propertySize}
                onChange={(e) => setPropertySize(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Full Physical Address (Optional - Defaults to Locality, Chennai)
            </label>
            <textarea
              rows={2}
              placeholder="Door No, Street, Landmark, Chennai (Optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Photos section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Manage Property Photos
          </label>
          <ImageUploader
            existingImages={property?.images || []}
            newFiles={files}
            onFilesChange={setFiles}
            onDeleteExisting={handleDeleteImage}
            onSetPrimaryExisting={handleSetPrimaryImage}
          />
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/owner/properties')}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? 'Saving Changes...' : 'Save & Update'}
          </button>
        </div>
      </form>
    </div>
  );
};
