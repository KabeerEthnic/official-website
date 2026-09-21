import { Loader2 } from 'lucide-react';

/**
 * The shared loading / empty / error states, in the storefront's own palette.
 * `tone` switches between the dark green pages and the ivory boutique pages so
 * these never look bolted on.
 */
const TONES = {
  dark: {
    surface: 'bg-[#0F2418]',
    text: 'text-white',
    muted: 'text-white/60',
    button: 'bg-white/10 hover:bg-white/20 text-white border border-white/15',
    spinner: 'text-[#E89B3C]',
  },
  ivory: {
    surface: 'bg-[#FAF8F5]',
    text: 'text-[#2D2A26]',
    muted: 'text-[#8C7E7A]',
    button: 'bg-[#2D2A26] hover:bg-[#E89B3C] text-white border border-transparent',
    spinner: 'text-[#8C7E7A]',
  },
};

export function PageLoader({ tone = 'dark', label = 'Loading', fullScreen = true }) {
  const theme = TONES[tone] ?? TONES.dark;

  return (
    <div
      className={`${fullScreen ? 'min-h-screen' : 'py-24'} ${theme.surface} flex flex-col items-center justify-center gap-4`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={`w-7 h-7 animate-spin ${theme.spinner}`} />
      <p className={`text-sm tracking-[0.25em] uppercase ${theme.muted}`}>{label}</p>
    </div>
  );
}

export function InlineLoader({ tone = 'dark', className = '' }) {
  const theme = TONES[tone] ?? TONES.dark;
  return (
    <div className={`flex items-center justify-center py-16 ${className}`} role="status">
      <Loader2 className={`w-6 h-6 animate-spin ${theme.spinner}`} />
    </div>
  );
}

export function ErrorState({
  tone = 'dark',
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) {
  const theme = TONES[tone] ?? TONES.dark;

  return (
    <div className={`text-center py-20 px-6 ${className}`} role="alert">
      <h2 className={`font-serif text-2xl mb-3 ${theme.text}`}>{title}</h2>
      {message ? <p className={`text-sm mb-6 max-w-md mx-auto ${theme.muted}`}>{message}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={`px-7 py-2.5 rounded-full text-sm transition-colors ${theme.button}`}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ tone = 'dark', title, message, action, className = '' }) {
  const theme = TONES[tone] ?? TONES.dark;

  return (
    <div className={`text-center py-20 px-6 ${className}`}>
      <p className={`font-serif italic text-xl mb-2 ${theme.text}`}>{title}</p>
      {message ? <p className={`text-sm mb-6 ${theme.muted}`}>{message}</p> : null}
      {action}
    </div>
  );
}
