import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService } from '../../services/property.service';
import { useLocalities } from '../../hooks/useProperties';
import { ImageUploader } from '../../components/property/ImageUploader';
import { SEOHead } from '../../components/common/SEOHead';
import {
  Building2,
  Store,
  UploadCloud,
  CheckCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: localitiesRes } = useLocalities();
  const localities = localitiesRes?.data || [];

  // Listing Language state (English or Tamil)
  const [listingLanguage, setListingLanguage] = useState<'EN' | 'TA'>('EN');

  // Form states
  const [propertyType, setPropertyType] = useState<'HOUSE' | 'SHOP'>('HOUSE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [propertySize, setPropertySize] = useState('');
  const [bedrooms, setBedrooms] = useState('2');
  const [rooms, setRooms] = useState('1');
  const [furnishing, setFurnishing] = useState<'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED'>('UNFURNISHED');
  const [availability, setAvailability] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [contactPhone, setContactPhone] = useState(true);
  const [contactWhatsapp, setContactWhatsapp] = useState(true);
  const [contactEnquiry, setContactEnquiry] = useState(true);

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Images to upload
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const houseAmenitiesListEn = [
    '24/7 Metro Water',
    'Covered Car Parking',
    'Two Wheeler Parking',
    'Lift / Elevator',
    'Gated Community Security',
    'Power Backup',
    'Air Conditioner',
    'Modular Kitchen',
    'Balcony',
    'Near Metro Station',
    'Near Bus Stand',
  ];

  const houseAmenitiesListTa = [
    '24/7 குடிநீர் வசதி (Metro Water)',
    'கார் பார்க்கிங் (Car Parking)',
    'இருசக்கர வாகன பார்க்கிங் (Bike Parking)',
    'லிப்ட் வசதி (Lift / Elevator)',
    'பாதுகாப்பு வசதி & CCTV (Security)',
    'பவர் பேக்கப் (Power Backup)',
    'ஏசி வசதி (Air Conditioner)',
    'மாடுலர் சமையலறை (Modular Kitchen)',
    'பால்கனி (Balcony)',
    'மெட்ரோ நிலையம் அருகில் (Near Metro)',
    'பேருந்து நிலையம் அருகில் (Near Bus Stand)',
  ];

  const shopAmenitiesListEn = [
    'Main Road Facing',
    'Heavy Footfall Zone',
    'High Ceiling',
    'Three Phase Electricity',
    'Glass Frontage',
    'Rolling Shutter Installed',
    'Water Connection Inside',
    'Dedicated Customer Parking',
    'Attached Restroom',
    'Loading / Unloading Bay',
  ];

  const shopAmenitiesListTa = [
    'மெயின் ரோடு வசதி (Main Road Facing)',
    'அதிக மக்கள் நடமாட்டம் (Heavy Footfall)',
    'உயரமான கூரை (High Ceiling)',
    '3 பேஸ் மின்சாரம் (Three Phase Power)',
    'கண்ணாடி முகப்பு (Glass Frontage)',
    'ரோலிங் ஷட்டர் (Rolling Shutter)',
    'குடிநீர் இணைப்பு (Water Connection)',
    'வாடிக்கையாளர் பார்க்கிங் (Customer Parking)',
    'இணைக்கப்பட்ட கழிப்பறை (Attached Restroom)',
    'ஏற்றுதல் / இறக்குதல் வசதி (Loading Bay)',
  ];

  const currentAmenities =
    propertyType === 'HOUSE'
      ? listingLanguage === 'TA'
        ? houseAmenitiesListTa
        : houseAmenitiesListEn
      : listingLanguage === 'TA'
      ? shopAmenitiesListTa
      : shopAmenitiesListEn;

  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!locality) {
      toast.error('Please select a Chennai locality');
      return;
    }
    if (files.length === 0) {
      toast.error('Please upload at least 1 photo of the property');
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Create draft property
      const res = await propertyService.createProperty({
        propertyType,
        title: title.trim(),
        description: description.trim(),
        rent: parseFloat(rent),
        deposit: parseFloat(deposit),
        locality,
        address: address.trim(),
        propertySize: parseFloat(propertySize),
        bedrooms: propertyType === 'HOUSE' ? parseInt(bedrooms) : null,
        rooms: propertyType === 'SHOP' ? parseInt(rooms) : null,
        furnishing,
        amenities: listingLanguage === 'TA' ? ['[LANG:TA]', ...selectedAmenities] : selectedAmenities,
        availability: new Date(availability).toISOString(),
        contactPhone,
        contactWhatsapp,
        contactEnquiry,
      });

      const newPropertyId = res.data.id;

      // Step 2: Upload images to Cloudinary via backend
      await propertyService.uploadImages(newPropertyId, files);

      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      toast.success('Property submitted for admin review! We\'ll publish it once approved.');

      // Redirect to my properties page (payment disabled)
      navigate('/owner/properties');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <SEOHead title="Add New Property | Veedu Vadagaiku" />

      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          List Your Chennai Property
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Provide complete details and photos. Once submitted, admin will review and publish your listing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Listing Language Selection */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              1. Listing Language / விளம்பர மொழி
            </label>
            <span className="text-xs font-semibold text-orange-600">
              {listingLanguage === 'TA' ? 'தமிழில் விளம்பரம் தேர்வு செய்யப்பட்டுள்ளது' : 'English listing selected'}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Choose whether this property should be posted in English or தமிழ். If Tamil is selected, your listing will be presented in Tamil with specialized Tamil amenity tags!
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setListingLanguage('EN');
                setSelectedAmenities([]);
              }}
              className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition ${
                listingLanguage === 'EN'
                  ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <span className="text-2xl">🇬🇧</span>
              <div className="text-left">
                <div className="text-sm font-bold">English</div>
                <div className="text-[11px] text-gray-500">Post details in English</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setListingLanguage('TA');
                setSelectedAmenities([]);
              }}
              className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition ${
                listingLanguage === 'TA'
                  ? 'border-[#C59B27] bg-amber-50/50 text-amber-950 font-bold shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <span className="text-2xl">🇮🇳</span>
              <div className="text-left">
                <div className="text-sm font-bold">தமிழ் (Tamil)</div>
                <div className="text-[11px] text-gray-500">தமிழில் பதிவேற்றுக</div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Property Type */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            2. Select Property Type / சொத்து வகை
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setPropertyType('HOUSE');
                setSelectedAmenities([]);
              }}
              className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition ${
                propertyType === 'HOUSE'
                  ? 'border-orange-500 bg-orange-50/50 text-orange-900 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-base">
                  {listingLanguage === 'TA' ? 'குடியிருப்பு வீடு / அபார்ட்மெண்ட்' : 'House / Flat / Villa'}
                </h4>
                <p className="text-xs text-gray-500">
                  {listingLanguage === 'TA' ? 'குடும்பங்கள் மற்றும் பேச்சிலர்களுக்கான வீடுகள்' : 'Residential homes for families & bachelors'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setPropertyType('SHOP');
                setSelectedAmenities([]);
              }}
              className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition ${
                propertyType === 'SHOP'
                  ? 'border-amber-500 bg-amber-50/50 text-amber-900 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Store className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-base">
                  {listingLanguage === 'TA' ? 'வணிக கடை / ஷோரூம்' : 'Commercial Shop'}
                </h4>
                <p className="text-xs text-gray-500">
                  {listingLanguage === 'TA' ? 'சில்லறை கடைகள், வணிக இடங்கள், அலுவலகங்கள்' : 'Retail shops, showrooms, office spaces'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Step 3: Basic Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            3. Property Specifications / விவரங்கள்
          </label>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {listingLanguage === 'TA' ? 'விளம்பர தலைப்பு (Title)' : 'Property Title'}
                </label>
                {listingLanguage === 'TA' && (
                  <span className="text-[11px] text-gray-400 font-medium">விரைவு தலைப்பை தேர்வு செய்யலாம்:</span>
                )}
              </div>

              {listingLanguage === 'TA' && (
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {[
                    '2 BHK தனி வீடு வாடகைக்கு',
                    '3 BHK தனி வீடு வாடகைக்கு',
                    'அபார்ட்மெண்ட் வீடு வாடகைக்கு',
                    'வணிக கடை வாடகைக்கு',
                    'அலுவலக இடம் வாடகைக்கு',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setTitle(chip)}
                      className="px-2.5 py-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200/80 transition font-medium"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                required
                minLength={5}
                placeholder={
                  listingLanguage === 'TA'
                    ? 'எ.கா: அண்ணா நகரில் 2 BHK விசாலமான தனி வீடு வாடகைக்கு'
                    : 'e.g. Spacious 2 BHK Independent House with Car Parking'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="22000"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="100000"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Chennai Locality
                </label>
                <select
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="">Select Chennai Area</option>
                  {localities.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Super Built-up Area (Sq.Ft)
                </label>
                <input
                  type="number"
                  required
                  min={50}
                  placeholder="1150"
                  value={propertySize}
                  onChange={(e) => setPropertySize(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {propertyType === 'HOUSE' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Bedrooms (BHK)
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Number of Rooms / Spaces
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {listingLanguage === 'TA' ? 'முழு முகவரி மற்றும் அடையாளம் (Address)' : 'Full Physical Address (Street, Landmark, Chennai PIN)'}
              </label>
              <textarea
                rows={2}
                required
                minLength={10}
                placeholder={
                  listingLanguage === 'TA'
                    ? 'கதவு எண் 14, 2வது மெயின் ரோடு, சாந்தி தியேட்டர் அருகில், அண்ணா நகர், சென்னை - 600040'
                    : 'Door No. 14, 2nd Main Road, Near Shanti Theatre, Anna Nagar, Chennai - 600040'
                }
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  {listingLanguage === 'TA' ? 'பர்னிச்சர் வசதி (Furnishing)' : 'Furnishing Status'}
                </label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value as any)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="UNFURNISHED">
                    {listingLanguage === 'TA' ? 'வசதிகள் இன்றி (Unfurnished)' : 'Unfurnished'}
                  </option>
                  <option value="SEMI_FURNISHED">
                    {listingLanguage === 'TA' ? 'பகுதி வசதியுடன் (Semi-Furnished)' : 'Semi-Furnished'}
                  </option>
                  <option value="FURNISHED">
                    {listingLanguage === 'TA' ? 'முழு வசதியுடன் (Fully Furnished)' : 'Fully Furnished'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  {listingLanguage === 'TA' ? 'வாடகைக்கு கிடைக்கும் நாள்' : 'Available From Date'}
                </label>
                <input
                  type="date"
                  required
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {listingLanguage === 'TA' ? 'முழு விவரங்கள் (Description)' : 'Detailed Property Description'}
              </label>
              <textarea
                rows={4}
                required
                minLength={20}
                placeholder={
                  listingLanguage === 'TA'
                    ? 'வீட்டின் சிறப்பம்சங்கள், 24 மணி நேர மெட்ரோ குடிநீர் வசதி, கார் பார்க்கிங், அருகிலுள்ள பேருந்து/மெட்ரோ நிலையங்கள், வாடகை நிபந்தனைகள்...'
                    : 'Highlight neighborhood advantages, water sources, natural ventilation, preferred tenants (family/professionals/retail businesses), etc.'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Amenities Checklist */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            3. Amenities & Key Highlights
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currentAmenities.map((amenity) => {
              const isChecked = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold text-left transition ${
                    isChecked
                      ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300'
                    }`}
                  >
                    {isChecked && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Contact Preferences */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            4. Tenant Contact Preferences
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={contactPhone}
                onChange={(e) => setContactPhone(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <span className="text-xs font-semibold text-gray-800">Direct Phone Calling</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <span className="text-xs font-semibold text-gray-800">WhatsApp Redirection</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={contactEnquiry}
                onChange={(e) => setContactEnquiry(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <span className="text-xs font-semibold text-gray-800">In-App Message Enquiry</span>
            </label>
          </div>
        </div>

        {/* Step 5: Photos Upload */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            5. Upload Property Photos
          </label>
          <ImageUploader newFiles={files} onFilesChange={setFiles} maxFiles={10} />
        </div>

        {/* Submit Action */}
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-orange-600 shrink-0" />
            <p className="text-xs text-orange-900 leading-relaxed font-medium">
              After clicking Save, you will be directed to select a Listing Subscription Plan (from ₹499) to verify and submit your property for admin approval.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-600/30 transition active:scale-95 disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Uploading Photos...' : 'Save & Select Plan'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
