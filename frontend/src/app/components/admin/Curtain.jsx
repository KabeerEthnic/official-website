import { useEffect, useState } from 'react';
import { Theater } from 'lucide-react';

import { admin } from '../../../lib/api/index.js';
import { formatDate } from '../../../lib/format.js';
import { useSite } from '../../context/SiteContext.jsx';
import { useQuery } from '../../hooks/useQuery.js';
import { InlineLoader } from '../Feedback.jsx';
import { Button, Field, Panel, StatusMessage, inputClass } from './ui.jsx';

/** Shared by the sidebar switch and the overview panel so both stay in step. */
function useCurtainToggle() {
  const { curtain, curtainDown, setCurtain } = useSite();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const toggle = async () => {
    setBusy(true);
    setError('');
    try {
      setCurtain(await admin.updateCurtain({ enabled: !curtainDown }));
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  return { curtain, curtainDown, busy, error, toggle };
}

/**
 * The one-click switch in the admin sidebar: closes or reopens the whole
 * storefront from any admin page.
 */
export function CurtainSwitch() {
  const { curtain, curtainDown, busy, error, toggle } = useCurtainToggle();

  return (
    <div
      className={`mx-3 mt-3 rounded-2xl border p-4 ${
        curtainDown ? 'border-[#E89B3C]/40 bg-[#531323]/60' : 'border-white/10 bg-white/5'
      }`}
    >
      <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/55">
        <span
          className={`inline-block h-2 w-2 rounded-full ${curtainDown ? 'bg-[#E89B3C]' : 'bg-green-400'}`}
          aria-hidden="true"
        />
        {curtain === null ? 'Checking store…' : curtainDown ? 'Curtain is down' : 'Store is open'}
      </p>
      <button
        type="button"
        onClick={toggle}
        disabled={busy || curtain === null}
        aria-pressed={curtainDown}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
          curtainDown
            ? 'bg-[#E89B3C] text-[#1a1207] hover:bg-[#d4823a]'
            : 'bg-[#531323] text-white hover:bg-[#731830]'
        }`}
      >
        <Theater className="h-4 w-4" />
        {busy ? 'Working…' : curtainDown ? 'Lift curtain' : 'Drop curtain'}
      </button>
      {error ? <p className="mt-2 text-xs text-[#E89B3C]">{error}</p> : null}
    </div>
  );
}

/** Overview panel: the same switch, plus the words shoppers see behind it. */
export function CurtainPanel() {
  const { curtain, curtainDown, busy, error, toggle } = useCurtainToggle();
  const { setCurtain } = useSite();
  const { data, loading } = useQuery((options) => admin.curtain(options), []);

  const [form, setForm] = useState({ title: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (data) setForm({ title: data.title, message: data.message });
  }, [data]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      setCurtain(await admin.updateCurtain(form));
      setStatus({ state: 'success', message: 'Curtain wording saved.' });
    } catch (failure) {
      setStatus({ state: 'error', message: failure.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      title="Site curtain"
      description={
        curtainDown
          ? `The storefront is closed to shoppers${curtain?.since ? ` since ${formatDate(curtain.since)}` : ''}. You still see the real site.`
          : 'Close the whole storefront in one click — for maintenance, a stock refresh or a launch reveal.'
      }
      actions={
        <Button variant={curtainDown ? 'accent' : 'primary'} onClick={toggle} disabled={busy || curtain === null}>
          {busy ? 'Working…' : curtainDown ? 'Lift curtain' : 'Drop curtain'}
        </Button>
      }
    >
      {error ? <p className="mb-4 text-sm text-[#E89B3C]">{error}</p> : null}
      {loading ? (
        <InlineLoader />
      ) : (
        <form onSubmit={save} className="space-y-5">
          <Field label="Heading" htmlFor="curtain-title" required>
            <input
              id="curtain-title"
              className={inputClass}
              value={form.title}
              maxLength={120}
              required
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
          </Field>
          <Field label="Message" htmlFor="curtain-message" hint="Shown under the heading while the curtain is down.">
            <textarea
              id="curtain-message"
              className={`${inputClass} min-h-24`}
              value={form.message}
              maxLength={600}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" variant="ghost" disabled={saving}>
              {saving ? 'Saving…' : 'Save wording'}
            </Button>
            <StatusMessage status={status} />
          </div>
        </form>
      )}
    </Panel>
  );
}
