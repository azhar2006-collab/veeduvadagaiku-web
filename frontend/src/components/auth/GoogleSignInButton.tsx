import React, { useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface GoogleSignInButtonProps {
  role?: 'USER' | 'OWNER';
  onSuccess?: () => void;
}

function isMobileOrSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // Detect mobile devices
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true;
  // Detect Safari on desktop (Safari blocks cross-origin popups)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  return isSafari;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  role = 'USER',
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({ prompt: 'select_account' });

      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect');

      if (isMobileOrSafari()) {
        // ── REDIRECT FLOW (mobile / Safari) ──────────────────────────────
        // Save role + intended destination to localStorage — sessionStorage
        // is wiped by Safari during OAuth redirects.
        localStorage.setItem('vv_auth_role', role);
        if (redirectUrl) {
          localStorage.setItem('vv_auth_redirect', redirectUrl);
        } else {
          localStorage.removeItem('vv_auth_redirect');
        }

        // Navigate to the callback page FIRST so that Firebase redirects back
        // to /auth/callback (the page that was active when signInWithRedirect fired).
        // This avoids the redirect landing on /login where competing useEffects
        // fight over navigation.
        navigate('/auth/callback', { replace: true });

        // Small tick to let React flush the navigation before we leave
        await new Promise((r) => setTimeout(r, 50));

        await signInWithRedirect(auth, provider);
        // Browser navigates away — nothing below runs.
        return;
      }

      // ── POPUP FLOW (desktop Chrome / Firefox) ──────────────────────────
      try {
        const credential = await signInWithPopup(auth, provider);
        const idToken = await credential.user.getIdToken(true);

        const response = await authService.firebaseLogin(
          idToken,
          role,
          credential.user.displayName || undefined
        );

        if (response.success && response.data) {
          const { user, token } = response.data;
          setUser(user, token);
          toast.success(`Welcome, ${user.name || 'back'}! 🎉`);

          if (onSuccess) {
            onSuccess();
          } else {
            if (user.role === 'ADMIN') {
              navigate(redirectUrl || '/admin/dashboard', { replace: true });
            } else if (user.role === 'OWNER') {
              navigate(redirectUrl || '/owner/dashboard', { replace: true });
            } else {
              navigate(redirectUrl || '/user/dashboard', { replace: true });
            }
          }
        }
      } catch (popupErr: any) {
        // Popup was blocked or not supported → fall back to redirect
        if (
          popupErr.code === 'auth/popup-blocked' ||
          popupErr.code === 'auth/cancelled-popup-request' ||
          popupErr.code === 'auth/operation-not-supported-in-this-environment'
        ) {
          toast.loading('Redirecting to Google…', { duration: 2000 });
          localStorage.setItem('vv_auth_role', role);
          if (redirectUrl) {
            localStorage.setItem('vv_auth_redirect', redirectUrl);
          } else {
            localStorage.removeItem('vv_auth_redirect');
          }
          navigate('/auth/callback', { replace: true });
          await new Promise((r) => setTimeout(r, 50));
          await signInWithRedirect(auth, provider);
          return;
        }

        // User closed the popup — not an error
        if (popupErr.code === 'auth/popup-closed-by-user') {
          setLoading(false);
          return;
        }

        throw popupErr;
      }
    } catch (error: any) {
      console.error('[GoogleSignIn] Error:', error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Google sign-in could not be completed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition shadow-sm active:scale-[0.99] disabled:opacity-50"
    >
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{loading ? 'Connecting to Google…' : 'Continue with Google / Gmail'}</span>
    </button>
  );
};
