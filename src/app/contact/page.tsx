import { Phone, Mail, MapPin, Globe, Building2, Flag } from 'lucide-react';

export default function ContactPage() {
  const contactData = {
    phones: [
      { country: "USA", flag: "🇺🇸", number: "+1 (708) 960 7181" },
      { country: "Pakistan", flag: "🇵🇰", number: "+92 331-2705270" }
    ],
    emails: [
      { type: "General", address: "info@bigbulldigital.com" },
      { type: "Support", address: "support@bigbulldigital.com" }
    ],
    addresses: [
      { 
        country: "USA", 
        flag: "🇺🇸",
        address: "1533 Yellowstone Dr Streamwood IL 60107" 
      },
      { 
        country: "Pakistan", 
        flag: "🇵🇰",
        address: "Plot 1C lane 7 Zamzam Commercial PH-V DHA" 
      },
      { 
        country: "Dubai", 
        flag: "🇦🇪",
        address: "Al Khaleej Al - Tejari - 1 Street Business Bay" 
      },
      { 
        country: "UK", 
        flag: "🇬🇧",
        address: "20-22 Wenlock Rd London N1 7GU, UK" 
      }
    ]
  };

  return (
    <div className="min-h-screen mt-16 bg-gradient-to-b from-white to-red-50">
    

      {/* Contact Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <div className="w-24 h-1.5 bg-red-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Reach out to our global offices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Phone Numbers */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-600 transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-xl mr-4">
                <Phone className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Phone Numbers</h3>
            </div>
            
            <div className="space-y-6">
              {contactData.phones.map((phone, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <span className="text-2xl">{phone.flag}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{phone.country}</p>
                    <p className="text-lg text-gray-700 font-mono mt-1">{phone.number}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Addresses */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-600 transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-xl mr-4">
                <Mail className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Email Addresses</h3>
            </div>
            
            <div className="space-y-6">
              {contactData.emails.map((email, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-semibold text-gray-900 mb-2">{email.type}</p>
                  <a 
                    href={`mailto:${email.address}`}
                    className="text-lg text-red-600 hover:text-red-700 font-mono break-all"
                  >
                    {email.address}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Office Locations */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-600 transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-xl mr-4">
                <Globe className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Global Offices</h3>
            </div>
            
            <div className="space-y-6">
              {contactData.addresses.map((office, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <span className="text-2xl">{office.flag}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{office.country}</p>
                    <p className="text-gray-700 mt-1">{office.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-white px-6 py-4 rounded-2xl shadow-lg">
            <MapPin className="h-6 w-6 text-red-600" />
            <p className="text-gray-700">
              <span className="font-semibold">Operating Hours:</span> Monday - Friday, 9:00 AM - 6:00 PM (Local Time)
            </p>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <div className="bg-gray-900 text-white mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg">© 2024 BigBull Digital. All rights reserved.</p>
          <p className="text-gray-400 mt-2">Serving clients worldwide with excellence</p>
        </div>
      </div>
    </div>
  );
}