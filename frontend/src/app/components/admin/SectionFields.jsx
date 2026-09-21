import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Upload } from 'lucide-react';

import { admin } from '../../../lib/api/index.js';
import { Button, Field, inputClass } from './ui.jsx';

/**
 * Renders the admin form for one CMS section from the field descriptors the
 * backend publishes. The registry decides which inputs exist and which are
 * required; this file only decides what each input looks like, so a new section
 * type needs no frontend change to become editable.
 *
 * Validation errors come back from the API keyed by path ("items.10.name").
 * They are threaded down here so each message lands on the input that caused
 * it, rather than as one unreadable line at the bottom of the form.
 */

const join = (path, name) => (path ? `${path}.${name}` : String(name));

/** Does anything under this path have an error? Used to auto-open list rows. */
const hasErrorUnder = (errors, prefix) =>
  Object.keys(errors).some((key) => key === prefix || key.startsWith(`${prefix}.`));

function ImageField({ value, onChange, label, required, error }) {
  const fileInput = useRef(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setUploadError('');
    try {
      const asset = await admin.uploadMedia(file, 'content');
      onChange(asset.url);
    } catch (failure) {
      setUploadError(failure.message);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <Field label={label} required={required} error={uploadError || error}>
      <div className="flex gap-3 items-start">
        {value ? (
          <img src={value} alt="" className="w-16 h-20 object-cover rounded-lg flex-shrink-0" />
        ) : null}
        <div className="flex-1 space-y-2">
          <input
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://…"
            aria-label={`${label} URL`}
            className={inputClass}
          />
          <input ref={fileInput} type="file" accept="image/*" onChange={upload} className="hidden" />
          <Button variant="ghost" className="text-xs px-4 py-1.5" disabled={busy} onClick={() => fileInput.current?.click()}>
            <span className="inline-flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" /> {busy ? 'Uploading…' : 'Upload'}
            </span>
          </Button>
        </div>
      </div>
    </Field>
  );
}

function StringListField({ field, value = [], onChange, path, errors }) {
  return (
    <Field label={field.label} required={field.required} error={errors[path]}>
      <div className="space-y-2">
        {value.map((entry, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={entry}
              onChange={(event) =>
                onChange(value.map((item, i) => (i === index ? event.target.value : item)))
              }
              aria-label={`${field.label} ${index + 1}`}
              className={inputClass}
            />
            <Button
              variant="ghost"
              className="px-3"
              aria-label="Remove"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="ghost" className="text-xs" onClick={() => onChange([...value, ''])}>
          Add
        </Button>
      </div>
    </Field>
  );
}

function ListField({ field, value = [], onChange, path, errors }) {
  const [open, setOpen] = useState(() => new Set());

  // Reveal any row the server complained about, so the message is never
  // hidden inside a collapsed item.
  useEffect(() => {
    const failing = value
      .map((_, index) => index)
      .filter((index) => hasErrorUnder(errors, join(path, index)));

    if (failing.length === 0) return;
    setOpen((previous) => new Set([...previous, ...failing]));
  }, [errors, path, value]);

  const toggle = (index) =>
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;

    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const blank = () =>
    Object.fromEntries(
      field.itemFields.map((item) => [item.name, item.type === 'list' || item.type === 'stringList' ? [] : '']),
    );

  // A new row starts empty, which means it fails validation until it is filled
  // in — so open it immediately rather than leaving a collapsed "Item 11".
  const add = () => {
    onChange([...value, blank()]);
    setOpen((previous) => new Set([...previous, value.length]));
  };

  const requiredNames = field.itemFields.filter((item) => item.required).map((item) => item.label);

  return (
    <div className="border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-white/60 text-xs uppercase tracking-wider">
            {field.label}
            {field.required ? <span className="text-[#E89B3C] ml-1">*</span> : null}
          </p>
          {requiredNames.length > 0 ? (
            <p className="text-white/35 text-xs mt-1">
              Every item needs: {requiredNames.join(', ')}
            </p>
          ) : null}
        </div>
        <Button variant="ghost" className="text-xs px-4 py-1.5" onClick={add}>
          Add item
        </Button>
      </div>

      {errors[path] ? <p className="text-xs text-[#E89B3C] mb-3">{errors[path]}</p> : null}

      <div className="space-y-3">
        {value.map((entry, index) => {
          const itemPath = join(path, index);
          const failing = hasErrorUnder(errors, itemPath);

          return (
            <div
              key={index}
              className={`bg-white/5 border rounded-lg ${failing ? 'border-[#E89B3C]/50' : 'border-white/10'}`}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-2 text-left"
                >
                  {open.has(index) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {entry[field.itemFields[0]?.name] || entry.name || entry.title || `Item ${index + 1}`}
                  {failing ? <span className="text-[#E89B3C] text-xs">needs attention</span> : null}
                </button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" className="px-2 py-1" aria-label="Move up" onClick={() => move(index, -1)}>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" className="px-2 py-1" aria-label="Move down" onClick={() => move(index, 1)}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-2 py-1"
                    aria-label="Remove item"
                    onClick={() => onChange(value.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {open.has(index) ? (
                <div className="px-4 pb-4 space-y-4">
                  <SectionFields
                    fields={field.itemFields}
                    value={entry}
                    path={itemPath}
                    errors={errors}
                    onChange={(next) => onChange(value.map((item, i) => (i === index ? next : item)))}
                  />
                </div>
              ) : null}
            </div>
          );
        })}

        {value.length === 0 ? <p className="text-white/35 text-sm">Nothing here yet.</p> : null}
      </div>
    </div>
  );
}

export function SectionFields({ fields, value = {}, onChange, errors = {}, path = '' }) {
  const set = (name) => (next) => onChange({ ...value, [name]: next });

  return (
    <div className="space-y-5">
      {fields.map((field) => {
        const current = value[field.name];
        const fieldPath = join(path, field.name);
        const error = errors[fieldPath];
        const id = `cms-${fieldPath.replace(/\./g, '-')}`;

        switch (field.type) {
          case 'textarea':
            return (
              <Field key={field.name} label={field.label} htmlFor={id} required={field.required} error={error}>
                <textarea
                  id={id}
                  rows={4}
                  value={current ?? ''}
                  onChange={(event) => set(field.name)(event.target.value)}
                  className={inputClass}
                />
              </Field>
            );

          case 'number':
            return (
              <Field key={field.name} label={field.label} htmlFor={id} required={field.required} error={error}>
                <input
                  id={id}
                  type="number"
                  value={current ?? ''}
                  onChange={(event) => set(field.name)(Number(event.target.value))}
                  className={inputClass}
                />
              </Field>
            );

          case 'boolean':
            return (
              <label key={field.name} className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={Boolean(current)}
                  onChange={(event) => set(field.name)(event.target.checked)}
                />
                {field.label}
              </label>
            );

          case 'select':
            return (
              <Field key={field.name} label={field.label} htmlFor={id} required={field.required} error={error}>
                <select
                  id={id}
                  value={current ?? field.options[0]}
                  onChange={(event) => set(field.name)(event.target.value)}
                  className={inputClass}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option} className="bg-[#0F2418]">
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            );

          case 'image':
            return (
              <ImageField
                key={field.name}
                label={field.label}
                required={field.required}
                error={error}
                value={current}
                onChange={set(field.name)}
              />
            );

          case 'stringList':
            return (
              <StringListField
                key={field.name}
                field={field}
                value={current ?? []}
                path={fieldPath}
                errors={errors}
                onChange={set(field.name)}
              />
            );

          case 'list':
            return (
              <ListField
                key={field.name}
                field={field}
                value={current ?? []}
                path={fieldPath}
                errors={errors}
                onChange={set(field.name)}
              />
            );

          case 'group':
            return (
              <div key={field.name} className="border border-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-4">{field.label}</p>
                <SectionFields
                  fields={field.itemFields}
                  value={current ?? {}}
                  path={fieldPath}
                  errors={errors}
                  onChange={set(field.name)}
                />
              </div>
            );

          default:
            return (
              <Field key={field.name} label={field.label} htmlFor={id} required={field.required} error={error}>
                <input
                  id={id}
                  value={current ?? ''}
                  onChange={(event) => set(field.name)(event.target.value)}
                  className={inputClass}
                />
              </Field>
            );
        }
      })}
    </div>
  );
}
