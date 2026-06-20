import type { Screen } from '../types';

interface NavItem {
  id: Screen | 'history';
  label: string;
  icon: JSX.Element;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'input',
    label: 'New Analysis',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    id: 'knowledge',
    label: 'Knowledge Base',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

interface Props {
  screen: Screen;
  onNavigate: (s: Screen) => void;
}

export default function Sidebar({ screen, onNavigate }: Props) {
  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        height: 'calc(100vh - 60px)',
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 10px',
        position: 'sticky',
        top: '60px',
        overflowY: 'auto',
      }}
    >
      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            (item.id === 'input' && screen === 'input') ||
            (item.id === 'knowledge' && screen === 'knowledge');

          const isClickable = item.id === 'input' || item.id === 'knowledge';

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isClickable) onNavigate(item.id as Screen);
              }}
              className={isActive ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
              style={{ opacity: isClickable ? 1 : 0.5, cursor: isClickable ? 'pointer' : 'default' }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom: Settings */}
      <button className="sidebar-nav-item" style={{ opacity: 0.5, cursor: 'default' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>Settings</span>
      </button>

      {/* KB Status */}
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          background: '#F9FAFB',
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
        }}
      >
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Knowledge Base
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280' }}>
          <span>Patterns</span>
          <span style={{ fontWeight: 600, color: '#111827' }}>280</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
          <span>Categories</span>
          <span style={{ fontWeight: 600, color: '#111827' }}>4</span>
        </div>
      </div>
    </aside>
  );
}
