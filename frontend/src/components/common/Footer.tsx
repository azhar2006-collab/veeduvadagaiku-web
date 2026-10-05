import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#040A17] text-slate-300 pt-16 pb-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div>
            <div className="mb-4">
              <div className="bg-white p-2.5 rounded-2xl inline-block shadow-md">
                <img
                  src="/logo-full.png"
                  alt="Veedu Vadagaiku"
                  className="h-12 sm:h-14 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              வீடு வாடகைக்கு — Chennai's dedicated rental marketplace for verified houses and prime commercial shops. Connecting property owners with verified tenants.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold bg-[#0B2545]/70 p-2.5 rounded-lg border border-amber-500/30">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              100% Admin-Verified Listings Only
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs">
              Explore Rentals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/properties" className="hover:text-orange-400 transition">
                  All Chennai Properties
                </Link>
              </li>
              <li>
                <Link to="/houses" className="hover:text-orange-400 transition">
                  Houses & Apartments for Rent
                </Link>
              </li>
              <li>
                <Link to="/shops" className="hover:text-orange-400 transition">
                  Commercial Shops for Rent
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Anna+Nagar" className="hover:text-orange-400 transition">
                  Rentals in Anna Nagar
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=T.+Nagar" className="hover:text-orange-400 transition">
                  Rentals in T. Nagar
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Velachery" className="hover:text-orange-400 transition">
                  Rentals in Velachery
                </Link>
              </li>
            </ul>
          </div>

          {/* For Property Owners */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs">
              For Property Owners
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/owner/properties/add" className="hover:text-orange-400 transition">
                  Post House / Shop Ad
                </Link>
              </li>
              <li>
                <Link to="/owner/listing-plans" className="hover:text-orange-400 transition">
                  Listing Plans & Pricing
                </Link>
              </li>
              <li>
                <Link to="/owner/dashboard" className="hover:text-orange-400 transition">
                  Owner Portal & Analytics
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 transition">
                  How Listing Works
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-400 transition">
                  Owner Support Hotline
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide uppercase text-xs">
              Chennai Office
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <span>Anna Salai, Mount Road, Chennai, Tamil Nadu - 600002</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                <span>+91 98400 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                <span>support@veeduvadagaiku.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Veedu Vadagaiku. All rights reserved. Chennai, Tamil Nadu.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-gray-400 transition">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="hover:text-gray-400 transition">
              Privacy Policy
            </Link>
            <Link to="/admin/login" className="hover:text-gray-400 transition">
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
