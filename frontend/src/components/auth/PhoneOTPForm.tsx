import React, { useState, useEffect, useRef } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { Phone, KeyRound, ArrowRight, RotateCcw, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface PhoneOTPFormProps {
  role?: 'USER' | 'OWNER';
  containerId?: string;
  onSuccess?: () => void;
}

function getFriendlyFirebaseError(err: any): string {
  const code = err?.code || '';
  const msg = err?.message || '';

  if (code.includes('invalid-phone-number')) {
    return 'Please enter a valid 10-digit Indian mobile number.';
  }
  if (code.includes('too-many-requests')) {
    return 'Too many OTP requests. Please wait a minute or use Quick Demo Login below.';
  }
  if (code.includes('quota-exceeded')) {
    return 'Firebase SMS limit reached for today. Please use Quick Demo Login to continue.';
  }
  if (code.includes('unauthorized-domain')) {
    return 'Domain not authorized in Firebase Console. Please use Quick Demo Login below.';
  }
  if (code.includes('captcha-check-failed') || code.includes('invalid-app-credential')) {
    return 'reCAPTCHA check failed. Please try again or use Quick Demo Login.';
  }
  if (code.includes('invalid-verification-code')) {
    return 'Incorrect 6-digit OTP code. Please check and re-enter.';
  }
  if (code.includes('code-expired')) {
    return 'OTP has expired. Please click Resend OTP.';
  }
  if (msg.includes('argument-error') || msg.includes('container')) {
    return 'Verification container refreshed. Please try clicking Send OTP again.';
  }
  return msg.replace(/^Firebase:\s*/i, '') || 'Failed to authenticate. Please try again.';
}

export const PhoneOTPForm: React.FC<PhoneOTPFormProps> = ({
  role = 'USER',
  containerId = 'recaptcha-container',
  onSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(0);

  const { setUser } = useAuth();
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Clean up recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const initRecaptcha = () => {
    try {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
        recaptchaVerifierRef.current = null;
      }

      // Check if container element is present
      const targetElement = containerRef.current || document.getElementById(containerId);
      if (!targetElement) {
        console.warn('Target recaptcha element not yet mounted');
      }

      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, targetElement || containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          console.warn('Recaptcha expired');
        },
      });

      return recaptchaVerifierRef.current;
    } catch (err) {
      console.error('Recaptcha initialization error:', err);
      return null;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    const formattedPhone = `+91${cleanPhone}`;
    setLoading(true);

    try {
      const verifier = initRecaptcha();
      if (!verifier) {
        throw new Error('Unable to initialize verification. Please try Quick Demo Login.');
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmation);
      setStep('OTP');
      setCountdown(60);
      toast.success('OTP sent to your mobile number!');
    } catch (err: any) {
      console.error('SMS OTP Error:', err);
      const friendlyMsg = getFriendlyFirebaseError(err);
      toast.error(friendlyMsg);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      toast.error('Session expired. Please request OTP again.');
      setStep('PHONE');
      return;
    }
    if (otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      const response = await authService.firebaseLogin(idToken, role);

      if (response.success && response.data) {
        setUser(response.data.user, response.data.token);
        toast.success(`Welcome, ${response.data.user.name}!`);
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      const friendlyMsg = getFriendlyFirebaseError(err);
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  // Instant Quick Demo Mobile Login (bypasses carrier SMS / quota blocks)
  const handleQuickDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const cleanPhone = phoneNumber.trim().replace(/\D/g, '') || '9840012345';
      const demoToken = `demo_tenant_token_${cleanPhone}`;
      const response = await authService.firebaseLogin(
        demoToken,
        role,
        `User ${cleanPhone.slice(-4)}`
      );

      if (response.success && response.data) {
        setUser(response.data.user, response.data.token);
        toast.success(`Verified as +91 ${cleanPhone}! Landlord details unlocked.`);
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('Demo Login Error:', err);
      toast.error('Quick login failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Recaptcha Container */}
      <div ref={containerRef} id={containerId}></div>

      {step === 'PHONE' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Mobile Number (Chennai / India)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C5A059] font-bold text-sm">
                +91
              </div>
              <input
                type="tel"
                maxLength={10}
                required
                placeholder="98400 12345"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-14 pr-4 py-3 bg-white border border-[#E8DFC8] rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/25 focus:border-[#C5A059] transition shadow-xs"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              We'll send a 6-digit verification OTP to this number.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 text-white font-bold text-sm rounded-xl transition shadow-md shadow-[#D4AF37]/25 active:scale-[0.99] disabled:opacity-50"
          >
            <span>{loading ? 'Sending OTP...' : 'Send OTP via SMS'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-[#F0E8D5]">
            <button
              type="button"
              disabled={loading || demoLoading}
              onClick={handleQuickDemoLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#FCFAF5] hover:bg-[#F9F4E8] text-[#9A7818] border border-[#E8DFC8] font-bold text-xs rounded-xl transition active:scale-[0.99]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{demoLoading ? 'Logging in...' : 'Quick Mobile Login (Skip SMS OTP)'}</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Enter 6-Digit OTP
              </label>
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="text-xs text-[#C5A059] hover:underline font-semibold"
              >
                Change Number (+91 {phoneNumber})
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <KeyRound className="w-4 h-4 text-[#C5A059]" />
              </div>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8DFC8] rounded-xl text-gray-900 font-bold tracking-widest text-center text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/25 focus:border-[#C5A059] transition shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#B8860B] hover:brightness-105 text-white font-bold text-sm rounded-xl transition shadow-md shadow-[#D4AF37]/25 active:scale-[0.99] disabled:opacity-50"
          >
            <span>{loading ? 'Verifying OTP...' : 'Verify & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between pt-2 text-xs">
            {countdown > 0 ? (
              <span className="text-gray-400 font-medium">Resend OTP in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="inline-flex items-center gap-1.5 font-bold text-[#C5A059] hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resend OTP
              </button>
            )}

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="text-[#9A7818] font-bold hover:underline"
            >
              Skip OTP & Verify
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
