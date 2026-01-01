'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, MapPin, X, Check } from 'lucide-react';
import Link from 'next/link';
import { showError, showSuccess } from '@/lib/utils';

type CarListing = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  location: string;
  condition: string;
  images: string[];
  views: number;
  owner_name: string;
  created_at: string;
  body_type?: string;
  engine_capacity?: number;
  color?: string;
  assembly?: string;
  features?: string[];
  verified?: boolean;
  registered_in?: string;
};

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

export default function BuyPage() {
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    // Basic filters
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: new Date().getFullYear(),
    fuelType: '',
    transmission: '',
    city: '',
    
    // Advanced filters
    brand: '',
    bodyType: '',
    minMileage: '',
    maxMileage: '',
    minEngine: '',
    maxEngine: '',
    color: '',
    assembly: '',
    condition: '',
    registeredIn: '',
    verifiedOnly: false,
    features: [] as string[],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
  const transmissions = ['Manual', 'Automatic'];
  const conditions = ['Excellent', 'Good', 'Fair', 'New'];

  // Yeh useEffect searchTerm change hone par bhi fetchCars call karega
  useEffect(() => {
    const fetchData = async () => {
      await fetchCars();
    };
    fetchData();
  }, [currentPage, filters, searchTerm]); // <-- searchTerm add kiya

  const fetchCars = async () => {
    setLoading(true);
    const supabase = createClient();
    
    let query = supabase
      .from('cars')
      .select('*', { count: 'exact' })
      .eq('is_sold', false)
      .order('created_at', { ascending: false });

    // Apply basic filters
    if (filters.minPrice) query = query.gte('price', parseInt(filters.minPrice));
    if (filters.maxPrice) query = query.lte('price', parseInt(filters.maxPrice));
    if (filters.minYear) query = query.gte('year', parseInt(filters.minYear));
    if (filters.maxYear) query = query.lte('year', filters.maxYear);
    if (filters.fuelType) query = query.eq('fuel_type', filters.fuelType);
    if (filters.transmission) query = query.eq('transmission', filters.transmission);
    if (filters.city) query = query.ilike('location', `%${filters.city}%`);
    
    // Apply advanced filters
    if (filters.brand) query = query.ilike('brand', `%${filters.brand}%`);
    if (filters.bodyType) query = query.eq('body_type', filters.bodyType);
    if (filters.minMileage) query = query.gte('mileage', parseInt(filters.minMileage));
    if (filters.maxMileage) query = query.lte('mileage', parseInt(filters.maxMileage));
    if (filters.minEngine) query = query.gte('engine_capacity', parseInt(filters.minEngine));
    if (filters.maxEngine) query = query.lte('engine_capacity', parseInt(filters.maxEngine));
    if (filters.color) query = query.ilike('color', `%${filters.color}%`);
    if (filters.assembly) query = query.eq('assembly', filters.assembly);
    if (filters.condition) query = query.eq('condition', filters.condition);
    if (filters.registeredIn) query = query.ilike('registered_in', `%${filters.registeredIn}%`);
    if (filters.verifiedOnly) query = query.eq('is_verified', true); // Fixed: 'verified' se 'is_verified'
    
    // Apply features filter (if any features selected)
    if (filters.features.length > 0) {
      filters.features.forEach(feature => {
        query = query.contains('features', [feature]);
      });
    }
    
    // Search filter ko improve kiya
    if (searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();
      query = query.or(
        `brand.ilike.%${search}%,model.ilike.%${search}%,year.eq.${parseInt(search) || 0}`
      );
    }

    // Pagination
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching cars:', error);
      showError('Failed to load cars. Please try again.');
    } else {
      setCars(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    }

    setLoading(false);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: new Date().getFullYear(),
      fuelType: '',
      transmission: '',
      city: '',
      brand: '',
      bodyType: '',
      minMileage: '',
      maxMileage: '',
      minEngine: '',
      maxEngine: '',
      color: '',
      assembly: '',
      condition: '',
      registeredIn: '',
      verifiedOnly: false,
      features: [],
    });
    setSearchTerm('');
    setCurrentPage(1);
    showSuccess('Filters reset');
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lakh`;
    return `₹${price.toLocaleString()}`;
  };

  const ActiveFilterTags = () => {
    const activeFilters = Object.entries(filters)
      .filter(([key, value]) => {
        if (key === 'maxYear' && value === new Date().getFullYear()) return false;
        if (key === 'verifiedOnly' && !value) return false;
        if (key === 'features' && Array.isArray(value) && value.length === 0) return false;
        return value !== '' && value !== false;
      });

    if (activeFilters.length === 0) return null;

    return (
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(([key, value]) => {
            let displayValue = value;
            let displayKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
            displayKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);

            if (key === 'features' && Array.isArray(value)) {
              return value.map(feature => (
                <span
                  key={`feature-${feature}`}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                >
                  {feature}
                  <button
                    onClick={() => handleFeatureToggle(feature)}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ));
            }

            if (typeof value === 'boolean') {
              displayValue = 'Yes';
            }

            return (
              <span
                key={key}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-1"
              >
                {displayKey}: {displayValue}
                <button
                  onClick={() => handleFilterChange(key, key === 'maxYear' ? new Date().getFullYear() : '')}
                  className="ml-1 hover:text-red-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          {searchTerm && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
              Search: {searchTerm}
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200"
          >
            Clear All
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchCars();
                }
              }}
              placeholder="Search for brand, model (e.g., Toyota Fortuner, Honda City)..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Tags */}
        <ActiveFilterTags />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-28 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>

              {/* Quick Brand Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Popular Brands</h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_BRANDS.map(brand => (
                    <button
                      key={brand}
                      onClick={() => handleFilterChange('brand', brand)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        filters.brand === brand
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                  {filters.brand && (
                    <button
                      onClick={() => handleFilterChange('brand', '')}
                      className="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Price Range (₹)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Year Range */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Year</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="From"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={filters.minYear}
                      onChange={(e) => handleFilterChange('minYear', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
                    />
                    <input
                      type="number"
                      placeholder="To"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={filters.maxYear}
                      onChange={(e) => handleFilterChange('maxYear', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Mileage Range */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Mileage (km)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minMileage}
                      onChange={(e) => handleFilterChange('minMileage', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxMileage}
                      onChange={(e) => handleFilterChange('maxMileage', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Fuel Type */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Fuel Type</h3>
                  <div className="space-y-2">
                    {fuelTypes.map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="fuelType"
                          checked={filters.fuelType === type}
                          onChange={() => handleFilterChange('fuelType', type)}
                          className="h-4 w-4 text-red-600"
                        />
                        <span className="ml-2 text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Transmission</h3>
                  <div className="space-y-2">
                    {transmissions.map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="transmission"
                          checked={filters.transmission === type}
                          onChange={() => handleFilterChange('transmission', type)}
                          className="h-4 w-4 text-red-600"
                        />
                        <span className="ml-2 text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full py-2 text-left text-red-600 hover:text-red-700 font-medium flex items-center justify-between"
                >
                  <span>Advanced Filters</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-90' : ''}`} />
                </button>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <div className="space-y-6 border-t pt-4">
                    {/* Body Type */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Body Type</h3>
                      <select
                        value={filters.bodyType}
                        onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
                      >
                        <option value="">All Body Types</option>
                        {BODY_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Engine Capacity */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Engine (cc)</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minEngine}
                          onChange={(e) => handleFilterChange('minEngine', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxEngine}
                          onChange={(e) => handleFilterChange('maxEngine', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Color</h3>
                      <div className="flex flex-wrap gap-2">
                        {COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => handleFilterChange('color', color)}
                            className={`px-3 py-1.5 text-sm rounded-full border ${
                              filters.color === color
                                ? 'border-red-600 bg-red-50 text-red-600'
                                : 'border-gray-300 text-gray-700 hover:border-red-600'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Condition */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Condition</h3>
                      <div className="space-y-2">
                        {conditions.map(cond => (
                          <label key={cond} className="flex items-center">
                            <input
                              type="radio"
                              name="condition"
                              checked={filters.condition === cond}
                              onChange={() => handleFilterChange('condition', cond)}
                              className="h-4 w-4 text-red-600"
                            />
                            <span className="ml-2 text-gray-700">{cond}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Assembly */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Assembly</h3>
                      <div className="space-y-2">
                        {ASSEMBLY_TYPES.map(type => (
                          <label key={type} className="flex items-center">
                            <input
                              type="radio"
                              name="assembly"
                              checked={filters.assembly === type}
                              onChange={() => handleFilterChange('assembly', type)}
                              className="h-4 w-4 text-red-600"
                            />
                            <span className="ml-2 text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Registered In */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Registered In</h3>
                      <select
                        value={filters.registeredIn}
                        onChange={(e) => handleFilterChange('registeredIn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
                      >
                        <option value="">All Provinces</option>
                        {REGISTERED_IN.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>

                    {/* Verified Only */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.verifiedOnly}
                          onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                          className="h-4 w-4 text-red-600 rounded"
                        />
                        <span className="ml-2 text-gray-700">Verified Cars Only</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* City */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">City</h3>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">All Cities</option>
                    {PAKISTAN_CITIES.sort().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Features Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-800 mb-3">Features</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {FEATURES.map(feature => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="h-4 w-4 text-red-600 rounded"
                      />
                      <span className="ml-2 text-gray-700 text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Available Cars</h1>
                <p className="text-gray-600">{cars.length} cars found</p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow animate-pulse">
                    <div className="h-48 bg-gray-300 rounded-t-xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No cars found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? `No results found for "${searchTerm}". Try different keywords.`
                    : "Try changing your filters or search terms"}
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <Link
                      key={car.id}
                      href={`/car/${car.id}`}
                      className="bg-white rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative">
                        <div className="h-48 w-full overflow-hidden rounded-t-xl bg-gray-100">
                          {car.images && car.images.length > 0 ? (
                            <img
                              src={car.images[0]}
                              alt={`${car.brand} ${car.model}`}
                              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = '/car-placeholder.png';
                                e.currentTarget.classList.remove('object-contain');
                                e.currentTarget.classList.add('object-cover');
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <span className="text-white text-lg font-bold">C</span>
                                </div>
                                <span className="text-gray-500 text-sm">No Image</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            car.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                            car.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {car.condition}
                          </span>
                          {car.verified && (
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        {car.body_type && (
                          <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                            {car.body_type}
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {car.brand} {car.model}
                            </h3>
                            <p className="text-gray-600">{car.year} • {car.fuel_type}</p>
                          </div>
                          <span className="text-xl font-bold text-red-600">
                            {formatPrice(car.price)}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{car.location}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              {car.views} views
                            </div>
                            {car.engine_capacity && (
                              <span>{car.engine_capacity.toLocaleString()} cc</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-gray-700">{car.transmission}</span>
                          <span className="text-sm text-gray-700">
                            {car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}
                          </span>
                        </div>

                        {car.features && car.features.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex flex-wrap gap-1">
                              {car.features.slice(0, 3).map((feature, idx) => (
                                <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  {feature}
                                </span>
                              ))}
                              {car.features.length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  +{car.features.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-red-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}