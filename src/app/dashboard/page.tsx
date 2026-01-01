'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/client';
import { Plus, Car, Eye, CheckCircle, Edit, Trash2, DollarSign, TrendingUp, X, Upload, Camera, Check, ArrowLeft, Mail, Phone, MapPin, Calendar, Fuel, Settings, Palette, Building, ShieldCheck, Star, Users, Clock, Flag, Hash, Compass, FileText } from 'lucide-react';
import Link from 'next/link';
import { showSuccess, showError, showInfo, showLoading, dismissToast, showConfirm } from '@/lib/utils';

// Filter data same as BuyPage
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Pickup', 'Minivan', 'Crossover'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const TRANSMISSIONS = ['Manual', 'Automatic'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'New'];
const ASSEMBLY_TYPES = ['Local', 'Imported'];
const COLORS = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown', 'Yellow', 'Orange'];
const PAKISTAN_PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'AJK', 'Gilgit'];
const FEATURES = [
  'Power Steering', 'Power Windows', 'Power Mirrors', 'Air Conditioning',
  'ABS Brakes', 'Airbags', 'Alloy Wheels', 'Sunroof', 'Cruise Control',
  'Navigation System', 'Bluetooth', 'Backup Camera', 'Parking Sensors',
  'Leather Seats', 'Heated Seats', 'Third Row Seating', 'Roof Rails',
  'Fog Lights', 'Xenon Lights', 'Keyless Entry', 'Push Start'
];

type CarListing = {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number | null;
  fuel_type: string;
  transmission: string;
  engine_capacity: number | null;
  condition: string;
  body_type: string | null;
  assembly: string | null;
  color: string | null;
  location: string;
  registered_in: string | null;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  images: string[];
  description: string | null;
  features: string[] | null;
  is_sold: boolean;
  views: number;
  is_featured: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string | null;
};

type EditFormData = {
  brand: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  fuel_type: string;
  transmission: string;
  engine_capacity: string;
  condition: string;
  body_type: string;
  assembly: string;
  color: string;
  location: string;
  registered_in: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  description: string;
  features: string[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    soldCars: 0,
    totalViews: 0,
    totalValue: 0,
    verifiedCars: 0,
    featuredCars: 0,
  });

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCar, setEditingCar] = useState<CarListing | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    fuel_type: 'Petrol',
    transmission: 'Manual',
    engine_capacity: '',
    condition: 'Good',
    body_type: '',
    assembly: 'Local',
    color: '',
    location: '',
    registered_in: '',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    description: '',
    features: [],
  });
  const [uploading, setUploading] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const userData = await getUser();
    if (!userData) {
      router.push('/');
      return;
    }

    setUser(userData);

    const supabase = createClient();

    // Get user's cars
    const { data: carsData } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    setCars(carsData || []);

    // Calculate stats
    const totalCars = carsData?.length || 0;
    const availableCars = carsData?.filter(car => !car.is_sold).length || 0;
    const soldCars = totalCars - availableCars;
    const totalViews = carsData?.reduce((sum, car) => sum + (car.views || 0), 0) || 0;
    const totalValue = carsData?.reduce((sum, car) => sum + car.price, 0) || 0;
    const verifiedCars = carsData?.filter(car => car.is_verified).length || 0;
    const featuredCars = carsData?.filter(car => car.is_featured).length || 0;

    setStats({ 
      totalCars, 
      availableCars, 
      soldCars, 
      totalViews, 
      totalValue,
      verifiedCars,
      featuredCars
    });
    setLoading(false);
  };

  const handleDeleteCar = async (carId: string) => {
    const loadingToast = showLoading('Preparing to delete listing...');
    
    const confirmed = await showConfirm(
      'Delete Car Listing',
      'Are you sure you want to delete this listing? This action cannot be undone and will permanently remove the car from our platform.',
      'Delete',
      'Cancel'
    );
    
    if (!confirmed) {
      dismissToast(loadingToast);
      showInfo('Deletion cancelled');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);

      if (error) throw error;

      dismissToast(loadingToast);
      showSuccess('Car listing deleted successfully');
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    } catch (error: any) {
      console.error('Error deleting car:', error);
      dismissToast(loadingToast);
      showError('Failed to delete listing. Please try again.');
    }
  };

  const handleToggleSold = async (carId: string, currentStatus: boolean) => {
    const loadingToast = showLoading('Updating status...');
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('cars')
        .update({ is_sold: !currentStatus })
        .eq('id', carId);

      if (error) throw error;

      dismissToast(loadingToast);
      showSuccess(`Car marked as ${!currentStatus ? 'sold 🎉' : 'available ✅'}`);
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    } catch (error: any) {
      console.error('Error updating car:', error);
      dismissToast(loadingToast);
      showError('Failed to update status. Please try again.');
    }
  };

  // Edit Car Functions
  const openEditModal = (car: CarListing) => {
    setEditingCar(car);
    setEditFormData({
      brand: car.brand || '',
      model: car.model || '',
      year: car.year?.toString() || '',
      price: car.price?.toString() || '',
      mileage: car.mileage?.toString() || '',
      fuel_type: car.fuel_type || 'Petrol',
      transmission: car.transmission || 'Manual',
      engine_capacity: car.engine_capacity?.toString() || '',
      condition: car.condition || 'Good',
      body_type: car.body_type || '',
      assembly: car.assembly || 'Local',
      color: car.color || '',
      location: car.location || '',
      registered_in: car.registered_in || '',
      owner_name: car.owner_name || '',
      owner_phone: car.owner_phone || '',
      owner_email: car.owner_email || user?.email || '',
      description: car.description || '',
      features: car.features || [],
    });
    setEditImages(car.images || []);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCar(null);
    setEditFormData({
      brand: '',
      model: '',
      year: '',
      price: '',
      mileage: '',
      fuel_type: 'Petrol',
      transmission: 'Manual',
      engine_capacity: '',
      condition: 'Good',
      body_type: '',
      assembly: 'Local',
      color: '',
      location: '',
      registered_in: '',
      owner_name: '',
      owner_phone: '',
      owner_email: '',
      description: '',
      features: [],
    });
    setEditImages([]);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setEditFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const newImageUrls = [...editImages];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          showError(`File ${file.name} is not an image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          showError(`Image ${file.name} is too large (max 5MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${editingCar?.id || 'temp'}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('car-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('car-images')
          .getPublicUrl(fileName);

        newImageUrls.push(publicUrl);
      }

      setEditImages(newImageUrls);
      if (newImageUrls.length > editImages.length) {
        showSuccess(`${newImageUrls.length - editImages.length} image(s) uploaded`);
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      showError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCar) return;
    
    if (editImages.length === 0) {
      showError('Please upload at least one image');
      return;
    }

    setUpdating(true);
    const loadingToast = showLoading('Updating car listing...');

    try {
      const supabase = createClient();
      
      const updateData = {
        brand: editFormData.brand.trim(),
        model: editFormData.model.trim(),
        year: parseInt(editFormData.year),
        price: parseFloat(editFormData.price.replace(/,/g, '')),
        mileage: editFormData.mileage ? parseInt(editFormData.mileage) : null,
        fuel_type: editFormData.fuel_type,
        transmission: editFormData.transmission,
        engine_capacity: editFormData.engine_capacity ? parseInt(editFormData.engine_capacity) : null,
        condition: editFormData.condition,
        body_type: editFormData.body_type || null,
        assembly: editFormData.assembly || null,
        color: editFormData.color || null,
        location: editFormData.location.trim(),
        registered_in: editFormData.registered_in || null,
        owner_name: editFormData.owner_name.trim(),
        owner_phone: editFormData.owner_phone.trim(),
        owner_email: editFormData.owner_email.trim(),
        description: editFormData.description.trim() || null,
        features: editFormData.features.length > 0 ? editFormData.features : null,
        images: editImages,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', editingCar.id)
        .eq('user_id', user.id);

      if (error) throw error;

      dismissToast(loadingToast);
      showSuccess('Car listing updated successfully!');
      
      closeEditModal();
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    } catch (error: any) {
      console.error('Error updating car:', error);
      dismissToast(loadingToast);
      showError(error.message || 'Failed to update car listing');
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `Rs.${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `Rs.${(price / 100000).toFixed(1)} Lakh`;
    return `Rs.${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
      {/* Edit Modal */}
      {showEditModal && editingCar && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeEditModal}
            ></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Edit Car: {editingCar.brand} {editingCar.model}
                    </h2>
                    <p className="text-gray-600">Update all car details as needed</p>
                  </div>
                  <button
                    onClick={closeEditModal}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleUpdateCar} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand *
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={editFormData.brand}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., Toyota"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Model *
                        </label>
                        <input
                          type="text"
                          name="model"
                          value={editFormData.model}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., Corolla"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year *
                        </label>
                        <input
                          type="number"
                          name="year"
                          value={editFormData.year}
                          onChange={handleEditInputChange}
                          required
                          min="1990"
                          max={new Date().getFullYear()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (PKR) *
                        </label>
                        <input
                          type="text"
                          name="price"
                          value={editFormData.price}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., 2,500,000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fuel Type *
                        </label>
                        <select
                          name="fuel_type"
                          value={editFormData.fuel_type}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          {FUEL_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transmission *
                        </label>
                        <select
                          name="transmission"
                          value={editFormData.transmission}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          {TRANSMISSIONS.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mileage (km)
                        </label>
                        <input
                          type="text"
                          name="mileage"
                          value={editFormData.mileage}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., 45,000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Engine Capacity (cc)
                        </label>
                        <input
                          type="number"
                          name="engine_capacity"
                          value={editFormData.engine_capacity}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., 1500"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Condition & Features */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Condition & Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Condition *
                        </label>
                        <select
                          name="condition"
                          value={editFormData.condition}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          {CONDITIONS.map(condition => (
                            <option key={condition} value={condition}>{condition}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Body Type
                        </label>
                        <select
                          name="body_type"
                          value={editFormData.body_type}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">Select Body Type</option>
                          {BODY_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assembly
                        </label>
                        <select
                          name="assembly"
                          value={editFormData.assembly}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">Select Assembly</option>
                          {ASSEMBLY_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color
                        </label>
                        <select
                          name="color"
                          value={editFormData.color}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">Select Color</option>
                          {COLORS.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Features
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {FEATURES.map(feature => (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => handleFeatureToggle(feature)}
                            className={`flex items-center px-3 py-2 rounded-lg border text-sm ${
                              editFormData.features.includes(feature)
                                ? 'bg-red-50 border-red-300 text-red-700'
                                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {editFormData.features.includes(feature) && (
                              <Check className="h-3 w-3 mr-2" />
                            )}
                            {feature}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Location & Registration */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Registration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location (City) *
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={editFormData.location}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., Karachi"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registered Province
                        </label>
                        <select
                          name="registered_in"
                          value={editFormData.registered_in}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">Select Province</option>
                          {PAKISTAN_PROVINCES.map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Owner Information */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Owner Name *
                        </label>
                        <input
                          type="text"
                          name="owner_name"
                          value={editFormData.owner_name}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="Enter owner name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="owner_phone"
                          value={editFormData.owner_phone}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., 0300-1234567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="owner_email"
                          value={editFormData.owner_email}
                          onChange={handleEditInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          placeholder="owner@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detailed Description
                      </label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        placeholder="Describe your car in detail..."
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Car Images *</h3>
                    <div className="mb-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Camera className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-3">
                          Upload clear photos of your car (Max 10 images)
                        </p>
                        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          <Upload className="h-4 w-4" />
                          {uploading ? 'Uploading...' : 'Upload Images'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                            multiple
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Current images: {editImages.length} / 10
                        </p>
                      </div>
                    </div>

                    {editImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {editImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Car image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdateCar}
                  disabled={updating}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Update Car
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-red-100">
                Manage your car listings and track your sales
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <Link
                href="/sell"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Sell New Car
              </Link>
              <button
                onClick={() => loadDashboardData()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-800 text-white rounded-lg font-semibold hover:bg-red-900 transition-colors"
              >
                <Check className="h-5 w-5" />
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Cars</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCars}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Car className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                {stats.availableCars} Available
              </span>
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {stats.soldCars} Sold
              </span>
              <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                {stats.verifiedCars} Verified
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Average: {stats.totalCars > 0 ? Math.round(stats.totalViews / stats.totalCars) : 0} views per car
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(stats.totalValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Avg: {stats.totalCars > 0 ? formatPrice(Math.round(stats.totalValue / stats.totalCars)) : 'Rs.0'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Sales Performance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalCars > 0 
                    ? `${Math.round((stats.soldCars / stats.totalCars) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.soldCars} of {stats.totalCars} cars sold
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-28">
              <div className="flex flex-col items-center">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata?.full_name || 'Profile'}
                    className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-red-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center mb-4 border-4 border-red-50">
                    <span className="text-4xl font-bold text-red-600">
                      {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.user_metadata?.full_name || 'User'}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                
                <div className="w-full mt-8 space-y-3">
                  <Link
                    href="/sell"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Sell Your Car
                  </Link>
                  <Link
                    href="/buy"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Car className="h-5 w-5" />
                    Browse Cars
                  </Link>
                  <Link
                    href="/verify"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Verification Status
                  </Link>
                </div>

                {/* Quick Stats */}
                <div className="w-full mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Listed Cars</span>
                      <span className="font-semibold">{stats.totalCars}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available</span>
                      <span className="font-semibold text-green-600">{stats.availableCars}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sold</span>
                      <span className="font-semibold text-blue-600">{stats.soldCars}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Views</span>
                      <span className="font-semibold">{stats.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Verified</span>
                      <span className="font-semibold text-purple-600">{stats.verifiedCars}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Featured</span>
                      <span className="font-semibold text-yellow-600">{stats.featuredCars}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - My Listings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Car Listings</h2>
                  <p className="text-gray-600">
                    {stats.availableCars} available, {stats.soldCars} sold • {stats.totalViews.toLocaleString()} total views
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      loadDashboardData();
                      showSuccess('Dashboard refreshed');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Refresh
                  </button>
                </div>
              </div>

              {cars.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No cars listed yet
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Start your journey by listing your first car. Reach thousands of potential buyers instantly.
                  </p>
                  <Link
                    href="/sell"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    List Your First Car
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {cars.map((car) => (
                    <div
                      key={car.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Car Image */}
                        <div className="md:w-1/4">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                            {car.images && car.images.length > 0 ? (
                              <>
                                <img
                                  src={car.images[0]}
                                  alt={`${car.brand} ${car.model}`}
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src = '/car-placeholder.png';
                                    e.currentTarget.classList.remove('object-contain');
                                    e.currentTarget.classList.add('object-cover');
                                  }}
                                />
                                {car.images.length > 1 && (
                                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    +{car.images.length - 1}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                                  <Car className="h-8 w-8 text-gray-500" />
                                </div>
                                <span className="text-gray-400 text-sm text-center">No image</span>
                              </div>
                            )}
                            
                            {/* Status Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {car.is_verified && (
                                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded flex items-center gap-1">
                                  <ShieldCheck className="h-3 w-3" />
                                  Verified
                                </span>
                              )}
                              {car.is_featured && (
                                <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Car Details */}
                        <div className="md:w-2/4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">
                                {car.brand} {car.model}
                              </h3>
                              <p className="text-gray-600">
                                {car.year} • {car.fuel_type} • {car.transmission}
                              </p>
                              <div className="flex items-center gap-4 mt-2 flex-wrap">
                                <span className="text-sm text-gray-600">
                                  <Eye className="h-4 w-4 inline mr-1" />
                                  {car.views || 0} views
                                </span>
                                <span className="text-sm text-gray-600">
                                  <Clock className="h-4 w-4 inline mr-1" />
                                  {formatDate(car.created_at)}
                                </span>
                                {car.engine_capacity && (
                                  <span className="text-sm text-gray-600">
                                    <Settings className="h-4 w-4 inline mr-1" />
                                    {car.engine_capacity}cc
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              car.is_sold
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {car.is_sold ? 'Sold' : 'Available'}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                Location
                              </p>
                              <p className="font-medium">{car.location || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Mileage</p>
                              <p className="font-medium">
                                {car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Condition</p>
                              <p className="font-medium">{car.condition || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Body Type</p>
                              <p className="font-medium">{car.body_type || 'N/A'}</p>
                            </div>
                            {car.color && (
                              <div>
                                <p className="text-sm text-gray-600">Color</p>
                                <p className="font-medium">{car.color}</p>
                              </div>
                            )}
                            {car.assembly && (
                              <div>
                                <p className="text-sm text-gray-600">Assembly</p>
                                <p className="font-medium">{car.assembly}</p>
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div className="mt-4">
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="text-2xl font-bold text-red-600">
                              {formatPrice(car.price)}
                            </p>
                          </div>

                          {/* Owner Info */}
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Owner</p>
                              <p className="font-medium truncate">{car.owner_name}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Phone</p>
                              <p className="font-medium">{car.owner_phone}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="md:w-1/4">
                          <div className="space-y-2">
                            <Link
                              href={`/car/${car.id}`}
                              className="w-full block text-center py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Listing
                            </Link>
                            
                            <button
                              onClick={() => handleToggleSold(car.id, car.is_sold)}
                              className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                car.is_sold
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {car.is_sold ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Mark Available
                                </>
                              ) : (
                                <>
                                  <DollarSign className="h-4 w-4" />
                                  Mark as Sold
                                </>
                              )}
                            </button>

                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(car)}
                                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCar(car.id)}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Performance Tips */}
              {cars.length > 0 && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Tips to Improve Your Listings
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Add high-quality photos from multiple angles</li>
                    <li>• Set competitive prices based on market research</li>
                    <li>• Keep your contact information up to date</li>
                    <li>• Respond quickly to buyer inquiries</li>
                    <li>• Update mileage and condition regularly</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}