'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Car, 
  Users,
  CheckCircle,
  Zap,
  Award,
  Heart
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: '200-Point Verification',
    description: 'Every vehicle undergoes rigorous inspection for complete transparency.',
    color: 'from-red-500 to-red-600'
  },
  {
    icon: Zap,
    title: 'Instant Response',
    description: 'Get responses from sellers within 24 hours or our team assists you.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Award,
    title: 'Price Assurance',
    description: 'Best price guarantee with our market analysis and price comparison.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: '24/7 support and dedicated relationship managers for your journey.',
    color: 'from-pink-500 to-red-500'
  },
  {
    icon: DollarSign,
    title: 'Easy Financing',
    description: 'Hassle-free financing with our trusted banking and financial partners.',
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: CheckCircle,
    title: 'Safe Transactions',
    description: 'Escrow services and secure payment gateways for peace of mind.',
    color: 'from-blue-500 to-cyan-500'
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animated Title */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-block"
          >
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-6 py-3 rounded-full mb-6">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Why Choose Motoronics?</span>
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Experience the{' '}
            <span className="relative">
              <span className="text-gradient">Difference</span>
              <motion.div
                animate={{ width: ['0%', '100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-transparent"
              />
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            We&apos;ve redefined vehicle buying and selling with technology, trust, and transparency
          </motion.p>
        </div>

        {/* Features Grid with Stagger Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.2 }
              }}
              className="group relative"
            >
              {/* Background Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                {/* Animated Icon Background */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} bg-opacity-10`}
                >
                  <feature.icon className={`h-8 w-8 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>
                
                {/* Learn More Link */}
                <motion.a
                  href="#"
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center text-red-600 font-semibold text-sm group/link"
                >
                  Learn more
                  <svg
                    className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 lg:p-12 shadow-xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50,000+', label: 'Happy Customers' },
              { value: '200,000+', label: 'Vehicles Sold' },
              { value: '4.9/5', label: 'Customer Rating' },
              { value: '24/7', label: 'Support Available' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-red-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}