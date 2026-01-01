'use client';

import { ArrowRight, Car, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1485291571150-772bcfc10da5?q=80&w=2428")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ y: -100, x: Math.random() * 100 + '%' }}
            animate={{ 
              y: '100vh',
              transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }
            }}
            style={{
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-10 border border-white/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Car className="h-10 w-10 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-white/20"
          >
            <Sparkles className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold text-white">Limited Time Offer</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8"
          >
            Your Dream Vehicle
            <span className="block mt-2">
              <span className="relative">
                Awaits You
                <motion.div
                  animate={{ width: ['0%', '100%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                />
              </span>
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Join <span className="font-bold text-yellow-300">50,000+</span> satisfied customers who found their perfect vehicle on Pakistan's most trusted automotive platform
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
              <Link
                href="/dashboard"
                className="relative inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-red-700 to-red-800 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl group-hover:from-red-800 group-hover:to-red-900 border border-white/20 backdrop-blur-sm"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/buy"
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-transparent border-2 border-white/40 hover:border-white hover:bg-white/10 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:shadow-2xl"
              >
                Browse Premium Listings
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 pt-8 border-t border-white/20"
          >
            <p className="text-white/80 mb-6">Trusted by leading brands</p>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-80">
              {['Toyota', 'Honda', 'Suzuki', 'BMW', 'Mercedes'].map((brand, index) => (
                <div key={brand} className="text-white font-bold text-xl">
                  {brand}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
