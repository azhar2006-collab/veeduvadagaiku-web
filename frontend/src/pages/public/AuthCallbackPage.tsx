import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

/**
 * AuthCallbackPage — handles the Firebase signInWithRedirect result.
 *
 * Firebase redirects back to the app at the `authDomain` callback URL,
 * but the actual page that ends up rendering is wherever the user was
 * before the redirect (e.g. /login). We route ALL redirect handling here
 * at /auth/callback so it is clean and isolated from any other page logic.
 *
 * Flow:
 *   1. User clicks "Continue with Google" on LoginPage
 *   2. We set localStorage keys: vv_auth_role, vv_auth_redirect
 *   3. signInWithRedirect is called → browser leaves to Google
 *   4. Google redirects back → Firebase SDK intercepts at authDomain
 *   5. Firebase SDK redirects to our app's redirectUrl (set in firebase config)
 *      → We set this to /auth/callback in handleGoogleSignIn
 *   6. This page calls getRedirectResult, processes the credential, navigates
 */
export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    const handleRedirect = async () => {
      try {
        // Read saved role + redirect from localStorage (survives mobile redirects)
        const savedRole =
          (localStorage.getItem('vv_auth_role') as 'USER' | 'OWNER') || 'USER';
        const savedRedirect = localStorage.getItem('vv_auth_redirect') || null;

        const credential = await getRedirectResult(auth);

        if (!credential || !credential.user) {
          // No redirect result — user navigated here directly or result already consumed
          // Just redirect to login
          if (!cancelled) navigate('/login', { replace: true });
          return;
        }

        // Force-refresh the token so the backend always gets a fresh JWT
        const idToken = await credential.user.getIdToken(true);

        const response = await authService.firebaseLogin(
          idToken,
          savedRole,
          credential.user.displayName || undefined
        );

        // Clean up localStorage
        localStorage.removeItem('vv_auth_role');
        localStorage.removeItem('vv_auth_redirect');

        if (!response.success || !response.data) {
          throw new Error('Login failed — server returned no user data.');
        }

        const { user, token } = response.data;

        // Persist user + token to Zustand store (also writes to localStorage)
        setUser(user, token);

        if (!cancelled) {
          toast.success(`Welcome, ${user.name || 'back'}!`);

          // Navigate to role-appropriate dashboard
          if (savedRedirect) {
            navigate(savedRedirect, { replace: true });
          } else if (user.role === 'ADMIN') {
            navigate('/admin/dashboard', { replace: true });
          } else if (user.role === 'OWNER') {
            navigate('/owner/dashboard', { replace: true });
          } else {
            navigate('/user/dashboard', { replace: true });
          }
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('[AuthCallback] redirect result error:', err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Google sign-in failed. Please try again.';
        setErrorMsg(msg);
        setStatus('error');
        localStorage.removeItem('vv_auth_role');
        localStorage.removeItem('vv_auth_redirect');
      }
    };

    handleRedirect();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-2xl">!</div>
        <h2 className="text-lg font-bold text-gray-800">Sign-in failed</h2>
        <p className="text-sm text-gray-500 text-center max-w-xs">{errorMsg}</p>
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="mt-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white font-bold rounded-xl text-sm"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#D4AF37] animate-spin" />
      </div>
      <p className="text-sm font-semibold text-gray-600">Signing you in with Google…</p>
      <p className="text-xs text-gray-400">Please wait, this only takes a moment.</p>
    </div>
  );
};
