import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { NavLink, useParams } from 'react-router';

import { admin } from '../../../lib/api/index.js';
import { ErrorState, InlineLoader } from '../../components/Feedback.jsx';
import { SectionFields } from '../../components/admin/SectionFields.jsx';
import { Button, Panel, Pill, StatusMessage } from '../../components/admin/ui.jsx';
import { useQuery } from '../../hooks/useQuery.js';

/**
 * "items.10.name" is precise but unreadable. Walk the field registry along the
 * path to produce something the owner can act on: "Collections -> item 11 -> Name".
 */
function humanisePath(fields, path) {
  const labels = [];
  let current = fields;

  for (const part of path.split('.')) {
    if (/^\d+$/.test(part)) {
      labels.push(`item ${Number(part) + 1}`);
      continue;
    }

    const field = current?.find((candidate) => candidate.name === part);
    labels.push(field?.label ?? part);
    current = field?.itemFields;
  }

  return labels.join(' → ');
}

function SectionEditor({ pageSlug, section, definition, onSaved }) {
  const [draft, setDraft] = useState(section.data);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [errors, setErrors] = useState({});

  // Re-sync when the page reloads after a save elsewhere.
  useEffect(() => setDraft(section.data), [section.data]);

  const save = async () => {
    setStatus({ state: 'saving', message: '' });
    setErrors({});

    try {
      await admin.updateSection(pageSlug, section.key, { data: draft });
      setStatus({ state: 'done', message: 'Section saved.' });
      onSaved();
    } catch (saveError) {
      const issues = saveError.details?.issues;

      if (!issues) {
        setStatus({ state: 'error', message: saveError.message });
        return;
      }

      // Each message lands on its own input; the summary just says where to look.
      setErrors(Object.fromEntries(issues.map((issue) => [issue.field, issue.message])));
      setOpen(true);
      setStatus({
        state: 'error',
        message:
          issues.length === 1
            ? `Check ${humanisePath(definition?.fields ?? [], issues[0].field)}.`
            : `Check ${issues.length} highlighted fields.`,
      });
    }
  };

  const toggleVisible = async () => {
    try {
      await admin.updateSection(pageSlug, section.key, { visible: !section.visible });
      onSaved();
    } catch (toggleError) {
      setStatus({ state: 'error', message: toggleError.message });
    }
  };

  return (
    <Panel
      title={definition?.label ?? section.type}
      description={section.key}
      actions={
        <>
          <Pill tone={section.visible ? 'success' : 'neutral'}>{section.visible ? 'Visible' : 'Hidden'}</Pill>
          <Button
            variant="ghost"
            className="px-3 py-2"
            aria-label={section.visible ? 'Hide section' : 'Show section'}
            onClick={toggleVisible}
          >
            {section.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" className="px-3 py-2" aria-label="Toggle editor" onClick={() => setOpen(!open)}>
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </>
      }
    >
      {open ? (
        <div className="space-y-6">
          {definition ? (
            <SectionFields
              fields={definition.fields}
              value={draft}
              errors={errors}
              onChange={(next) => {
                setDraft(next);
                if (status.state === 'error') setStatus({ state: 'idle', message: '' });
              }}
            />
          ) : (
            <p className="text-white/40 text-sm">
              This section type is no longer registered, so it cannot be edited here.
            </p>
          )}

          <StatusMessage status={status} />

          {definition ? (
            <Button variant="accent" onClick={save} disabled={status.state === 'saving'}>
              {status.state === 'saving' ? 'Saving…' : 'Save section'}
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="text-white/40 text-sm">Open to edit this section&apos;s content.</p>
      )}
    </Panel>
  );
}

export function Content() {
  const { slug } = useParams();

  const { data: pages, loading: pagesLoading, error: pagesError, refetch: refetchPages } = useQuery(
    (options) => admin.pages(options),
    [],
  );

  const { data: sectionTypes } = useQuery((options) => admin.sectionTypes(options), [], {
    initialData: [],
  });

  const activeSlug = slug ?? pages?.[0]?.slug;

  const { data: page, loading, error, refetch } = useQuery(
    (options) => admin.page(activeSlug, options),
    [activeSlug],
    { enabled: Boolean(activeSlug) },
  );

  const definitions = useMemo(
    () => Object.fromEntries((sectionTypes ?? []).map((type) => [type.type, type])),
    [sectionTypes],
  );

  const reload = () => {
    refetch();
    refetchPages();
  };

  if (pagesLoading) return <InlineLoader />;
  if (pagesError) return <ErrorState message={pagesError.message} onRetry={refetchPages} />;

  if (pages.length === 0) {
    return (
      <p className="text-white/50 text-sm">
        No editable pages exist yet. Run the database seed to create them.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Page content</h1>
        <p className="text-white/50 text-sm mt-1">
          Words and images for the storefront. Each page keeps its own layout — only the content changes here.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {pages.map((entry) => (
          <NavLink
            key={entry.slug}
            to={`/admin/content/${entry.slug}`}
            className={({ isActive }) =>
              `px-5 py-2.5 rounded-full text-sm transition-all ${
                isActive || entry.slug === activeSlug
                  ? 'bg-[#E89B3C] text-[#1a1207]'
                  : 'bg-white/5 border border-white/15 text-white/70 hover:text-white'
              }`
            }
          >
            {entry.title}
          </NavLink>
        ))}
      </nav>

      {loading || !page ? (
        <InlineLoader />
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : (
        <div className="space-y-5">
          {page.sections.map((section) => (
            <SectionEditor
              key={section.key}
              pageSlug={page.slug}
              section={section}
              definition={definitions[section.type]}
              onSaved={reload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
