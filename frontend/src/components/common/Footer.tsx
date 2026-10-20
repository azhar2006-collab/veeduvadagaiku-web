import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#FAF8F5] text-gray-600 pt-10 pb-8 sm:pt-16 sm:pb-12 border-t border-[#EFE8D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 sm:gap-10 sm:mb-12">
          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-bold text-xs mb-4 tracking-wider uppercase">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/properties" className="hover:text-[#B08B40] transition">
                  {t('footer.allProperties')}
                </Link>
              </li>
              <li>
                <Link to="/houses" className="hover:text-[#B08B40] transition">
                  {t('footer.housesApartments')}
                </Link>
              </li>
              <li>
                <Link to="/hostels" className="hover:text-[#B08B40] transition">
                  {t('footer.hostels')}
                </Link>
              </li>
              <li>
                <Link to="/shops" className="hover:text-[#B08B40] transition">
                  {t('footer.commercialShops')}
                </Link>
              </li>
              <li>
                <Link to="/marriage-halls" className="hover:text-[#B08B40] transition">
                  {t('footer.marriageHalls')}
                </Link>
              </li>
              <li>
                <Link to="/home-services" className="hover:text-[#B08B40] transition">
                  {t('footer.homeServices', 'Chennai Home Services')}
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Anna+Nagar" className="hover:text-[#B08B40] transition">
                  {t('footer.rentalsAnnaNagar')}
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=T.+Nagar" className="hover:text-[#B08B40] transition">
                  {t('footer.rentalsTNagar')}
                </Link>
              </li>
              <li>
                <Link to="/properties?locality=Velachery" className="hover:text-[#B08B40] transition">
                  {t('footer.rentalsVelachery')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Property Owners */}
          <div>
            <h4 className="text-gray-900 font-bold text-xs mb-4 tracking-wider uppercase">
              {t('footer.forOwners')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/owner/properties/add" className="hover:text-[#B08B40] transition">
                  {t('footer.postAd')}
                </Link>
              </li>
              <li>
                <Link to="/owner/listing-plans" className="hover:text-[#B08B40] transition">
                  {t('footer.plans')}
                </Link>
              </li>
              <li>
                <Link to="/owner/dashboard" className="hover:text-[#B08B40] transition">
                  {t('footer.ownerPortal')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#B08B40] transition">
                  {t('footer.howItWorks')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#B08B40] transition">
                  {t('footer.supportHotline')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-gray-900 font-bold text-xs mb-4 tracking-wider uppercase">
              {t('footer.chennaiOffice')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <span>Anna Salai, Mount Road, Chennai, Tamil Nadu - 600002</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C5A059] shrink-0" />
                <span>+91 98400 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#C5A059] shrink-0" />
                <span>support@veeduvadagaikkuchennai.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#EFE8D8] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} veeduvadagaikkuchennai. {t('footer.rights')}</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-gray-800 transition">
              {t('footer.terms')}
            </Link>
            <Link to="/privacy" className="hover:text-gray-800 transition">
              {t('footer.privacy')}
            </Link>
            <Link to="/admin/login" className="hover:text-gray-800 transition">
              {t('footer.adminAccess')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
