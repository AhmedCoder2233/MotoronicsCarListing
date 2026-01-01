'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Search, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { signInWithGoogle, signOut, getUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/client';
import { showError, showSuccess } from '@/lib/utils';

type UserType = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Check user session
    checkUser();

    // Set up auth state listener
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Initiating Google sign in...');
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Sign in error:', error);
      showError('Failed to sign in with Google. Please try again.');
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      showSuccess('Logged out successfully');
      // Force a page reload to clear any cached state
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign out error:', error);
      showError('Failed to log out. Please try again.');
    }
  };
  const navItems = [
    { label: 'Buy', href: '/buy' },
    { label: 'Sell', href: '/sell' },
    { label: 'Contact', href: '/contact' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white shadow-md ${
        isScrolled ? 'py-2 shadow-lg' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="Motoronics Logo" 
                width={40} 
                height={40}
                className="w-10 h-10"
              />
            </div>
            <span className="text-2xl font-bold text-red-600">
              Motoronics
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors py-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth & Search */}
          <div className="hidden lg:flex items-center space-x-4">
            
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-red-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoogleSignIn}
                  className="px-5 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50 border border-red-200"
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoogleSignIn}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow hover:shadow-md transition-all"
                >
                  Sign Up
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-lg font-semibold text-gray-900 hover:text-red-600 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-6 border-t border-gray-200 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="h-5 w-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>
                  
                  {loading ? (
                    <div className="space-y-3">
                      <div className="w-full h-12 rounded-lg bg-gray-200 animate-pulse"></div>
                      <div className="w-full h-12 rounded-lg bg-gray-200 animate-pulse"></div>
                    </div>
                  ) : user ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 py-3"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-red-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                          </p>
                          <p className="text-sm text-gray-500">View Dashboard</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 py-3 text-red-600 font-semibold border-2 border-red-600 rounded-lg hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          handleGoogleSignIn();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-center py-3 text-red-600 font-semibold border-2 border-red-600 rounded-lg hover:bg-red-50"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          handleGoogleSignIn();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-center py-3 text-white font-semibold bg-red-600 rounded-lg shadow hover:bg-red-700"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
