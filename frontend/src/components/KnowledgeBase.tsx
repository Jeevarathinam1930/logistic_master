import { useState, useEffect, useMemo } from 'react';
import type { KBPattern } from '../types';
import PatternDetail from './PatternDetail';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CATEGORY_TABS = [
  { label: 'All Patterns', value: '' },
  { label: 'Failure Patterns', value: 'FAILURE_PATTERNS' },
  { label: 'Success Patterns', value: 'SUCCESS_PATTERNS' },
  { label: 'Decision Frameworks', value: 'DECISION_FRAMEWORKS' },
  { label: 'Logistics Knowledge', value: 'LOGISTICS_DOMAIN_KNOWLEDGE' },
];

const TYPE_TABS = [
  { label: 'All Types', value: '' },
  { label: 'Failure', value: 'failure' },
  { label: 'Success', value: 'success' },
  { label: 'General', value: 'general' },
];

interface Props {
  onBackToStart: () => void;
}

function getCategoryLabel(cat: string): string {
  if (cat.includes('FAILURE')) return 'Failure';
  if (cat.includes('SUCCESS')) return 'Success';
  if (cat.includes('DECISION')) return 'Framework';
  if (cat.includes('LOGISTICS')) return 'Logistics';
  return cat;
}

function getCategoryBadgeClass(cat: string): string {
  if (cat.includes('FAILURE')) return 'badge-red';
  if (cat.includes('SUCCESS')) return 'badge-green';
  if (cat.includes('DECISION')) return 'badge-purple';
  if (cat.includes('LOGISTICS')) return 'badge-blue';
  return 'badge-gray';
}

export default function KnowledgeBase({ onBackToStart }: Props) {
  const [patterns, setPatterns] = useState<KBPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<KBPattern | null>(null);

  useEffect(() => {
    const fetchPatterns = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (categoryFilter) params.set('category', categoryFilter);
        if (typeFilter) params.set('type', typeFilter);
        if (search) params.set('search', search);

        const res = await fetch(`${API_URL}/patterns?${params.toString()}`);
        if (!res.ok) throw new Error(`Failed to load patterns (${res.status})`);
        const data = await res.json();
        setPatterns(data.patterns || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load patterns');
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
  }, [categoryFilter, typeFilter, search]);

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(debouncedSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ maxWidth: '100%' }}>
        <div style={{ borderBottom: '1px solid #E5E7EB', padding: '32px 36px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                Knowledge Base
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                {loading ? 'Loading...' : `${patterns.length} patterns`} · Failure · Success · Frameworks · Logistics
              </p>
            </div>
            <button className="btn-secondary" onClick={onBackToStart} style={{ fontSize: '13px', height: '38px' }}>
              New Analysis
            </button>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '20px', maxWidth: '480px' }}>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                placeholder="Search patterns by name, keyword, or source..."
                value={debouncedSearch}
                onChange={(e) => setDebouncedSearch(e.target.value)}
                style={{ paddingLeft: '40px', height: '44px', fontSize: '14px' }}
              />
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              {debouncedSearch && (
                <button
                  onClick={() => setDebouncedSearch('')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '16px', padding: '4px' }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setCategoryFilter(tab.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: categoryFilter === tab.value ? '#2563EB' : '#E5E7EB',
                  background: categoryFilter === tab.value ? '#EFF6FF' : '#FFFFFF',
                  color: categoryFilter === tab.value ? '#2563EB' : '#6B7280',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: typeFilter === tab.value ? '#2563EB' : 'transparent',
                  background: typeFilter === tab.value ? '#EFF6FF' : '#F3F4F6',
                  color: typeFilter === tab.value ? '#2563EB' : '#6B7280',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 36px 36px' }}>
          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#2563EB', animation: 'spin 0.6s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading patterns...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ padding: '20px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#DC2626', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && patterns.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              <p style={{ color: '#9CA3AF', fontSize: '15px', marginTop: '16px' }}>No patterns match your filters.</p>
              <button className="btn-secondary" onClick={() => { setCategoryFilter(''); setTypeFilter(''); setDebouncedSearch(''); setSearch(''); }} style={{ marginTop: '12px', fontSize: '13px' }}>
                Clear filters
              </button>
            </div>
          )}

          {/* Pattern Grid */}
          {!loading && !error && patterns.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {patterns.map((p, i) => (
                <div
                  key={p.id}
                  className="pattern-card"
                  onClick={() => setSelectedPattern(p)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    animationDelay: `${i * 30}ms`,
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span className={getCategoryBadgeClass(p.category)} style={{ fontSize: '11px' }}>
                      {getCategoryLabel(p.category)}
                    </span>
                    <span className={`badge ${p.type === 'failure' ? 'badge-red' : p.type === 'success' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '11px' }}>
                      {p.type}
                    </span>
                    {p.tags.map((tag, ti) => (
                      <span key={ti} className="badge badge-blue" style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '8px', lineHeight: 1.3 }}>
                    {p.name}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '12px', flex: 1 }}>
                    {p.summary}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{p.source}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#2563EB' }}>View Details →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Count */}
          {!loading && !error && patterns.length > 0 && (
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#9CA3AF', marginTop: '24px' }}>
              Showing {patterns.length} pattern{patterns.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Pattern Detail Modal */}
      {selectedPattern !== null && (
        <PatternDetail
          pattern={selectedPattern}
          onClose={() => setSelectedPattern(null)}
        />
      )}
    </div>
  );
}
