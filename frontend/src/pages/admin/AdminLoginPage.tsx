import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, KeyRound, Lock, ArrowRight } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { SEOHead } from '../../components/common/SEOHead';
import toast from 'react-hot-toast';

export const AdminLoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleAdminGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();

      const response = await authService.firebaseLogin(idToken);

      if (response.success && response.data) {
        if (response.data.user.role !== 'ADMIN') {
          toast.error('Access Denied: You do not have administrator permissions.');
          return;
        }

        setUser(response.data.user, response.data.token);
        toast.success(`Welcome back, Administrator ${response.data.user.name}!`);
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Admin authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <SEOHead title="Admin Access Portal | Veedu Vadagaiku" />

      <div className="max-w-md w-full bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 bg-orange-600/20 text-orange-500 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Admin Control Portal</h2>
          <p className="text-xs text-gray-400 mt-1">
            Restricted administrative access for Veedu Vadagaiku moderation
          </p>
        </div>

        <div className="p-4 bg-gray-900/60 rounded-2xl border border-gray-700 text-left text-xs text-gray-300 space-y-1">
          <div className="flex items-center gap-2 font-bold text-orange-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Authorized Personnel Only</span>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Review paid listings, approve/reject property ads, manage Chennai owners, and supervise transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdminGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-orange-600/30 active:scale-[0.99] disabled:opacity-50"
        >
          <span>{loading ? 'Authenticating Admin...' : 'Sign In with Authorized Google Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
