import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';

import { auth } from '../../lib/api/index.js';
import { OtpForm } from '../components/OtpForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FIELD_CLASS =
  'w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors';

export function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  // Set once the account exists and the code has been emailed.
  const [pendingEmail, setPendingEmail] = useState(null);

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      const result = await auth.register({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
      });
      setPendingEmail(result.email);
    } catch (registerError) {
      // A half-finished signup is recoverable: go straight to the code step.
      if (registerError.code === 'EMAIL_UNVERIFIED') {
        await auth.resendVerification(form.email).catch(() => {});
        setPendingEmail(form.email.trim().toLowerCase());
        return;
      }
      setError(registerError.message);
      setFieldErrors(registerError.fieldErrors ?? {});
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (code) => {
    const user = await auth.verifyEmail({ email: pendingEmail, code });
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
        className="w-full max-w-lg bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E89B3C]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#531323]/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="text-center mb-10 relative z-10">
          <h1
            className="text-4xl text-white mb-2"
            style={{ fontFamily: "'Boston Angel', 'Great Vibes', cursive", letterSpacing: '0.02em' }}
          >
            {pendingEmail ? 'Check your email' : 'Create Account'}
          </h1>
          <p className="text-white/60 text-sm">
            {pendingEmail
              ? 'One last step to finish setting up your account'
              : 'Join us for an exclusive ethnic wear experience'}
          </p>
        </div>

        <div className="relative z-10">
          {pendingEmail ? (
            <OtpForm
              email={pendingEmail}
              submitLabel="Verify and continue"
              onSubmit={handleVerify}
              onResend={() => auth.resendVerification(pendingEmail)}
            />
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-white/70 text-sm mb-2">First Name</label>
                  <input id="firstName" required type="text" autoComplete="given-name" value={form.firstName} onChange={update('firstName')} className={FIELD_CLASS} />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-white/70 text-sm mb-2">Last Name</label>
                  <input id="lastName" type="text" autoComplete="family-name" value={form.lastName} onChange={update('lastName')} className={FIELD_CLASS} />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-white/70 text-sm mb-2">Email Address</label>
                <input id="email" required type="email" autoComplete="email" value={form.email} onChange={update('email')} className={FIELD_CLASS} />
                <p className="text-xs text-white/40 mt-2">
                  {fieldErrors.email ?? 'We will send a code here to confirm it is yours.'}
                </p>
              </div>
              <div>
                <label htmlFor="password" className="block text-white/70 text-sm mb-2">Password</label>
                <input id="password" required minLength={10} type="password" autoComplete="new-password" value={form.password} onChange={update('password')} className={FIELD_CLASS} />
                <p className="text-xs text-white/40 mt-2">
                  {fieldErrors.password ?? 'At least 10 characters.'}
                </p>
              </div>

              {error ? <p className="text-sm text-[#E89B3C]" role="alert">{error}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#531323] hover:bg-[#731830] text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              >
                {submitting ? 'Creating…' : 'Create Account'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center border-t border-white/10 pt-6 relative z-10">
          <p className="text-white/60 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E89B3C] hover:text-white transition-colors font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
