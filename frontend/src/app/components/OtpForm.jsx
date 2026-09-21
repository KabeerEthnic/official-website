import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const FIELD_CLASS =
  'w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors';

/**
 * The six-digit code step, shared by email verification and password reset.
 *
 * The input is a single field rather than six boxes: it pastes cleanly from a
 * mail client, works with one-time-code autofill, and is far easier to use on
 * a phone. `autoComplete="one-time-code"` lets iOS and Android offer the code
 * straight from the notification.
 */
export function OtpForm({
  email,
  onSubmit,
  onResend,
  submitLabel = 'Verify',
  children,
  cooldownSeconds = 60,
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (code.length !== 6 || submitting) return;

    setError('');
    setSubmitting(true);
    try {
      await onSubmit(code);
    } catch (submitError) {
      setError(submitError.message);
      setCode('');
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    try {
      await onResend();
      setNotice('A new code is on its way.');
      setCooldown(cooldownSeconds);
    } catch (resendError) {
      setError(resendError.message);
    }
  };

  return (
    <form className="space-y-6 relative" onSubmit={handleSubmit}>
      <p className="text-white/60 text-sm text-center">
        We sent a six-digit code to
        <br />
        <span className="text-white">{email}</span>
      </p>

      <div>
        <label htmlFor="otp" className="block text-white/70 text-sm mb-2">
          Verification code
        </label>
        <input
          id="otp"
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className={`${FIELD_CLASS} text-center text-2xl tracking-[0.5em] font-mono`}
        />
      </div>

      {children}

      {error ? (
        <p className="text-sm text-[#E89B3C]" role="alert">
          {error}
        </p>
      ) : null}
      {!error && notice ? (
        <p className="text-sm text-green-300" role="status">
          {notice}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || code.length !== 6}
        className="w-full flex items-center justify-center gap-2 bg-[#531323] hover:bg-[#731830] text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Checking…' : submitLabel} <ArrowRight className="w-4 h-4" />
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-sm text-[#E89B3C] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Send another code in ${cooldown}s` : 'Send another code'}
        </button>
      </div>
    </form>
  );
}
