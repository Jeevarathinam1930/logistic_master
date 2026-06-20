import { useState, useEffect, useMemo } from 'react';
import type { KBPattern, KBPatternDetail } from '../types';
import { Markdown } from '../utils/markdown';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Props {
  pattern: KBPattern;
  onClose: () => void;
}

function Badge({ cat }: { cat: string }) {
  const cls = cat.includes('FAILURE') ? 'badge-red'
    : cat.includes('SUCCESS') ? 'badge-green'
    : cat.includes('DECISION') ? 'badge-purple'
    : cat.includes('LOGISTICS') ? 'badge-blue'
    : 'badge-gray';
  const label = cat.includes('FAILURE') ? 'Failure Pattern'
    : cat.includes('SUCCESS') ? 'Success Pattern'
    : cat.includes('DECISION') ? 'Decision Framework'
    : cat.includes('LOGISTICS') ? 'Logistics Knowledge'
    : cat;
  return <span className={`badge ${cls}`} style={{ fontSize: '12px' }}>{label}</span>;
}

function TypeBadge({ type }: { type: string }) {
  if (type === 'failure') return <span className="badge badge-red" style={{ fontSize: '12px' }}>Failure</span>;
  if (type === 'success') return <span className="badge badge-green" style={{ fontSize: '12px' }}>Success</span>;
  return <span className="badge badge-gray" style={{ fontSize: '12px' }}>General</span>;
}

export default function PatternDetail({ pattern, onClose }: Props) {
  const [detail, setDetail] = useState<KBPatternDetail | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setFetching(true);
      setFetchError(null);
      try {
        const url = `${API_URL}/patterns/${pattern.id}`;
        const res = await fetch(url);
        if (!res) throw new Error('No response from server');
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data: KBPatternDetail = await res.json();
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [pattern.id]);

  const display = useMemo(() => {
    if (detail) return detail;
    return null;
  }, [detail]);

  const context = display?.context || pattern.summary;
  const insight = display?.insight || '';
  const warning = display?.warning_sign || '';
  const resolution = display?.resolution || '';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflowY: 'auto',
        padding: '32px 16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card-static"
        style={{
          width: '100%',
          maxWidth: '900px',
          padding: '40px',
          position: 'relative',
          animation: 'slideUp 0.3s ease-out',
          marginTop: '0',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B7280',
            fontSize: '20px',
            lineHeight: 1,
            zIndex: 1,
          }}
        >
          ×
        </button>

        {/* ── Header ────────────────────────────────── */}
        <div style={{ marginBottom: '28px' }}>
          {/* Badges row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge cat={pattern.category} />
            <TypeBadge type={pattern.type} />
            {pattern.tags.map((t, i) => (
              <span key={i} className="badge badge-blue" style={{ fontSize: '11px' }}>{t}</span>
            ))}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#111827',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              margin: '0 0 12px',
            }}
          >
            {pattern.name}
          </h1>

          {/* Source */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '14px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>
              Source: <strong style={{ color: '#111827' }}>{pattern.source}</strong>
            </span>
            {pattern.logistics_segment && (
              <span className="badge badge-blue" style={{ marginLeft: '12px', fontSize: '11px' }}>
                {pattern.logistics_segment}
              </span>
            )}
            {pattern.framework_type && (
              <span className="badge badge-purple" style={{ fontSize: '11px' }}>
                {pattern.framework_type}
              </span>
            )}
          </div>
        </div>

        {/* ── Divider ───────────────────────────────── */}
        <div style={{ height: '1px', background: '#E5E7EB', marginBottom: '28px' }} />

        {/* ── Loading / error ────────────────────────── */}
        {fetching && !display && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '3px solid #E5E7EB',
                borderTopColor: '#2563EB',
                animation: 'spin 0.6s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading pattern details...</p>
          </div>
        )}

        {fetchError && !display && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" style={{ margin: '0 auto 12px', display: 'block' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{ color: '#DC2626', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Failed to load pattern details
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '16px' }}>
              {fetchError}
            </p>
            <button className="btn-secondary" onClick={onClose} style={{ fontSize: '13px' }}>
              Close
            </button>
          </div>
        )}

        {/* ── Content (show from KBPattern + detail overlay) ── */}
        {(display || (!fetching && !fetchError)) && (
          <div>
            {/* Overview */}
            {context && (
              <div style={{ marginBottom: '32px' }}>
                <h2
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px',
                  }}
                >
                  Overview
                </h2>
                <div
                  style={{
                    fontSize: '15px',
                    color: '#4B5563',
                    lineHeight: 1.8,
                  }}
                >
                  <Markdown text={context} />
                </div>
              </div>
            )}

            {/* Why It Happened */}
            {insight && (
              <div style={{ marginBottom: '32px' }}>
                <h2
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px',
                  }}
                >
                  Why It Happened
                </h2>
                <div
                  style={{
                    fontSize: '15px',
                    color: '#4B5563',
                    lineHeight: 1.8,
                  }}
                >
                  <Markdown text={insight} />
                </div>
              </div>
            )}

            {/* Key Lessons */}
            {(warning || insight) && (
              <div
                style={{
                  marginBottom: '32px',
                  padding: '20px 24px',
                  background: '#F9FAFB',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <h2
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '14px',
                  }}
                >
                  Key Lessons
                </h2>
                <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
                  {warning ? <Markdown text={warning} /> : <Markdown text={insight} />}
                </div>
              </div>
            )}

            {/* Founder Takeaways */}
            {resolution && (
              <div
                style={{
                  marginBottom: '32px',
                  padding: '20px 24px',
                  background: '#ECFDF5',
                  borderRadius: '12px',
                  border: '1px solid #A7F3D0',
                }}
              >
                <h2
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#065F46',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Founder Takeaways
                </h2>
                <div style={{ fontSize: '14px', color: '#065F46', lineHeight: 1.8 }}>
                  <Markdown text={resolution} />
                </div>
              </div>
            )}

            {/* Related Patterns (placeholder - same category) */}
            <div
              style={{
                padding: '16px 0 0',
                borderTop: '1px solid #E5E7EB',
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#9CA3AF',
                  marginBottom: '4px',
                }}
              >
                {pattern.category.replace(/_/g, ' ')} — Pattern #{pattern.id}
              </p>
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: '28px',
                paddingTop: '20px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <button
                className="btn-secondary"
                onClick={onClose}
                style={{ fontSize: '14px', height: '42px', padding: '0 28px' }}
              >
                ← Close
              </button>
            </div>
          </div>
        )}

        {/* Subtle loading overlay when fetching detail after initial show */}
        {fetching && display && (
          <div
            style={{
              position: 'absolute',
              top: '60px',
              right: '52px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#9CA3AF',
            }}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: '2px solid #E5E7EB',
                borderTopColor: '#2563EB',
                animation: 'spin 0.6s linear infinite',
              }}
            />
            Loading details...
          </div>
        )}
      </div>
    </div>
  );
}
