export default function Header() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        height: '60px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: '0 24px',
          maxWidth: '100%',
        }}
      >
        {/* Left: Logo + Page indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            F
          </div>
          <span
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              letterSpacing: '-0.02em',
            }}
          >
            Founder Brain
          </span>
        </div>

        {/* Right: Search + Notifications + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              placeholder="Search insights..."
              style={{
                width: '240px',
                height: '36px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '0 12px 0 36px',
                fontSize: '13px',
                color: '#111827',
                background: '#F9FAFB',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563EB';
                e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = 'none';
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
                fontSize: '14px',
                pointerEvents: 'none',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>

          {/* Notification Bell */}
          <button
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6B7280',
              fontSize: '16px',
              position: 'relative',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#EF4444',
              }}
            />
          </button>

          {/* Avatar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px 4px 4px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              AF
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#111827',
              }}
            >
              Alex
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
