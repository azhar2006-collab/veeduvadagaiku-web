import React, { useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface GoogleSignInButtonProps {
  role?: 'USER' | 'OWNER';
  onSuccess?: () => void;
}

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || navigator.vendor || ''
  );
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ role = 'USER', onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Handle redirect result (for mobile browsers / Safari redirect flows)
  useEffect(() => {
    let isMounted = true;

    getRedirectResult(auth)
      .then(async (credential) => {
        if (!isMounted || !credential || !credential.user) return;

        setLoading(true);
        const savedRole =
          (sessionStorage.getItem('vv_auth_role') as 'USER' | 'OWNER') || role || 'USER';
        const savedRedirect = sessionStorage.getItem('vv_auth_redirect') || null;
        sessionStorage.removeItem('vv_auth_role');
        sessionStorage.removeItem('vv_auth_redirect');

        try {
          const idToken = await credential.user.getIdToken(/* forceRefresh */ true);
          const response = await authService.firebaseLogin(
            idToken,
            savedRole,
            credential.user.displayName || undefined
          );

          if (response.success && response.data) {
            setUser(response.data.user, response.data.token);
            toast.success(`Welcome, ${response.data.user.name}!`);

            // Navigate based on role (onSuccess may not be in scope after redirect)
            if (onSuccess) {
              onSuccess();
            } else {
              const u = response.data.user;
              if (u.role === 'ADMIN') {
                navigate(savedRedirect || '/admin/dashboard', { replace: true });
              } else if (u.role === 'OWNER') {
                navigate(savedRedirect || '/owner/dashboard', { replace: true });
              } else {
                navigate(savedRedirect || '/user/dashboard', { replace: true });
              }
            }
          }
        } catch (err: any) {
          console.error('Redirect result processing error:', err);
          toast.error(err?.response?.data?.message || err?.message || 'Google sign-in failed. Please try again.');
        } finally {
          if (isMounted) setLoading(false);
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') return;
        console.error('Redirect sign-in error:', err);
        toast.error(err?.message || 'Google Sign-in failed. Please try again.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      // Force Gmail account picker on all devices
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({ prompt: 'select_account' });

      // Save requested role and redirect for both popup and redirect workflows
      sessionStorage.setItem('vv_auth_role', role);
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) sessionStorage.setItem('vv_auth_redirect', redirectUrl);

      // On mobile devices, use redirect for 100% reliable login without popup blockers
      if (isMobileDevice()) {
        await signInWithRedirect(auth, provider);
        return; // Page will redirect to Google — setLoading stays true intentionally
      }

      // On desktop, try popup first
      try {
        const userCredential = await signInWithPopup(auth, provider);
        const idToken = await userCredential.user.getIdToken(/* forceRefresh */ true);

        const response = await authService.firebaseLogin(
          idToken,
          role,
          userCredential.user.displayName || undefined
        );

        if (response.success && response.data) {
          sessionStorage.removeItem('vv_auth_role');
          sessionStorage.removeItem('vv_auth_redirect');
          setUser(response.data.user, response.data.token);
          toast.success(`Welcome, ${response.data.user.name}!`);

          if (onSuccess) {
            onSuccess();
          } else {
            // Store user immediately and navigate
            const u = response.data.user;
            const currentStore = useAuthStore.getState();
            const redir = currentStore ? null : null; // just read store
            if (u.role === 'ADMIN') {
              navigate(redirectUrl || '/admin/dashboard', { replace: true });
            } else if (u.role === 'OWNER') {
              navigate(redirectUrl || '/owner/dashboard', { replace: true });
            } else {
              navigate(redirectUrl || '/user/dashboard', { replace: true });
            }
          }
        }
      } catch (popupErr: any) {
        // If popup was blocked or failed on desktop, fallback to redirect
        if (
          popupErr.code === 'auth/popup-blocked' ||
          popupErr.code === 'auth/cancelled-popup-request' ||
          popupErr.code === 'auth/operation-not-supported-in-this-environment'
        ) {
          toast.loading('Redirecting to Google...', { duration: 2000 });
          await signInWithRedirect(auth, provider);
          return;
        }

        if (popupErr.code === 'auth/popup-closed-by-user') {
          // User deliberately closed the popup window — not an error
          setLoading(false);
          return;
        }

        throw popupErr;
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Google sign-in could not be completed. Please try again.';
      toast.error(msg);
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
      <span>{loading ? 'Connecting to Google...' : 'Continue with Google / Gmail'}</span>
    </button>
  );
};
