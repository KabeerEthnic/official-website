import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import { admin } from '../../../lib/api/index.js';
import { ErrorState, InlineLoader } from '../../components/Feedback.jsx';
import { Button, Field, Panel, Pill, StatusMessage, Table, inputClass } from '../../components/admin/ui.jsx';
import { useQuery } from '../../hooks/useQuery.js';

const EMPTY = { name: '', headline: '', description: '', position: 0, visible: true };

export function Categories() {
  const { data: categories, loading, error, refetch } = useQuery(
    (options) => admin.categories(options),
    [],
  );

  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ state: 'saving', message: '' });

    try {
      if (editing) await admin.updateCategory(editing, form);
      else await admin.createCategory(form);

      setForm(EMPTY);
      setEditing(null);
      setStatus({ state: 'done', message: editing ? 'Category updated.' : 'Category created.' });
      refetch();
    } catch (saveError) {
      setStatus({ state: 'error', message: saveError.message });
    }
  };

  const edit = (category) => {
    setEditing(category.id);
    setForm({
      name: category.name,
      headline: category.headline ?? '',
      description: category.description ?? '',
      position: category.position,
      visible: category.visible,
    });
  };

  const remove = async (category) => {
    if (!window.confirm(`Delete "${category.name}"?`)) return;

    try {
      await admin.deleteCategory(category.id);
      setStatus({ state: 'done', message: 'Category deleted.' });
      refetch();
    } catch (deleteError) {
      setStatus({ state: 'error', message: deleteError.message });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Categories</h1>
        <p className="text-white/50 text-sm mt-1">
          Collections shown in the navigation and the shop switcher.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Panel className="xl:col-span-2" title="All collections">
          {loading ? (
            <InlineLoader />
          ) : error ? (
            <ErrorState message={error.message} onRetry={refetch} />
          ) : (
            <Table
              head={['Name', 'Shop label', 'Products', 'Order', 'Visible', '']}
              empty={categories.length === 0 ? <p className="text-white/40 text-sm py-6">No categories yet.</p> : null}
            >
              {categories.map((category) => (
                <tr key={category.id} className="text-white/80">
                  <td className="py-3 pr-4">
                    <button type="button" onClick={() => edit(category)} className="hover:text-[#E89B3C] transition-colors">
                      {category.name}
                    </button>
                    <span className="block text-white/35 text-xs">/{category.slug}</span>
                  </td>
                  <td className="py-3 pr-4 text-white/60">{category.headline}</td>
                  <td className="py-3 pr-4">{category.productCount ?? 0}</td>
                  <td className="py-3 pr-4">{category.position}</td>
                  <td className="py-3 pr-4">
                    <Pill tone={category.visible ? 'success' : 'neutral'}>{category.visible ? 'Visible' : 'Hidden'}</Pill>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <Button variant="ghost" className="px-3 py-1.5 text-xs" aria-label="Delete category" onClick={() => remove(category)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        <Panel
          title={editing ? 'Edit collection' : 'New collection'}
          actions={
            editing ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setForm(EMPTY);
                }}
              >
                Cancel
              </Button>
            ) : null
          }
        >
          <form onSubmit={submit} className="space-y-5">
            <Field label="Name" htmlFor="category-name" hint="Used in the site navigation.">
              <input id="category-name" required value={form.name} onChange={update('name')} className={inputClass} />
            </Field>
            <Field label="Shop label" htmlFor="category-headline" hint="Longer phrase for the shop switcher.">
              <input id="category-headline" value={form.headline} onChange={update('headline')} className={inputClass} />
            </Field>
            <Field label="Description" htmlFor="category-description">
              <textarea id="category-description" rows={3} value={form.description} onChange={update('description')} className={inputClass} />
            </Field>
            <Field label="Order" htmlFor="category-position">
              <input id="category-position" type="number" min="0" value={form.position} onChange={update('position')} className={inputClass} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={form.visible} onChange={update('visible')} />
              Visible in the storefront
            </label>

            <StatusMessage status={status} />

            <Button type="submit" variant="accent" disabled={status.state === 'saving'}>
              {status.state === 'saving' ? 'Saving…' : editing ? 'Update collection' : 'Create collection'}
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
