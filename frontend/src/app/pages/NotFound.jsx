import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center justify-center text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] -z-10"></div>

      <div>
        <p className="text-[#E89B3C] text-xs uppercase tracking-[0.35em] mb-4">Page not found</p>
        <h1
          className="text-5xl sm:text-6xl text-white mb-4"
          style={{ fontFamily: "'Boston Angel', 'Great Vibes', cursive", letterSpacing: '0.02em' }}
        >
          Nothing here
        </h1>
        <p className="text-white/60 mb-10 max-w-md mx-auto">
          The page you were looking for has moved or never existed.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#531323] hover:bg-[#731830] text-white px-8 py-3 rounded-full transition-all"
        >
          Browse the collections
        </Link>
      </div>
    </div>
  );
}
