import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Trash2, Upload } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

import { admin } from '../../../lib/api/index.js';
import { ErrorState, InlineLoader } from '../../components/Feedback.jsx';
import { Button, Field, Panel, StatusMessage, inputClass, labelClass } from '../../components/admin/ui.jsx';
import { useQuery } from '../../hooks/useQuery.js';

const EMPTY = {
  name: '',
  subtitle: '',
  description: '',
  sku: '',
  price: '',
  salePrice: '',
  categoryId: '',
  status: 'DRAFT',
  color: '',
  tag: '',
  featured: false,
  details: [],
  inventory: { quantity: 0, capacity: 0, lowStockThreshold: 3 },
};

/** Paise on the wire, rupees in the form. */
const toRupees = (paise) => (paise === null || paise === undefined ? '' : String(paise / 100));

export function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const fileInput = useRef(null);

  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const { data: categories } = useQuery((options) => admin.categories(options), [], { initialData: [] });

  const { data: product, loading, error, refetch } = useQuery(
    (options) => admin.product(id, options),
    [id],
    { enabled: !isNew },
  );

  useEffect(() => {
    if (!product) return;

    setForm({
      name: product.name,
      subtitle: product.subtitle ?? '',
      description: product.description,
      sku: product.sku,
      price: toRupees(product.price),
      salePrice: toRupees(product.salePrice),
      categoryId: product.categoryId,
      status: product.status,
      color: product.color ?? '',
      tag: product.tag ?? '',
      featured: product.featured,
      details: product.details,
      inventory: {
        quantity: product.inventory?.quantity ?? 0,
        capacity: product.inventory?.capacity ?? 0,
        lowStockThreshold: product.inventory?.lowStockThreshold ?? 3,
      },
    });
    setImages(product.images);
  }, [product]);

  // A new product needs a category picked before it can be saved.
  useEffect(() => {
    if (isNew && categories.length > 0 && !form.categoryId) {
      setForm((previous) => ({ ...previous, categoryId: categories[0].id }));
    }
  }, [isNew, categories, form.categoryId]);

  const update = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const updateInventory = (key) => (event) =>
    setForm((previous) => ({
      ...previous,
      inventory: { ...previous.inventory, [key]: Number(event.target.value) },
    }));

  const updateDetail = (index, key) => (event) =>
    setForm((previous) => ({
      ...previous,
      details: previous.details.map((row, i) => (i === index ? { ...row, [key]: event.target.value } : row)),
    }));

  const payload = () => ({
    name: form.name,
    subtitle: form.subtitle || undefined,
    description: form.description,
    sku: form.sku,
    price: form.price,
    salePrice: form.salePrice === '' ? null : form.salePrice,
    categoryId: form.categoryId,
    status: form.status,
    color: form.color || undefined,
    tag: form.tag || undefined,
    featured: form.featured,
    details: form.details.filter((row) => row.name.trim() && row.value.trim()),
    inventory: form.inventory,
  });

  const save = async (event) => {
    event.preventDefault();
    setStatus({ state: 'saving', message: '' });
    setFieldErrors({});

    try {
      if (isNew) {
        const created = await admin.createProduct(payload());
        navigate(`/admin/products/${created.id}`, { replace: true });
        setStatus({ state: 'done', message: 'Product created.' });
      } else {
        await admin.updateProduct(id, payload());
        setStatus({ state: 'done', message: 'Saved.' });
        refetch();
      }
    } catch (saveError) {
      setFieldErrors(saveError.fieldErrors ?? {});
      setStatus({ state: 'error', message: saveError.message });
    }
  };

  const uploadImages = async (event) => {
    const files = [...event.target.files];
    if (files.length === 0) return;

    setStatus({ state: 'saving', message: 'Uploading…' });

    try {
      const uploaded = [];
      for (const file of files) {
        // Uploads go one at a time so a rejected file names itself clearly.
        uploaded.push(await admin.uploadMedia(file, 'products'));
      }

      const updated = await admin.addProductImages(
        id,
        uploaded.map((asset) => ({ url: asset.url, storagePath: asset.path })),
      );
      setImages(updated.images);
      setStatus({ state: 'done', message: 'Images added.' });
    } catch (uploadError) {
      setStatus({ state: 'error', message: uploadError.message });
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const removeImage = async (imageId) => {
    try {
      const updated = await admin.removeProductImage(id, imageId);
      setImages(updated.images);
    } catch (removeError) {
      setStatus({ state: 'error', message: removeError.message });
    }
  };

  const destroy = async () => {
    if (!window.confirm('Delete this product permanently? Past orders keep their record.')) return;

    try {
      await admin.deleteProduct(id);
      navigate('/admin/products', { replace: true });
    } catch (deleteError) {
      setStatus({ state: 'error', message: deleteError.message });
    }
  };

  if (!isNew && loading) return <InlineLoader />;
  if (!isNew && error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <form onSubmit={save} className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin/products" className="inline-flex items-center gap-2 text-white/50 text-sm hover:text-white transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> All products
          </Link>
          <h1 className="font-serif text-3xl">{isNew ? 'New product' : form.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          {!isNew ? (
            <Button variant="danger" onClick={destroy}>
              Delete
            </Button>
          ) : null}
          <Button type="submit" variant="accent" disabled={status.state === 'saving'}>
            {status.state === 'saving' ? 'Saving…' : 'Save product'}
          </Button>
        </div>
      </header>

      <StatusMessage status={status} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Panel title="Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Name" htmlFor="name" error={fieldErrors.name}>
                <input id="name" required value={form.name} onChange={update('name')} className={inputClass} />
              </Field>
              <Field label="Subtitle" htmlFor="subtitle" hint="Shown under the name on cards.">
                <input id="subtitle" value={form.subtitle} onChange={update('subtitle')} className={inputClass} />
              </Field>
              <Field label="SKU" htmlFor="sku" error={fieldErrors.sku}>
                <input id="sku" required value={form.sku} onChange={update('sku')} className={inputClass} />
              </Field>
              <Field label="Category" htmlFor="categoryId">
                <select id="categoryId" required value={form.categoryId} onChange={update('categoryId')} className={inputClass}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-[#0F2418]">
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Colour" htmlFor="color" hint="Used by the shop's colour filter.">
                <input id="color" value={form.color} onChange={update('color')} className={inputClass} />
              </Field>
              <Field label="Badge" htmlFor="tag" hint="e.g. BESTSELLER, NEW, LIMITED.">
                <input id="tag" value={form.tag} onChange={update('tag')} className={inputClass} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description" htmlFor="description" error={fieldErrors.description}>
                  <textarea
                    id="description"
                    required
                    rows={5}
                    value={form.description}
                    onChange={update('description')}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </Panel>

          <Panel
            title="Specifications"
            description="The fabric and craft rows shown on the product page."
            actions={
              <Button
                variant="ghost"
                onClick={() =>
                  setForm((previous) => ({ ...previous, details: [...previous.details, { name: '', value: '' }] }))
                }
              >
                Add row
              </Button>
            }
          >
            {form.details.length === 0 ? (
              <p className="text-white/40 text-sm">No specification rows yet.</p>
            ) : (
              <div className="space-y-3">
                {form.details.map((row, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      value={row.name}
                      onChange={updateDetail(index, 'name')}
                      placeholder="Label"
                      aria-label={`Specification ${index + 1} label`}
                      className={`${inputClass} max-w-[200px]`}
                    />
                    <input
                      value={row.value}
                      onChange={updateDetail(index, 'value')}
                      placeholder="Value"
                      aria-label={`Specification ${index + 1} value`}
                      className={inputClass}
                    />
                    <Button
                      variant="ghost"
                      className="px-3"
                      aria-label="Remove row"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          details: previous.details.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Images"
            description={isNew ? 'Save the product first, then add images.' : 'The first image is the one used on cards.'}
            actions={
              !isNew ? (
                <>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    onChange={uploadImages}
                    className="hidden"
                    id="product-images"
                  />
                  <Button variant="ghost" onClick={() => fileInput.current?.click()}>
                    <span className="inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Upload
                    </span>
                  </Button>
                </>
              ) : null
            }
          >
            {images.length === 0 ? (
              <p className="text-white/40 text-sm">No images yet.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img src={image.url} alt={image.altText} className="w-full aspect-[3/4] object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      aria-label="Remove image"
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Pricing">
            <div className="space-y-5">
              <Field label="Price (₹)" htmlFor="price" error={fieldErrors.price}>
                <input id="price" required type="number" min="0" step="0.01" value={form.price} onChange={update('price')} className={inputClass} />
              </Field>
              <Field label="Sale price (₹)" htmlFor="salePrice" hint="Leave empty for no sale." error={fieldErrors.salePrice}>
                <input id="salePrice" type="number" min="0" step="0.01" value={form.salePrice} onChange={update('salePrice')} className={inputClass} />
              </Field>
            </div>
          </Panel>

          <Panel title="Inventory">
            <div className="space-y-5">
              <Field label="Available quantity" htmlFor="quantity">
                <input id="quantity" type="number" min="0" value={form.inventory.quantity} onChange={updateInventory('quantity')} className={inputClass} />
              </Field>
              <Field
                label="Batch size"
                htmlFor="capacity"
                hint="Drives the 'AVAILABLE: n%' indicator. Set 0 to hide it."
              >
                <input id="capacity" type="number" min="0" value={form.inventory.capacity} onChange={updateInventory('capacity')} className={inputClass} />
              </Field>
              <Field label="Low stock warning at" htmlFor="lowStockThreshold">
                <input id="lowStockThreshold" type="number" min="0" value={form.inventory.lowStockThreshold} onChange={updateInventory('lowStockThreshold')} className={inputClass} />
              </Field>
              {product?.inventory?.reserved ? (
                <p className="text-white/40 text-xs">
                  {product.inventory.reserved} reserved by checkouts in progress.
                </p>
              ) : null}
            </div>
          </Panel>

          <Panel title="Visibility">
            <div className="space-y-5">
              <Field label="Status" htmlFor="status" hint="Only active products appear in the shop.">
                <select id="status" value={form.status} onChange={update('status')} className={inputClass}>
                  <option value="DRAFT" className="bg-[#0F2418]">Draft</option>
                  <option value="ACTIVE" className="bg-[#0F2418]">Active</option>
                  <option value="ARCHIVED" className="bg-[#0F2418]">Archived</option>
                </select>
              </Field>
              <label className={`${labelClass} flex items-center gap-2 normal-case tracking-normal text-sm text-white/70`}>
                <input type="checkbox" checked={form.featured} onChange={update('featured')} />
                Show in the homepage featured collection
              </label>
            </div>
          </Panel>
        </div>
      </div>
    </form>
  );
}
