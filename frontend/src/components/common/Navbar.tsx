import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, User, LogOut, Menu, X, PlusCircle, Building2, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const { user, isAuthenticated, isOwner, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group py-1">
            <img
              src="/logo-full.png"
              alt="Veedu Vadagaiku - Chennai's Rental Marketplace"
              className="h-12 sm:h-14 w-auto object-contain group-hover:scale-[1.02] transition-transform drop-shadow-sm"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/properties"
              className="text-sm font-medium text-gray-600 hover:text-orange-600 transition flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              All Rentals
            </Link>
            <Link
              to="/houses"
              className="text-sm font-medium text-gray-600 hover:text-orange-600 transition flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" />
              Houses
            </Link>
            <Link
              to="/shops"
              className="text-sm font-medium text-gray-600 hover:text-orange-600 transition flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              Shops
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-gray-600 hover:text-orange-600 transition"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-600 hover:text-orange-600 transition"
            >
              Contact
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 p-1.5 pl-3 pr-2 rounded-full border border-gray-200 hover:border-gray-300 transition"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {user?.name.split(' ')[0]}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-medium text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-slide-up z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400 font-normal">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-medium rounded-full bg-orange-100 text-orange-700">
                        {user?.role}
                      </span>
                    </div>

                    {isAdmin ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    ) : isOwner ? (
                      <>
                        <Link
                          to="/owner/dashboard"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          Owner Dashboard
                        </Link>
                        <Link
                          to="/owner/properties"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          My Properties
                        </Link>
                        <Link
                          to="/owner/enquiries"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          Enquiries
                        </Link>
                        <Link
                          to="/owner/profile"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          Profile
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/user/dashboard"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          User Dashboard
                        </Link>
                        <Link
                          to="/user/favourites"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          <Heart className="w-4 h-4 text-orange-500" />
                          Saved Properties
                        </Link>
                        <Link
                          to="/user/enquiries"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          My Enquiries
                        </Link>
                        <Link
                          to="/user/profile"
                          onClick={() => setUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-orange-600 transition px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Post Property CTA */}
            {isOwner ? (
              <Link
                to="/owner/properties/add"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-medium text-sm shadow-md shadow-orange-500/20 transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Post Property
              </Link>
            ) : (
              <Link
                to={isAuthenticated ? '/owner/dashboard' : '/login?role=OWNER'}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-medium text-sm shadow-md shadow-orange-500/20 transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                List Your Property
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-orange-600 rounded-lg hover:bg-gray-100 transition"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-lg">
          <Link
            to="/properties"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-800 hover:bg-orange-50 rounded-lg"
          >
            All Rentals
          </Link>
          <Link
            to="/houses"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-800 hover:bg-orange-50 rounded-lg"
          >
            Houses for Rent
          </Link>
          <Link
            to="/shops"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-800 hover:bg-orange-50 rounded-lg"
          >
            Shops for Rent
          </Link>
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-800 hover:bg-orange-50 rounded-lg"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-800 hover:bg-orange-50 rounded-lg"
          >
            Contact
          </Link>

          <div className="border-t border-gray-100 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-xs text-gray-400 font-normal">Logged in as</p>
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                </div>
                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg"
                  >
                    Admin Dashboard
                  </Link>
                ) : isOwner ? (
                  <>
                    <Link
                      to="/owner/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg"
                    >
                      Owner Dashboard
                    </Link>
                    <Link
                      to="/owner/properties"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      My Properties
                    </Link>
                    <Link
                      to="/owner/properties/add"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg text-center"
                    >
                      + Add New Property
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/user/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg"
                    >
                      User Dashboard
                    </Link>
                    <Link
                      to="/user/favourites"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      Saved Properties
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2.5 px-4 text-sm font-medium text-white bg-orange-600 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
