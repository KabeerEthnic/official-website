import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Shared admin building blocks. They reuse the storefront's palette —
 * deep green, ivory type, amber accent — so the dashboard reads as part of the
 * same boutique rather than a generic back office.
 */

export const inputClass =
  'w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#E89B3C] focus:outline-none transition-colors';

export const labelClass = 'block text-white/60 text-xs uppercase tracking-wider mb-2';

export function Panel({ title, description, actions, children, className = '' }) {
  return (
    <section className={`bg-white/5 border border-white/10 rounded-2xl ${className}`}>
      {title || actions ? (
        <header className="flex flex-wrap items-start justify-between gap-4 px-6 py-5 border-b border-white/10">
          <div>
            {title ? <h2 className="text-white font-serif text-xl">{title}</h2> : null}
            {description ? <p className="text-white/50 text-sm mt-1">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </header>
      ) : null}
      <div className="p-6">{children}</div>
    </section>
  );
}

export function Field({ label, htmlFor, hint, error, required = false, children }) {
  return (
    <div>
      {label ? (
        <label className={labelClass} htmlFor={htmlFor}>
          {label}
          {required ? <span className="text-[#E89B3C] ml-1" aria-hidden="true">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="text-xs text-[#E89B3C] mt-2">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-white/35 mt-2">{hint}</p> : null}
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary: 'bg-[#531323] hover:bg-[#731830] text-white',
  accent: 'bg-[#E89B3C] hover:bg-[#d4823a] text-[#1a1207]',
  ghost: 'bg-white/5 hover:bg-white/10 text-white border border-white/15',
  danger: 'bg-red-500/15 hover:bg-red-500/25 text-red-200 border border-red-400/25',
};

export function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`px-5 py-2.5 rounded-full text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

const PILL_TONES = {
  neutral: 'bg-white/10 text-white/70',
  success: 'bg-green-500/20 text-green-300',
  warning: 'bg-[#E89B3C]/20 text-[#E89B3C]',
  danger: 'bg-red-500/20 text-red-300',
};

export function Pill({ tone = 'neutral', children }) {
  return (
    <span className={`inline-block text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap ${PILL_TONES[tone]}`}>
      {children}
    </span>
  );
}

/** Horizontal scroll keeps wide tables usable on a phone without redesigning them. */
export function Table({ head, children, empty }) {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-white/40 text-xs uppercase tracking-wider">
            {head.map((column) => (
              <th key={column} className="text-left font-medium pb-3 pr-4">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

export function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;

  return (
    <nav className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-white/10" aria-label="Pages">
      <p className="text-white/40 text-xs">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" disabled={page <= 1} onClick={() => onChange(page - 1)} className="px-3 py-2">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="px-3 py-2">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
}

export function StatusMessage({ status }) {
  if (!status?.message) return null;

  return (
    <p
      role="status"
      className={`text-sm ${status.state === 'error' ? 'text-[#E89B3C]' : 'text-green-300'}`}
    >
      {status.message}
    </p>
  );
}
