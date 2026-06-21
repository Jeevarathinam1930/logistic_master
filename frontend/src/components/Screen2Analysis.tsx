import { useMemo } from 'react';
import type { AnalysisResult } from '../types';
import { Markdown } from '../utils/markdown';

interface Props {
  result: AnalysisResult;
  onContinue: () => void;
  onBackToStart: () => void;
}

/* ─── First 48-Hour Action renderer ───────────────────────── */
function FirstStepRenderer({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks: {
    type: 'step-header' | 'body' | 'quote' | 'success';
    stepNum?: number;
    stepTitle?: string;
    content: string;
  }[] = [];

  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;

    // Step header: **Step N: Title** or **Month N: Title** or **N Days: Title**
    const stepMatch = t.match(/^\*\*Step\s*(\d+)\s*[:\-–]\s*([^*]+)\*\*/i);
    if (stepMatch) {
      blocks.push({
        type: 'step-header',
        stepNum: parseInt(stepMatch[1]),
        stepTitle: stepMatch[2].trim(),
        content: '',
      });
      continue;
    }

    // Generic bold header (for timeline milestones)
    const boldMatch = t.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      blocks.push({
        type: 'step-header',
        stepNum: blocks.filter((b) => b.type === 'step-header').length + 1,
        stepTitle: boldMatch[1].trim(),
        content: '',
      });
      continue;
    }

    // Success criteria line
    if (
      /success\s*(criteria|metric|threshold|signal|indicator)/i.test(t) ||
      t.startsWith('✅') ||
      t.startsWith('✓')
    ) {
      blocks.push({ type: 'success', content: t.replace(/^✅\s*/, '') });
      continue;
    }

    // Quote (wrapped in quotes)
    if (/^[""'']/.test(t) || /[""'']$/.test(t)) {
      const cleaned = t.replace(/^["""''']|["""''']$/g, '').trim();
      if (cleaned) {
        blocks.push({ type: 'quote', content: cleaned });
        continue;
      }
    }

    // Default: body text
    blocks.push({ type: 'body', content: t });
  }

  if (blocks.length === 0) return <Markdown text={text} />;

  return (
    <div>
      {blocks.map((block, i) => {
        if (block.type === 'step-header') {
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: i > 0 ? '20px' : '4px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#2563EB',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {block.stepNum}
              </div>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#111827',
                  letterSpacing: '-0.01em',
                }}
              >
                {block.stepTitle}
              </span>
            </div>
          );
        }

        if (block.type === 'quote') {
          return (
            <div
              key={i}
              style={{
                margin: '10px 0 10px 44px',
                padding: '12px 16px',
                background: '#F9FAFB',
                borderLeft: '3px solid #2563EB',
                borderRadius: '0 8px 8px 0',
                fontStyle: 'italic',
                fontSize: '14px',
                color: '#4B5563',
                lineHeight: 1.7,
              }}
            >
              "{block.content}"
            </div>
          );
        }

        if (block.type === 'success') {
          return (
            <div
              key={i}
              style={{
                marginTop: '16px',
                padding: '14px 18px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#065F46',
                  lineHeight: 1.6,
                }}
              >
                {block.content}
              </span>
            </div>
          );
        }

        // Body — render inline through Markdown for bold/lists within body text
        return (
          <div key={i} style={{ margin: '6px 0 6px 44px' }}>
            <Markdown text={block.content} />
          </div>
        );
      })}
    </div>
  );
}

/* ─── Action Plan timeline renderer ────────────────────────── */
function ActionPlanRenderer({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks: {
    type: 'milestone' | 'item';
    label?: string;
    content: string;
    index?: number;
  }[] = [];

  let milestoneIdx = 0;

  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;

    // Phase header: **30 Days:** or **Month 1:** or plain "30 days (Month 1): Cost: $0"
    const boldMatch = t.match(/^\*\*([^*]+)\*\*:?\s*/);
    if (boldMatch) {
      milestoneIdx++;
      const rest = t.slice(boldMatch[0].length).trim();
      blocks.push({
        type: 'milestone',
        label: boldMatch[1].trim().replace(/:+$/, ''),
        content: rest,
        index: milestoneIdx,
      });
      continue;
    }

    // Plain text phase header: "30 days", "60 days", "Month 1", "Days 1–30", etc.
    // Matches: "<number> <time unit>" or "Month <number>" or "Days <range>" at line start
    const phaseMatch = t.match(
      /^(?:\d+\s*(?:day|days|week|weeks|month|months)(?:\s*\([^)]*\))?\s*:|Days?\s+\d+\s*[–-]\s*\d+\s*:|Month\s+\d+\s*:|Phase\s+\d+\s*:?)/i
    );
    if (phaseMatch) {
      milestoneIdx++;
      const rest = t.slice(phaseMatch[0].length).trim();
      const labelRaw = phaseMatch[0].replace(/:$/, '').trim();
      blocks.push({
        type: 'milestone',
        label: labelRaw,
        content: rest,
        index: milestoneIdx,
      });
      continue;
    }

    // List item
    if (t.startsWith('- ') || t.startsWith('* ')) {
      blocks.push({ type: 'item', content: t.slice(2) });
      continue;
    }

    // Numbered item
    const numMatch = t.match(/^\d+\.\s+(.+)/);
    if (numMatch) {
      blocks.push({ type: 'item', content: numMatch[1] });
      continue;
    }

    // Plain text after a milestone
    blocks.push({ type: 'item', content: t });
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '36px' }}>
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          left: '15px',
          top: '6px',
          bottom: '6px',
          width: '2px',
          background: '#E5E7EB',
          borderRadius: '1px',
        }}
      />

      {blocks.map((block, i) => {
        if (block.type === 'milestone') {
          return (
            <div key={i} style={{ position: 'relative', marginBottom: '12px' }}>
              {/* Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '-28px',
                  top: '6px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#2563EB',
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 2px #2563EB',
                }}
              />
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '4px',
                }}
              >
                {block.label}
              </div>
              {block.content && (
                <div
                  style={{
                    fontSize: '14px',
                    color: '#4B5563',
                    lineHeight: 1.6,
                    marginBottom: '4px',
                  }}
                >
                  <Markdown text={block.content} />
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            key={i}
            style={{
              marginBottom: '6px',
              paddingLeft: '8px',
              fontSize: '14px',
              color: '#4B5563',
              lineHeight: 1.7,
              display: 'flex',
              gap: '8px',
            }}
          >
            <span style={{ color: '#2563EB', flexShrink: 0, marginTop: '2px' }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span
              style={{
                color: block.content.startsWith('**') ? '#111827' : '#4B5563',
              }}
            >
              <Markdown text={block.content} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Gauge ───────────────────────────────────────────────── */
function Gauge({ value }: { value: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 20) * circ;
  const color = value >= 15 ? '#10B981' : value >= 10 ? '#F59E0B' : '#EF4444';

  return (
    <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
      <circle
        cx="36" cy="36"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
}

const DOT_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];

function cleanSource(source: string): string {
  if (!source) return 'Unknown';
  const parts = source.split('+').map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) return 'Multiple Industry Sources';
  const cleaned = parts[0]
    .replace(/\.(md|txt)$/i, '')
    .replace(/_+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return cleaned || 'Unknown';
}

/* ─── Main component ─────────────────────────────────────── */
export default function Screen2Analysis({ result, onContinue, onBackToStart }: Props) {
  const risk = useMemo(() => {
    if (!result.patterns.length) return { label: 'Unknown', color: '#6B7280', bg: '#F3F4F6' };
    const avg = result.patterns.reduce((s, p) => s + p.score, 0) / result.patterns.length;
    if (avg >= 15) return { label: 'Low Risk', color: '#059669', bg: '#ECFDF5' };
    if (avg >= 10) return { label: 'Medium Risk', color: '#D97706', bg: '#FFFBEB' };
    return { label: 'High Risk', color: '#DC2626', bg: '#FEF2F2' };
  }, [result.patterns]);

  return (
    <div
      className="animate-fadeIn"
      style={{ maxWidth: '720px', margin: '0 auto' }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '36px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '6px',
            }}
          >
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#111827',
                letterSpacing: '-0.03em',
                margin: 0,
              }}
            >
              Analysis Report
            </h1>
            <span className="badge badge-blue" style={{ fontSize: '12px' }}>
              {result.confidence_score}/20
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            {result.patterns.length} patterns matched ·{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={onBackToStart}
          style={{ fontSize: '13px', height: '38px', flexShrink: 0 }}
        >
          New Analysis
        </button>
      </div>

      {/* ── 1. Executive Summary ──────────────────────── */}
      <div
        className="card-static animate-slideUp"
        style={{
          marginBottom: '28px',
          borderLeft: '4px solid #2563EB',
          padding: '28px 28px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
            Executive Summary
          </span>
        </div>
        <Markdown text={result.clarified_idea} />
      </div>

      {/* ── Metrics row ───────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div
          className="card-static"
          style={{ flex: '1 1 140px', minWidth: '120px', padding: '20px', textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <Gauge value={result.confidence_score} />
          </div>
          <p
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#2563EB',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {result.confidence_score}
            <span style={{ fontSize: '13px', fontWeight: 400, color: '#9CA3AF' }}>/20</span>
          </p>
          <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, margin: '4px 0 0' }}>
            Pattern Confidence
          </p>
        </div>

        <div
          className="card-static"
          style={{ flex: '1 1 140px', minWidth: '120px', padding: '20px' }}
        >
          <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, marginBottom: '8px' }}>
            Risk Level
          </p>
          <span
            className="badge"
            style={{
              background: risk.bg,
              color: risk.color,
              fontSize: '14px',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: '8px',
              marginBottom: '8px',
            }}
          >
            {risk.label}
          </span>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '8px 0 0' }}>
            Based on {result.patterns.length} matched patterns
          </p>
        </div>

        <div
          className="card-static"
          style={{ flex: '1 1 140px', minWidth: '120px', padding: '20px' }}
        >
          <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, marginBottom: '8px' }}>
            Patterns Used
          </p>
          <p
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#10B981',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {result.patterns.length}
          </p>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0' }}>
            of 280 in knowledge base
          </p>
        </div>

        <div
          className="card-static"
          style={{ flex: '1 1 140px', minWidth: '120px', padding: '20px' }}
        >
          <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, marginBottom: '8px' }}>
            48-Hour Action
          </p>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#111827',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {(() => {
              const text = result.first_step;
              if (!text) return 'Define your first action';
              const clean = text.replace(/\*\*/g, '').trim();
              const firstSentence = clean.split(/[.!?\n]/).filter(Boolean)[0] || clean;
              return firstSentence.length > 60 ? firstSentence.slice(0, 60) + '...' : firstSentence;
            })()}
          </p>
        </div>
      </div>

      {/* ── 2. Hidden Assumptions ──────────────────────── */}
      {result.assumptions && (
        <div
          className="card-static animate-slideUp"
          style={{ marginBottom: '24px', border: '1px solid #FDE68A', padding: '28px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Hidden Assumptions
            </span>
            <span className="badge badge-orange" style={{ marginLeft: 'auto' }}>
              What hasn't been questioned
            </span>
          </div>
          <Markdown text={result.assumptions} />
        </div>
      )}

      {/* ── 3. Failure Risk ─────────────────────────────── */}
      {result.failure_risk && (
        <div
          className="card-static animate-slideUp"
          style={{ marginBottom: '24px', border: '1px solid #FECACA', padding: '28px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Failure Risk Analysis
            </span>
            <span className="badge badge-red" style={{ marginLeft: 'auto' }}>
              Critical
            </span>
          </div>
          <Markdown text={result.failure_risk} />
        </div>
      )}

      {/* ── 4. Milestone Plan ──────────────────────────── */}
      {result.milestone_plan && (
        <div
          className="card-static animate-slideUp"
          style={{ marginBottom: '24px', padding: '28px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Milestone Timeline
            </span>
            <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>
              30 · 60 · 90 days
            </span>
          </div>
          <ActionPlanRenderer text={result.milestone_plan} />
        </div>
      )}

      {/* ── 5. First 48-Hour Action ─────────────────────── */}
      {result.first_step && (
        <div
          className="card-static animate-slideUp"
          style={{
            marginBottom: '28px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#1E40AF' }}>
              First 48-Hour Action
            </span>
          </div>
          <FirstStepRenderer text={result.first_step} />
        </div>
      )}

      {/* ── Patterns Used ───────────────────────────────── */}
      <div
        className="card-static animate-slideUp"
        style={{ marginBottom: '28px', padding: '28px' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Patterns Referenced
            </span>
          </div>
          <span className="badge badge-gray">{result.patterns.length} matched</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {result.patterns.map((p, i) => (
            <div
              key={i}
              style={{
                padding: '16px',
                background: '#F9FAFB',
                borderRadius: '12px',
                border: '1px solid #F3F4F6',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: DOT_COLORS[i % DOT_COLORS.length],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {p.name.replace(/\[.*?\]/g, '').trim()}
                  </span>
                </div>
                <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                  Match: {p.score}/20
                </span>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {p.insight}
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '8px 0 0' }}>
                Source: {cleanSource(p.source)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Continue ────────────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '8px 0 48px' }}>
        <button
          className="btn-primary"
          onClick={onContinue}
          style={{ minWidth: '260px', height: '48px', fontSize: '15px' }}
        >
          Make Your Decision →
        </button>
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#9CA3AF' }}>
          Based on {result.patterns.length} relevant patterns from 280-entry knowledge base
        </p>
      </div>
    </div>
  );
}
