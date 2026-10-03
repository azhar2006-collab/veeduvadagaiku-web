import React, { useState, useEffect, useRef } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { Phone, KeyRound, ArrowRight, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface PhoneOTPFormProps {
  role?: 'USER' | 'OWNER';
  onSuccess?: () => void;
}

export const PhoneOTPForm: React.FC<PhoneOTPFormProps> = ({ role, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(0);

  const { setUser } = useAuth();
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Initialize invisible recaptcha
    if (!recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
        });
      } catch (err) {
        console.error('Recaptcha init failed:', err);
      }
    }

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
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );
      setConfirmationResult(confirmation);
      setStep('OTP');
      setCountdown(60);
      toast.success('OTP sent to your mobile number!');
    } catch (err: any) {
      console.error('SMS OTP Error:', err);
      toast.error(err.message || 'Failed to send OTP. Please try again.');
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
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div id="recaptcha-container"></div>

      {step === 'PHONE' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Mobile Number (Chennai / India)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
                +91
              </div>
              <input
                type="tel"
                maxLength={10}
                required
                placeholder="98400 12345"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-orange-500/20 active:scale-[0.99] disabled:opacity-50"
          >
            <span>{loading ? 'Sending OTP...' : 'Send OTP via SMS'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Enter 6-Digit OTP
              </label>
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="text-xs text-orange-600 hover:underline font-semibold"
              >
                Change Number (+91 {phoneNumber})
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold tracking-widest text-center text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-orange-500/20 active:scale-[0.99] disabled:opacity-50"
          >
            <span>{loading ? 'Verifying OTP...' : 'Verify & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            {countdown > 0 ? (
              <p className="text-xs text-gray-400 font-medium">Resend OTP in {countdown}s</p>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
