import { Car, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  Buy: ['Cars', 'Bikes', 'Commercial', 'Used Vehicles', 'New Vehicles'],
  Sell: ['Sell Your Car', 'Sell Your Bike', 'Dealer Portal', 'Vehicle Valuation'],
  Company: ['About Us', 'Careers', 'Press', 'Blog', 'Contact Us'],
  Support: ['Help Center', 'Safety Tips', 'Privacy Policy', 'Terms of Service', 'FAQs'],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <Car className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">Motoronics</span>
            </Link>
            <p className="mb-6">
              Pakistan&apos;s leading automotive marketplace connecting buyers and sellers nationwide.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold text-lg mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-blue-400" />
              <div>
                <div className="font-medium text-white">Call Us</div>
                <div>0300-MOTORONICS</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-400" />
              <div>
                <div className="font-medium text-white">Email Us</div>
                <div>support@motoronics.com</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-400" />
              <div>
                <div className="font-medium text-white">Visit Us</div>
                <div>Karachi, Lahore, Islamabad</div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Motoronics. All rights reserved.</p>
          <p className="mt-2">Pakistan&apos;s #1 Automotive Marketplace</p>
        </div>
      </div>
    </footer>
  );
}