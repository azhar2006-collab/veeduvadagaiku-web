import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, ShieldCheck } from 'lucide-react';
import { PhoneOTPForm } from '../../components/auth/PhoneOTPForm';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { SEOHead } from '../../components/common/SEOHead';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role') as any) || 'USER';
  const [role, setRole] = useState<'USER' | 'OWNER'>(defaultRole);
  const navigate = useNavigate();
  const { isAuthenticated, isOwner, isAdmin } = useAuth();

  // If already authenticated, redirect immediately using <Navigate> (no useEffect, no race)
  if (isAuthenticated) {
    const redirectUrl = searchParams.get('redirect');
    const target = redirectUrl
      || (isAdmin ? '/admin/dashboard' : isOwner ? '/owner/dashboard' : '/user/dashboard');
    return <Navigate to={target} replace />;
  }

  const handleSuccess = () => {
    const redirectUrl = searchParams.get('redirect');

    if (isAdmin) {
      navigate(redirectUrl || '/admin/dashboard', { replace: true });
    } else if (isOwner || role === 'OWNER') {
      navigate(redirectUrl || '/owner/dashboard', { replace: true });
    } else {
      navigate(redirectUrl || '/user/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <SEOHead
        title="Login | veeduvadagaikkuchennai - Rental Marketplace"
        description="Login to your veeduvadagaikkuchennai account using Mobile OTP or Google Sign-In."
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <img
            src="/logo.png"
            alt="veeduvadagaikkuchennai"
            className="h-20 sm:h-24 w-auto object-contain rounded-2xl drop-shadow-lg group-hover:scale-105 transition-transform"
          />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Welcome to veeduvadagaikkuchennai
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
