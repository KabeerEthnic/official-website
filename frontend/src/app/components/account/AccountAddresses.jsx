import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import { users } from '../../../lib/api/index.js';
import { useQuery } from '../../hooks/useQuery.js';
import { ErrorState, InlineLoader } from '../Feedback.jsx';

const FIELD_CLASS =
  'w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors';

const EMPTY = {
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

export function AccountAddresses() {
  const { data: addresses, loading, error, refetch } = useQuery(
    (options) => users.addresses(options),
    [],
  );

  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ state: 'saving', message: '' });

    try {
      await users.createAddress(form);
      setForm(EMPTY);
      setStatus({ state: 'done', message: 'Address saved.' });
      refetch();
    } catch (saveError) {
      setStatus({ state: 'error', message: saveError.message });
    }
  };

  const remove = async (id) => {
    try {
      await users.deleteAddress(id);
      refetch();
    } catch (deleteError) {
      setStatus({ state: 'error', message: deleteError.message });
    }
  };

  const makeDefault = async (id) => {
    try {
      await users.updateAddress(id, { isDefault: true });
      refetch();
    } catch (updateError) {
      setStatus({ state: 'error', message: updateError.message });
    }
  };

  return (
    <div>
      <h2 className="text-2xl text-white font-serif mb-6 pb-4 border-b border-white/10">Saved Addresses</h2>

      {loading ? (
        <InlineLoader />
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : (
        <div className="space-y-4 mb-10">
          {addresses.length === 0 ? (
            <p className="text-white/50 text-sm">No addresses saved yet.</p>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex justify-between gap-4">
                <div className="text-sm">
                  <p className="text-white font-medium">
                    {address.name}
                    {address.isDefault ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-[#E89B3C]">Default</span>
                    ) : null}
                  </p>
                  <p className="text-white/60 mt-1">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}
                  </p>
                  <p className="text-white/60">
                    {address.city}, {address.state} {address.postalCode}, {address.country}
                  </p>
                  <p className="text-white/40 mt-1">{address.phone}</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    type="button"
                    onClick={() => remove(address.id)}
                    aria-label="Delete address"
                    className="text-white/40 hover:text-[#E89B3C] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {!address.isDefault ? (
                    <button
                      type="button"
                      onClick={() => makeDefault(address.id)}
                      className="text-xs text-white/50 hover:text-[#E89B3C] transition-colors whitespace-nowrap"
                    >
                      Make default
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4 border-t border-white/10 pt-8">
        <h3 className="text-lg text-white mb-2">Add an address</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input required placeholder="Full name" value={form.name} onChange={update('name')} className={FIELD_CLASS} aria-label="Full name" />
          <input required placeholder="Phone" value={form.phone} onChange={update('phone')} className={FIELD_CLASS} aria-label="Phone" />
          <input required placeholder="Address line 1" value={form.line1} onChange={update('line1')} className={`${FIELD_CLASS} sm:col-span-2`} aria-label="Address line 1" />
          <input placeholder="Address line 2 (optional)" value={form.line2} onChange={update('line2')} className={`${FIELD_CLASS} sm:col-span-2`} aria-label="Address line 2" />
          <input required placeholder="City" value={form.city} onChange={update('city')} className={FIELD_CLASS} aria-label="City" />
          <input required placeholder="State" value={form.state} onChange={update('state')} className={FIELD_CLASS} aria-label="State" />
          <input required placeholder="PIN code" value={form.postalCode} onChange={update('postalCode')} className={FIELD_CLASS} aria-label="PIN code" />
          <input required placeholder="Country" value={form.country} onChange={update('country')} className={FIELD_CLASS} aria-label="Country" />
        </div>

        <label className="flex items-center gap-2 text-sm text-white/60">
          <input type="checkbox" checked={form.isDefault} onChange={update('isDefault')} />
          Use as my default address
        </label>

        {status.message ? (
          <p className={`text-sm ${status.state === 'error' ? 'text-[#E89B3C]' : 'text-green-300'}`} role="status">
            {status.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status.state === 'saving'}
          className="bg-[#531323] hover:bg-[#731830] text-white px-8 py-3 rounded-full transition-all disabled:opacity-60"
        >
          {status.state === 'saving' ? 'Saving…' : 'Save address'}
        </button>
      </form>
    </div>
  );
}
