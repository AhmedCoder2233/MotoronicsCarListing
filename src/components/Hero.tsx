'use client';

import { Car, Shield, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  const stats = [
    { value: '50+', label: 'Verified Cars' },
    { value: '100+', label: 'Monthly Users' },
    { value: '98%', label: 'Satisfaction' }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
       {/* Background with Red Gradient */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"
            alt="Luxury car background"
            className="object-cover w-full h-full"
            priority
            fill
            quality={90}
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/3 left-1/3 w-1/3 h-1/3 bg-red-600/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 px-4 py-2 rounded-full mb-8"
          >
            <Car className="h-4 w-4 text-red-300" />
            <span className="text-sm font-medium text-white">
              Pakistan's #1 Car Marketplace
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="block text-white">Find Your</span>
            <span className="block bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              Perfect Ride
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto px-4"
          >
            Discover verified cars from trusted sellers across Pakistan. 
            Quality assured with 200-point inspection.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-4">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-600/30 transition-all"
            >
              Browse Cars
            </motion.button>
            <button className="px-6 sm:px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all">
              Sell Your Car
            </button>
          </motion.div>

          {/* Featured Brands */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12"
          >
            <p className="text-gray-400 mb-4">Trusted by car enthusiasts</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {['Toyota', 'Honda', 'Suzuki', 'Mercedes', 'BMW', 'Audi'].map((brand) => (
                <div 
                  key={brand} 
                  className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-red-500/30 transition-colors"
                >
                  <span className="text-white text-sm">{brand}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center"
        >
          <div className="w-6 h-10 border-2 border-red-500/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-3 bg-red-500 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}