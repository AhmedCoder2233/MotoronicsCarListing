'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUser } from '@/lib/supabase/auth';
import { Upload, Camera, Car, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { showError, showSuccess } from '@/lib/utils';

// Same filters data as BuyPage for consistency
const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Hyderabad', 'Peshawar', 'Quetta', 'Sialkot',
  'Gujranwala', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana',
  'Sheikhupura', 'Rahim Yar Khan', 'Jhelum', 'Gujrat', 'Mardan',
  'Kasur', 'Dera Ghazi Khan', 'Mingora', 'Nawabshah', 'Sahiwal',
  'Mirpur Khas', 'Chiniot', 'Kamoke', 'Hafizabad', 'Kohat',
  'Jhang', 'Khanewal', 'Dera Ismail Khan', 'Turbat', 'Muzaffargarh',
  'Abbottabad', 'Mandi Bahauddin', 'Shikarpur', 'Jacobabad', 'Khuzdar',
  'Pakpattan', 'Gojra', 'Kharian', 'Nowshera', 'Charsadda'
];

const POPULAR_BRANDS = [
  'Toyota', 'Honda', 'Suzuki', 'BMW', 'Mercedes-Benz',
  'Audi', 'Hyundai', 'Kia', 'Nissan', 'Mitsubishi',
  'MG', 'Changan', 'FAW', 'Proton', 'Volkswagen'
];

const BODY_TYPES = [
  'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible',
  'Wagon', 'Van', 'Pickup', 'Minivan', 'Crossover'
];

const COLORS = [
  'White', 'Black', 'Silver', 'Gray', 'Blue',
  'Red', 'Green', 'Brown', 'Yellow', 'Orange'
];

const FEATURES = [
  'Power Steering', 'Power Windows', 'Power Mirrors', 'Air Conditioning',
  'ABS Brakes', 'Airbags', 'Alloy Wheels', 'Sunroof', 'Cruise Control',
  'Navigation System', 'Bluetooth', 'Backup Camera', 'Parking Sensors',
  'Leather Seats', 'Heated Seats', 'Third Row Seating', 'Roof Rails',
  'Fog Lights', 'Xenon Lights', 'Keyless Entry', 'Push Start'
];

const ASSEMBLY_TYPES = ['Local', 'Imported'];
const REGISTERED_IN = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'AJK', 'Gilgit'];

export default function SellPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form data based on your table structure
  const [formData, setFormData] = useState({
    // Basic Information
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    
    // Technical Details
    engine_capacity: '',
    body_type: '',
    assembly: '',
    color: '',
    condition: 'Good',
    
    // Location & Registration
    location: '',
    registered_in: '',
    
    // Description & Features
    description: '',
    features: [] as string[],
    
    // Owner Information
    owner_name: '',
    owner_phone: '',
    owner_email: '',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Same options as BuyPage
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
  const transmissions = ['Manual', 'Automatic'];
  const conditions = ['Excellent', 'Good', 'Fair', 'New'];

  useEffect(() => {
    checkUserVerification();
  }, []);

  const checkUserVerification = async () => {
    const currentUser = await getUser();
    if (!currentUser) {
      router.push('/');
      return;
    }

    setUser(currentUser);

    const supabase = createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_verified')
      .eq('id', currentUser.id)
      .single();

    setIsVerified(profile?.is_verified || false);
    setLoading(false);
    
    // Pre-fill user information
    setFormData(prev => ({
      ...prev,
      owner_name: currentUser.user_metadata?.full_name || '',
      owner_email: currentUser.email || '',
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      showError('Maximum 10 images allowed');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    showSuccess(`Added ${files.length} image(s)`);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    
    showSuccess('Image removed');
  };

  const uploadImages = async (carId: string) => {
    const supabase = createClient();
    const imageUrls = [];

    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${carId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(fileName);

      imageUrls.push(publicUrl);
    }

    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      showError('Please verify your account first before listing a car');
      router.push('/verify');
      return;
    }

    if (images.length === 0) {
      showError('Please upload at least one image of the car');
      return;
    }

    // Validate required fields
    const requiredFields = [
      'brand', 'model', 'price', 'fuel_type', 'transmission',
      'location', 'owner_name', 'owner_phone'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        showError(`Please fill in ${field.replace('_', ' ')}`);
        return;
      }
    }

    setUploading(true);

    try {
      const supabase = createClient();

      // Prepare car data
      const carData = {
        user_id: user.id,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year.toString()),
        price: parseFloat(formData.price.replace(/,/g, '')),
        mileage: formData.mileage ? parseInt(formData.mileage.replace(/,/g, '')) : null,
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        engine_capacity: formData.engine_capacity ? parseInt(formData.engine_capacity) : null,
        condition: formData.condition,
        body_type: formData.body_type || null,
        assembly: formData.assembly || null,
        color: formData.color || null,
        location: formData.location,
        registered_in: formData.registered_in || null,
        owner_name: formData.owner_name.trim(),
        owner_phone: formData.owner_phone.trim(),
        owner_email: formData.owner_email.trim(),
        description: formData.description.trim() || null,
        features: formData.features.length > 0 ? formData.features : null,
        is_sold: false,
        views: 0,
        is_featured: false,
        is_verified: false, // Will be verified by admin
      };

      // First, create the car record
      const { data: car, error: carError } = await supabase
        .from('cars')
        .insert(carData)
        .select()
        .single();

      if (carError) throw carError;

      // Upload images
      const imageUrls = await uploadImages(car.id);

      // Update car with image URLs
      const { error: updateError } = await supabase
        .from('cars')
        .update({ images: imageUrls })
        .eq('id', car.id);

      if (updateError) throw updateError;

      showSuccess('Car listed successfully! It will appear in search results after verification.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error listing car:', error);
      showError(error.message || 'Failed to list car. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Verification Alert */}
          {!isVerified && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-yellow-800 font-medium">Account Verification Required</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    You need to verify your account before listing a car for sale. 
                    <a href="/verify" className="ml-2 font-semibold underline">
                      Verify Now
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-8">
              <Car className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sell Your Car</h1>
                <p className="text-gray-600 mt-1">Fill in all required details for better visibility</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Car Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand *
                    </label>
                    <select
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select Brand</option>
                      {POPULAR_BRANDS.sort().map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    {formData.brand === 'Other' && (
                      <input
                        type="text"
                        placeholder="Enter brand name"
                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    )}
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., Corolla, Civic, Fortuner"
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <select
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {Array.from({length: 35}, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (Rs) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., 2,500,000"
                    />
                  </div>

                  {/* Mileage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mileage (km)
                    </label>
                    <input
                      type="text"
                      value={formData.mileage}
                      onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., 45,000"
                    />
                  </div>

                  {/* Engine Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engine Capacity (cc)
                    </label>
                    <input
                      type="number"
                      value={formData.engine_capacity}
                      onChange={(e) => setFormData({...formData, engine_capacity: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., 1500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  Technical Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fuel Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type *
                    </label>
                    <select
                      required
                      value={formData.fuel_type}
                      onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {fuelTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Transmission */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transmission *
                    </label>
                    <select
                      required
                      value={formData.transmission}
                      onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {transmissions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Body Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Type
                    </label>
                    <select
                      value={formData.body_type}
                      onChange={(e) => setFormData({...formData, body_type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select Body Type</option>
                      {BODY_TYPES.sort().map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Assembly */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assembly
                    </label>
                    <select
                      value={formData.assembly}
                      onChange={(e) => setFormData({...formData, assembly: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select Assembly</option>
                      {ASSEMBLY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select Color</option>
                      {COLORS.sort().map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    {formData.color === 'Other' && (
                      <input
                        type="text"
                        placeholder="Enter color"
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    )}
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      required
                      value={formData.condition}
                      onChange={(e) => setFormData({...formData, condition: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location & Registration */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  Location & Registration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <select
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select City</option>
                      {PAKISTAN_CITIES.sort().map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Registered In */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registered In (Province)
                    </label>
                    <select
                      value={formData.registered_in}
                      onChange={(e) => setFormData({...formData, registered_in: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select Province</option>
                      {REGISTERED_IN.sort().map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  Features
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {FEATURES.map(feature => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => handleFeatureToggle(feature)}
                      className={`flex items-center px-4 py-2 rounded-lg border ${
                        formData.features.includes(feature)
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {formData.features.includes(feature) && (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      <span className="text-sm">{feature}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  Description
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Describe your car in detail... (Accident history, maintenance, special features, etc.)"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  Contact Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.owner_name}
                      onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.owner_phone}
                      onChange={(e) => setFormData({...formData, owner_phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., 0300-1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.owner_email}
                      onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  Car Images *
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Camera className="h-4 w-4 mr-2" />
                    <span>Upload clear images from different angles (Max 10 images)</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Upload Button */}
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Add Images</span>
                      <span className="text-xs text-gray-500 mt-1">Click to upload</span>
                    </label>

                    {/* Image Previews */}
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover bg-gray-100 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <button
                  type="submit"
                  disabled={uploading || !isVerified}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white ${
                    !isVerified
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Listing Your Car...
                    </span>
                  ) : !isVerified ? (
                    'Verify Account to List Car'
                  ) : (
                    'List Car For Sale'
                  )}
                </button>
                
                <p className="text-sm text-gray-600 mt-3 text-center">
                  Your listing will be reviewed and appear in search results after verification.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}