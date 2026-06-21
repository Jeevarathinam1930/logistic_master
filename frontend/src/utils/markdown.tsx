import React from 'react';

/* ─── Line types ─────────────────────────────────────────── */
type LineType =
  | 'h2' | 'h3' | 'li' | 'ol-li' | 'p' | 'hr'
  | 'empty' | 'risk-badge' | 'table-header' | 'table-sep' | 'table-row'
  | 'tag-badge';

interface ParsedLine {
  type: LineType;
  text: string;
  number?: number;
  riskLevel?: string;
  cells?: string[];
  tag?: string;
}

/* ─── Inline formatting ────────────────────────────────── */
const INLINE_RE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/;

function renderInline(text: string): React.ReactNode[] {
  if (!text) return [];
  const parts = text.split(INLINE_RE);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    if (p.startsWith('**') && p.endsWith('**')) {
      out.push(React.createElement('strong', { key: i }, p.slice(2, -2)));
    } else if (p.startsWith('*') && p.endsWith('*') && !p.startsWith('**')) {
      out.push(React.createElement('em', { key: i }, p.slice(1, -1)));
    } else if (p.startsWith('`') && p.endsWith('`')) {
      out.push(
        React.createElement(
          'code',
          {
            key: i,
            style: {
              background: '#F3F4F6',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: '#DC2626',
            },
          },
          p.slice(1, -1)
        )
      );
    } else {
      // Check for inline tags like [LOGISTICS_RELEVANT] or [FOUNDER_ERROR]
      const tagParts = p.split(/(\[[A-Z_]+\])/g);
      for (let j = 0; j < tagParts.length; j++) {
        const tp = tagParts[j];
        if (!tp) continue;
        const tagMatch = tp.match(/^\[([A-Z_]+)\]$/);
        if (tagMatch) {
          out.push(
            React.createElement(
              'span',
              {
                key: `${i}-${j}`,
                style: {
                  display: 'inline-block',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 500,
                  background: '#EFF6FF',
                  color: '#2563EB',
                  margin: '0 2px',
                },
              },
              tagMatch[1]
            )
          );
        } else {
          out.push(tp);
        }
      }
    }
  }
  return out;
}

/* ─── Risk / Tag colors ─────────────────────────────────── */
const RISK_COLORS: Record<string, { bg: string; text: string }> = {
  'HIGH RISK': { bg: '#FEF2F2', text: '#DC2626' },
  'MEDIUM RISK': { bg: '#FFFBEB', text: '#D97706' },
  'LOW RISK': { bg: '#ECFDF5', text: '#059669' },
};

/* ─── Line parser ──────────────────────────────────────── */
function parseLine(raw: string): ParsedLine {
  const t = raw.trim();
  if (!t) return { type: 'empty', text: '' };

  // Risk badge: [HIGH RISK] / [MEDIUM RISK] / [LOW RISK] at start
  const riskMatch = t.match(/^\[(HIGH RISK|MEDIUM RISK|LOW RISK)\]/);
  if (riskMatch) {
    return {
      type: 'risk-badge',
      text: t.slice(riskMatch[0].length).trim(),
      riskLevel: riskMatch[1],
    };
  }

  // Tag badge on its own line: [LOGISTICS_RELEVANT] or [FOUNDER_ERROR]
  const tagMatch = t.match(/^\[([A-Z_]+)\]$/);
  if (tagMatch) {
    return { type: 'tag-badge', text: '', tag: tagMatch[1] };
  }

  // Headers — handle with or without trailing space
  const h3Match = t.match(/^###\s*(.*)/);
  if (h3Match) return { type: 'h3', text: h3Match[1] };
  const h2Match = t.match(/^##\s*(.*)/);
  if (h2Match) return { type: 'h2', text: h2Match[1] };

  // Horizontal rule
  if (t === '---') return { type: 'hr', text: '' };

  // Table row
  if (t.startsWith('|') && t.endsWith('|')) {
    const cells = t
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    const sep = cells.every((c) => /^[-:]+$/.test(c));
    if (sep) return { type: 'table-sep', text: '', cells };
    // Check if previous line was a table header
    return { type: 'table-row', text: '', cells };
  }

  // Unordered list
  if (t.startsWith('- ') || t.startsWith('* '))
    return { type: 'li', text: t.slice(2) };

  // Ordered list
  const numMatch = t.match(/^(\d+)\.\s+(.+)/);
  if (numMatch) {
    return {
      type: 'ol-li',
      text: numMatch[2],
      number: parseInt(numMatch[1]),
    };
  }

  return { type: 'p', text: t };
}

/* ─── Markdown block → component ───────────────────────── */
interface Group {
  kind: 'ul' | 'ol' | 'table' | 'block';
  items: ParsedLine[];
}

function renderTable(group: Group) {
  const rows = group.items;
  const headerIdx = rows.findIndex((r) => r.type === 'table-sep');
  if (headerIdx < 1) return null; // no header row found
  const header = rows[headerIdx - 1];
  const body = rows.slice(headerIdx + 1);
  return React.createElement(
    'div',
    {
      style: {
        overflowX: 'auto',
        margin: '12px 0',
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
      },
    },
    React.createElement(
      'table',
      { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
      // Header
      React.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          { style: { background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' } },
          ...(header.cells || []).map((cell, ci) =>
            React.createElement(
              'th',
              {
                key: ci,
                style: {
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#111827',
                  borderRight: ci < (header.cells?.length ?? 0) - 1 ? '1px solid #E5E7EB' : 'none',
                },
              },
              ...renderInline(cell)
            )
          )
        )
      ),
      // Body
      React.createElement(
        'tbody',
        null,
        ...body.map((row, ri) =>
          React.createElement(
            'tr',
            {
              key: ri,
              style: {
                borderBottom: ri < body.length - 1 ? '1px solid #F3F4F6' : 'none',
              },
            },
            ...(row.cells || []).map((cell, ci) =>
              React.createElement(
                'td',
                {
                  key: ci,
                  style: {
                    padding: '10px 14px',
                    color: '#4B5563',
                    lineHeight: 1.5,
                    borderRight: ci < (row.cells?.length ?? 0) - 1 ? '1px solid #F3F4F6' : 'none',
                  },
                },
                ...renderInline(cell)
              )
            )
          )
        )
      )
    )
  );
}

/* ─── Exported Markdown component ──────────────────────── */
export function Markdown({ text }: { text: string }) {
  if (!text) return null;

  const rawLines = text.split('\n').map(parseLine);

  // Group consecutive list items and table rows
  const groups: Group[] = [];
  let currentList: ParsedLine[] | null = null;
  let listKind: 'ul' | 'ol' | null = null;
  let currentTable: ParsedLine[] | null = null;

  for (const line of rawLines) {
    // Table handling
    if (line.type === 'table-row' || line.type === 'table-sep' || line.type === 'table-header') {
      if (!currentTable) {
        currentTable = [];
        groups.push({ kind: 'table', items: currentTable });
      }
      currentTable.push(line);
      currentList = null;
      listKind = null;
      continue;
    }

    // Close table if open
    if (currentTable) {
      currentTable = null;
    }

    // List handling
    if (line.type === 'li' || line.type === 'ol-li') {
      const kind = line.type === 'ol-li' ? 'ol' : 'ul';
      if (!currentList || listKind !== kind) {
        currentList = [];
        listKind = kind;
        groups.push({ kind, items: currentList });
      }
      currentList.push(line);
      continue;
    }

    // Close list if open
    currentList = null;
    listKind = null;

    groups.push({ kind: 'block', items: [line] });
  }

  return React.createElement(
    'div',
    { style: { maxWidth: '100%', lineHeight: 1.7 } },
    ...groups.map((group, gi) => {
      // ── Unordered list ──
      if (group.kind === 'ul') {
        return React.createElement(
          'ul',
          {
            key: gi,
            style: {
              padding: '0 0 0 20px',
              margin: '8px 0',
              listStyle: 'disc',
            },
          },
          ...group.items.map((item, ii) =>
            React.createElement(
              'li',
              {
                key: ii,
                style: {
                  fontSize: '14px',
                  color: '#4B5563',
                  lineHeight: 1.7,
                  marginBottom: '4px',
                  paddingLeft: '4px',
                },
              },
              ...renderInline(item.text)
            )
          )
        );
      }

      // ── Ordered list ──
      if (group.kind === 'ol') {
        return React.createElement(
          'ol',
          {
            key: gi,
            style: {
              padding: '0 0 0 24px',
              margin: '8px 0',
            },
          },
          ...group.items.map((item, ii) =>
            React.createElement(
              'li',
              {
                key: ii,
                style: {
                  fontSize: '14px',
                  color: '#4B5563',
                  lineHeight: 1.7,
                  marginBottom: '4px',
                },
              },
              ...renderInline(item.text)
            )
          )
        );
      }

      // ── Table ──
      if (group.kind === 'table') {
        return React.createElement(React.Fragment, { key: gi }, renderTable(group));
      }

      // ── Block items ──
      return React.createElement(
        React.Fragment,
        { key: gi },
        ...group.items.map((item, ii) => {
          if (item.type === 'empty') return React.createElement('br', { key: ii });

          if (item.type === 'hr')
            return React.createElement('hr', {
              key: ii,
              style: { margin: '16px 0', border: 'none', borderTop: '1px solid #E5E7EB' },
            });

          if (item.type === 'h2')
            return React.createElement(
              'h2',
              {
                key: ii,
                style: {
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#111827',
                  margin: '20px 0 8px',
                  letterSpacing: '-0.01em',
                },
              },
              ...renderInline(item.text)
            );

          if (item.type === 'h3')
            return React.createElement(
              'h3',
              {
                key: ii,
                style: {
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#111827',
                  margin: '16px 0 6px',
                },
              },
              ...renderInline(item.text)
            );

          if (item.type === 'tag-badge' && item.tag) {
            return React.createElement(
              'span',
              {
                key: ii,
                style: {
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 500,
                  background: '#EFF6FF',
                  color: '#2563EB',
                  margin: '2px 4px 2px 0',
                },
              },
              item.tag
            );
          }

          if (item.type === 'risk-badge') {
            const colors = RISK_COLORS[item.riskLevel!] || RISK_COLORS['MEDIUM RISK'];
            return React.createElement(
              'div',
              {
                key: ii,
                style: {
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 0',
                },
              },
              React.createElement(
                'span',
                {
                  style: {
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: colors.bg,
                    color: colors.text,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    marginTop: '2px',
                  },
                },
                item.riskLevel
              ),
              React.createElement(
                'span',
                { style: { fontSize: '14px', color: '#4B5563', lineHeight: 1.7 } },
                ...renderInline(item.text)
              )
            );
          }

          // Default: paragraph
          return React.createElement(
            'p',
            {
              key: ii,
              style: {
                fontSize: '14px',
                color: '#4B5563',
                lineHeight: 1.7,
                marginBottom: '8px',
              },
            },
            ...renderInline(item.text)
          );
        })
      );
    })
  );
}

/* ─── Summary helper ───────────────────────────────────── */
export function Summary({
  text,
  maxLines = 2,
}: {
  text: string;
  maxLines?: number;
}) {
  const lines = text.split('\n').filter((l) => l.trim());
  const summary = lines
    .slice(0, maxLines)
    .join(' ')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .slice(0, 200);
  return React.createElement(
    'p',
    {
      style: {
        fontSize: '14px',
        color: '#6B7280',
        lineHeight: 1.6,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
      },
    },
    summary
  );
}

export function cleanMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
}
