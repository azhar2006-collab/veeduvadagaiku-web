import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, ShieldCheck } from 'lucide-react';
import { PhoneOTPForm } from '../../components/auth/PhoneOTPForm';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { SEOHead } from '../../components/common/SEOHead';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role') as any) || 'USER';
  const [role, setRole] = useState<'USER' | 'OWNER'>(defaultRole);
  const navigate = useNavigate();
  const { isAuthenticated, isOwner, isAdmin } = useAuth();

  // If already authenticated, redirect to appropriate portal
  React.useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) navigate('/admin/dashboard', { replace: true });
      else if (isOwner) navigate('/owner/dashboard', { replace: true });
      else navigate('/user/dashboard', { replace: true });
    }
  }, [isAuthenticated, isOwner, isAdmin, navigate]);

  const handleSuccess = () => {
    const currentUser = useAuthStore.getState().user;
    if (currentUser?.role === 'ADMIN' || isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'OWNER') {
      navigate('/owner/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <SEOHead
        title="Login | Veedu Vadagaiku - Chennai Rental Marketplace"
        description="Login to your Veedu Vadagaiku account using Mobile OTP or Google Sign-In."
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-600/30">
            <Home className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Welcome to Veedu Vadagaiku
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          Sign in to manage your saved rentals or owner listings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-gray-100 space-y-6">
          {/* Role selection tab */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-gray-400 tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`py-2 text-xs font-bold rounded-xl transition ${
                  role === 'USER'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tenant / User
              </button>
              <button
                type="button"
                onClick={() => setRole('OWNER')}
                className={`py-2 text-xs font-bold rounded-xl transition ${
                  role === 'OWNER'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Property Owner
              </button>
            </div>
          </div>

          {/* Phone OTP Form */}
          <PhoneOTPForm role={role} onSuccess={handleSuccess} />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-bold">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-in */}
          <GoogleSignInButton role={role} onSuccess={handleSuccess} />

          <div className="pt-2 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to={`/register?role=${role}`} className="text-orange-600 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure authentication with encrypted sessions</span>
        </div>
      </div>
    </div>
  );
};
