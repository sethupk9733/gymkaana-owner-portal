import { useState } from "react";
import { Mail, Lock, User, Phone, ArrowRight, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { login, register, googleLogin, verifyOTP, resendOTP, forgotPassword, resetPassword } from "../lib/api";
import { GoogleLogin } from '@react-oauth/google';

interface OwnerLoginProps {
  onLogin: () => void;
}

export function OwnerLogin({ onLogin }: OwnerLoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: send email, 2: verify otp & new pass
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '' });

  const handleGoogleSuccess = async (response: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await googleLogin({ idToken: response.credential, role: 'owner' });
      if (result.accessToken) {
        if (!result.roles?.includes('owner')) {
          setError('Access denied: You must be an owner');
        } else {
          onLogin();
        }
      } else {
        setError(result.message || "Google login failed");
      }
    } catch (err: any) {
      setError(err.message || "Google login error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (isSignUp) {
        const res = await register({ ...formData, role: 'owner' });
        if (res.requiresVerification) {
          setShowOTP(true);
          setMessage(res.message);
        } else if (res.accessToken) {
          onLogin();
        } else {
          setError(res.message || 'Signup failed');
        }
      } else {
        const res = await login({ email: formData.email, password: formData.password });
        if (res.requiresVerification) {
          setError(null);
          setMessage('Account not verified. Please enter the OTP sent to your email.');
          setShowOTP(true);
        } else if (res.accessToken) {
          if (!res.roles?.includes('owner')) {
            setError('Access denied: You must be an owner');
          } else {
            onLogin();
          }
        } else {
          setError(res.message || 'Login failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOTP(formData.email, otp);
      if (res.accessToken) {
        onLogin();
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await forgotPassword(resetData.email);
      setMessage(res.message);
      setResetStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await resetPassword(resetData);
      setMessage(res.message);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetStep(1);
        setMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (showOTP) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <ShieldCheck className="text-blue-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verify Account</h2>
            <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code sent to {formData.email}</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium text-center">{error}</div>}
          {message && <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 text-xs font-medium text-center">{message}</div>}

          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <Input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000 000"
              className="text-center text-2xl tracking-[1em] font-black h-16"
              required
            />
            <Button type="submit" className="w-full h-12 bg-gray-900 font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Verify & Sign In"}
            </Button>
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await resendOTP(formData.email);
                  setMessage(res.message);
                } catch (e: any) {
                  setError(e.message);
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full text-xs font-bold text-blue-600 uppercase tracking-widest mt-4"
            >
              Resend Code
            </button>
            <button onClick={() => setShowOTP(false)} title="Back" className="w-full text-xs text-gray-400 font-bold uppercase tracking-widest">Back to Login</button>
          </form>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <KeyRound className="text-blue-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-sm text-gray-500 mt-2">
              {resetStep === 1 ? "Enter your email to receive a reset code" : "Enter the code and your new password"}
            </p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium text-center">{error}</div>}
          {message && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-medium text-center">{message}</div>}

          {resetStep === 1 ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                type="email"
                value={resetData.email}
                onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                placeholder="email@example.com"
                required
              />
              <Button type="submit" className="w-full h-12 bg-gray-900 font-bold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Send Reset Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                type="text"
                maxLength={6}
                value={resetData.otp}
                onChange={(e) => setResetData({ ...resetData, otp: e.target.value })}
                placeholder="Reset Code"
                className="text-center"
                required
              />
              <Input
                type="password"
                value={resetData.newPassword}
                onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                placeholder="New Password"
                required
              />
              <Button type="submit" className="w-full h-12 bg-gray-900 font-bold" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
              </Button>
            </form>
          )}
          <button onClick={() => setShowForgotPassword(false)} className="w-full text-xs text-gray-400 font-bold uppercase tracking-widest mt-6">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-4 flex items-center justify-center">
            <User className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gymkaana Owner</h1>
          <p className="text-blue-100 text-sm mt-1">
            {isSignUp ? "Join our partner network" : "Manage your fitness business"}
          </p>
        </div>

        {/* Form Section */}
        <div className="px-8 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="98765 43210"
                      className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50"
                  required
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-lg shadow-gray-200 transition-all active:scale-[0.98] mt-2 group"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (isSignUp ? "Create Account" : "Sign In")}
              {!loading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
                useOneTap
                theme="outline"
                shape="rectangular"
                text={isSignUp ? "signup_with" : "signin_with"}
                width="100%"
              />
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
