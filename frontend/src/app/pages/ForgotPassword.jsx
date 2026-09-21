import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';

import { auth } from '../../lib/api/index.js';
import { OtpForm } from '../components/OtpForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FIELD_CLASS =
  'w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors';

/**
 * Password reset by emailed code: ask for the address, then enter the code and
 * a new password together. The request step always reports success, because the
 * API deliberately will not say whether an address has an account.
 */
export function ForgotPassword() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sentTo, setSentTo] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestCode = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await auth.forgotPassword(email);
      setSentTo(email.trim().toLowerCase());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const completeReset = async (code) => {
    if (newPassword.length < 10) {
      throw new Error('Choose a new password of at least 10 characters.');
    }

    const user = await auth.resetPassword({ email: sentTo, code, newPassword });
    setUser(user);
    navigate('/account', { replace: true });
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
            {sentTo ? 'Check your email' : 'Reset Password'}
          </h1>
          <p className="text-white/60 text-sm">
            {sentTo
              ? 'Enter the code and choose a new password'
              : 'We will email you a code to set a new password'}
          </p>
        </div>

        <div className="relative">
          {sentTo ? (
            <OtpForm
              email={sentTo}
              submitLabel="Set new password"
              onSubmit={completeReset}
              onResend={() => auth.forgotPassword(sentTo)}
            >
              <div>
                <label htmlFor="new-password" className="block text-white/70 text-sm mb-2">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className={FIELD_CLASS}
                />
                <p className="text-xs text-white/40 mt-2">
                  At least 10 characters. This signs you out everywhere else.
                </p>
              </div>
            </OtpForm>
          ) : (
            <form className="space-y-6" onSubmit={requestCode}>
              <div>
                <label htmlFor="email" className="block text-white/70 text-sm mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={FIELD_CLASS}
                  placeholder="your@email.com"
                />
              </div>

              {error ? <p className="text-sm text-[#E89B3C]" role="alert">{error}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#531323] hover:bg-[#731830] text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send reset code'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center border-t border-white/10 pt-6 relative">
          <p className="text-white/60 text-sm">
            Remembered it?{' '}
            <Link to="/login" className="text-[#E89B3C] hover:text-white transition-colors font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
