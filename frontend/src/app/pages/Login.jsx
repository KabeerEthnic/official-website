import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';

import { auth } from '../../lib/api/index.js';
import { OtpForm } from '../components/OtpForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FIELD_CLASS =
  'w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors';

export function Login() {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Set when the account exists but the address was never confirmed.
  const [pendingEmail, setPendingEmail] = useState(null);

  const goOnwards = (user) => {
    // Return to wherever the visitor was headed before the sign-in wall.
    const fallback = user.role === 'ADMIN' ? '/admin' : '/account';
    navigate(location.state?.from ?? fallback, { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      goOnwards(await login(form));
    } catch (loginError) {
      // The password was right but the address was never confirmed: send a
      // fresh code and finish the job here rather than sending them away.
      if (loginError.code === 'EMAIL_UNVERIFIED') {
        await auth.resendVerification(form.email).catch(() => {});
        setPendingEmail(form.email.trim().toLowerCase());
        return;
      }
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (code) => {
    const user = await auth.verifyEmail({ email: pendingEmail, code });
    setUser(user);
    goOnwards(user);
  };

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E89B3C]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="text-center mb-10 relative">
          <h1
            className="text-4xl text-white mb-2"
            style={{ fontFamily: "'Boston Angel', 'Great Vibes', cursive", letterSpacing: '0.02em' }}
          >
            {pendingEmail ? 'Confirm your email' : 'Welcome Back'}
          </h1>
          <p className="text-white/60 text-sm">
            {pendingEmail
              ? 'This address was never confirmed — one code and you are in'
              : 'Enter your details to access your account'}
          </p>
        </div>

        {pendingEmail ? (
          <OtpForm
            email={pendingEmail}
            submitLabel="Verify and sign in"
            onSubmit={handleVerify}
            onResend={() => auth.resendVerification(pendingEmail)}
          />
        ) : (
          <form className="space-y-6 relative" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-email" className="block text-white/70 text-sm mb-2">Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className={FIELD_CLASS}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="login-password" className="block text-white/70 text-sm">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#E89B3C] hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className={FIELD_CLASS}
                placeholder="••••••••"
              />
            </div>

            {error ? <p className="text-sm text-[#E89B3C]" role="alert">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#531323] hover:bg-[#731830] text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-white/10 pt-6 relative">
          <p className="text-white/60 text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#E89B3C] hover:text-white transition-colors font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
