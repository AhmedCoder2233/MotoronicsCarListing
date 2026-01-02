'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Calendar, Fuel, Gauge, Settings, MapPin, Phone, 
  CheckCircle, ArrowLeft, Share2, Eye, ChevronLeft, ChevronRight, 
  Maximize2, Minimize2, Download, Car, Palette, Building, 
  FileText, ShieldCheck, Check, X, Users, Mail, Star,
  TrendingUp, Clock, Map, Compass, Hash, Flag
} from 'lucide-react';
import { showError, showSuccess } from '@/lib/utils';

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [similarCars, setSimilarCars] = useState<any[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCarDetails();
  }, [params.id]);

  const fetchCarDetails = async () => {
    const supabase = createClient();
    
    // Fetch car details
    const { data: carData, error: carError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', params.id)
      .single();

    if (carError || !carData) {
      showError('Car not found');
      router.push('/buy');
      return;
    }

    setCar(carData);

    // Increment view count
    await supabase
      .from('cars')
      .update({ views: (carData.views || 0) + 1 })
      .eq('id', params.id);

    // Fetch similar cars (based on multiple criteria)
    const { data: similarData } = await supabase
      .from('cars')
      .select('*')
      .eq('is_sold', false)
      .neq('id', params.id)
      .or(`brand.eq.${carData.brand},fuel_type.eq.${carData.fuel_type},body_type.eq.${carData.body_type}`)
      .limit(4);

    setSimilarCars(similarData || []);
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `Rs.${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `Rs.${(price / 100000).toFixed(1)} Lakh`;
    return `Rs.${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleContactSeller = () => {
    if (car?.owner_phone) {
      showSuccess('Opening phone app...');
      setTimeout(() => {
        window.open(`tel:${car.owner_phone}`);
      }, 500);
    } else {
      showError('Seller contact number not available');
    }
  };

  const handleWhatsApp = () => {
    if (car?.owner_phone) {
      const message = `Hi, I'm interested in your ${car.year} ${car.brand} ${car.model} listed for ${formatPrice(car.price)}`;
      const url = `https://wa.me/${car.owner_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${car.brand} ${car.model} for Sale`,
          text: `Check out this ${car.year} ${car.brand} ${car.model} for sale at ${formatPrice(car.price)}`,
          url: window.location.href,
        });
        showSuccess('Shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copied to clipboard!');
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    img.src = '/car-placeholder.png';
    img.classList.remove('object-contain');
    img.classList.add('object-cover');
  };

  const handleDownloadImage = async () => {
    if (car?.images && car.images[activeImage]) {
      try {
        const response = await fetch(car.images[activeImage]);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${car.brand}_${car.model}_${activeImage + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showSuccess('Image downloaded!');
      } catch (error) {
        showError('Failed to download image');
      }
    }
  };

  const toggleFullscreen = () => {
    if (!fullscreen && imageRef.current) {
      if (imageRef.current.requestFullscreen) {
        imageRef.current.requestFullscreen();
      }
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="relative">
                <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-black' : 'aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4'}`}>
                  {car.images && car.images.length > 0 ? (
                    <div className="relative w-full h-full">
                      <img
                        ref={imageRef}
                        src={car.images[activeImage]}
                        alt={`${car.brand} ${car.model} - Image ${activeImage + 1}`}
                        className={`w-full h-full ${fullscreen ? 'object-contain' : 'object-contain'} transition-all duration-300 ${
                          !imageLoaded ? 'opacity-0' : 'opacity-100'
                        }`}
                        loading="eager"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                      
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                        </div>
                      )}
                      
                      {/* Image Controls */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
                        {car.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImage(prev => (prev === 0 ? car.images.length - 1 : prev - 1));
                                setImageLoaded(false);
                              }}
                              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            
                            <span className="flex items-center text-white text-sm font-medium px-2">
                              {activeImage + 1} / {car.images.length}
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImage(prev => (prev === car.images.length - 1 ? 0 : prev + 1));
                                setImageLoaded(false);
                              }}
                              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={toggleFullscreen}
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                        >
                          {fullscreen ? (
                            <Minimize2 className="h-5 w-5" />
                          ) : (
                            <Maximize2 className="h-5 w-5" />
                          )}
                        </button>
                        
                        <button
                          onClick={handleDownloadImage}
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Car className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-gray-500">No images available</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {car.images && car.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mt-4">
                    {car.images.map((img: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          setActiveImage(index);
                          setImageLoaded(false);
                        }}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          activeImage === index 
                            ? 'border-red-500 scale-105' 
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <div className="relative w-full h-full bg-gray-100">
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tabs for Details */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Car className="h-4 w-4 inline mr-2" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('specifications')}
                    className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'specifications'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Settings className="h-4 w-4 inline mr-2" />
                    Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab('features')}
                    className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'features'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Features
                  </button>
                  <button
                    onClick={() => setActiveTab('seller')}
                    className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'seller'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Seller Info
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {car.brand} {car.model} - {car.year}
                      </h2>
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Listed: {formatDate(car.created_at)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Eye className="h-4 w-4 mr-2" />
                          <span>{car.views || 0} views</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          <span>Car ID: {car.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      {car.is_verified && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      )}
                      {car.is_featured && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        car.is_sold
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {car.is_sold ? 'Sold' : 'Available'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        car.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                        car.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                        car.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {car.condition || 'Good'} Condition
                      </span>
                    </div>

                    {/* Description */}
                    {car.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                          {car.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Specifications Tab */}
                {activeTab === 'specifications' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Basic Info</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Brand</span>
                          <span className="font-medium">{car.brand}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Model</span>
                          <span className="font-medium">{car.model}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Year</span>
                          <span className="font-medium">{car.year}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Body Type</span>
                          <span className="font-medium">{car.body_type || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Assembly</span>
                          <span className="font-medium">{car.assembly || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Technical Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Fuel Type</span>
                          <span className="font-medium">{car.fuel_type}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Transmission</span>
                          <span className="font-medium">{car.transmission}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Engine Capacity</span>
                          <span className="font-medium">
                            {car.engine_capacity ? `${car.engine_capacity.toLocaleString()} cc` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Mileage</span>
                          <span className="font-medium">
                            {car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Color</span>
                          <span className="font-medium">{car.color || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Registration & Location</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Registered In</span>
                          <span className="font-medium">{car.registered_in || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Location</span>
                          <span className="font-medium">{car.location}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Price</span>
                          <span className="font-bold text-red-600">{formatPrice(car.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                  <div>
                    {car.features && car.features.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {car.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No features listed for this car</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Seller Info Tab */}
                {activeTab === 'seller' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Seller Information
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Contact the seller directly for inquiries, test drives, and negotiations.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Contact Details</h4>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-600">Name</p>
                              <p className="font-medium">{car.owner_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium">{car.owner_phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium">{car.owner_email}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Location Details</h4>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-600">City</p>
                              <p className="font-medium">{car.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Flag className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-600">Registered Province</p>
                              <p className="font-medium">{car.registered_in || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Price & Contact - FIXED SECTION */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {car.brand} {car.model}
                  </h1>
                  <div className="flex items-center text-gray-600 mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {car.location}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {formatPrice(car.price)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Eye className="h-4 w-4 mr-2" />
                    {car.views || 0} views • Listed {formatDate(car.created_at)}
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    onClick={handleContactSeller}
                    className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Seller: {car.owner_phone}
                  </button>

                  <button 
                    onClick={handleWhatsApp}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                    </svg>
                    Contact on WhatsApp
                  </button>

                  <button 
                    onClick={handleShare}
                    className="w-full py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 flex items-center justify-center transition-all"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share This Car
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Facts</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Body Type</p>
                      <p className="font-medium">{car.body_type || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Assembly</p>
                      <p className="font-medium">{car.assembly || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Engine</p>
                      <p className="font-medium">
                        {car.engine_capacity ? `${car.engine_capacity}cc` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Color</p>
                      <p className="font-medium">{car.color || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Similar Cars - FIXED OVERLAP */}
              {similarCars.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Similar Cars</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {similarCars.map((similarCar) => (
                      <div
                        key={similarCar.id}
                        onClick={() => router.push(`/car/${similarCar.id}`)}
                        className="flex gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer transition-all hover:shadow-md"
                      >
                        <div className="w-20 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                          {similarCar.images && similarCar.images.length > 0 ? (
                            <img
                              src={similarCar.images[0]}
                              alt={similarCar.brand}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Car className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {similarCar.brand} {similarCar.model}
                          </h4>
                          <p className="text-red-600 font-bold">
                            {formatPrice(similarCar.price)}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {similarCar.year} • {similarCar.fuel_type} • {similarCar.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
