import { useState, useMemo } from 'react';
import type { FounderInput } from '../types';

type Step = 'idea' | 'context' | 'resources';

const STEPS: { id: Step; label: string; number: number }[] = [
  { id: 'idea', label: 'Your Idea', number: 1 },
  { id: 'context', label: 'Your Context', number: 2 },
  { id: 'resources', label: 'Resources', number: 3 },
];

const STEP_TIPS: Record<Step, string[]> = {
  idea: [
    'Be specific about your logistics pain point — generic ideas get generic advice.',
    'Mention the geography (city, country) you are targeting.',
    'Early-stage logistics founders often underestimate last-mile regulatory complexity.',
  ],
  context: [
    'Your background shapes your blind spots — first-time founders often miss operational depth.',
    'Define your first customer as narrowly as possible: "Small restaurants in Bandra, Mumbai".',
    'B2B logistics requires trust — your first customer may need a pilot or free trial.',
  ],
  resources: [
    'A $5,000 budget is enough to validate demand in one micro-market.',
    '3 months is realistic for a prototype + 10 customer interviews.',
    'Founders who stretch timelines past 12 months often lose focus.',
  ],
};

const INITIAL_FORM: FounderInput = {
  idea: '',
  challenge: '',
  background: '',
  customer: '',
  budget: '',
  timeline: '',
};

interface Props {
  onAnalyze: (data: FounderInput) => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

export default function Screen1Form({ onAnalyze, loading, error, onClearError }: Props) {
  const [step, setStep] = useState<Step>('idea');
  const [form, setForm] = useState<FounderInput>(INITIAL_FORM);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const isLastStep = stepIndex === STEPS.length - 1;
  const isFirstStep = stepIndex === 0;

  const updateField = (field: keyof FounderInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = useMemo(() => {
    switch (step) {
      case 'idea':
        return form.idea.trim().length >= 10 && form.challenge.trim().length >= 5;
      case 'context':
        return form.background.trim().length > 0 && form.customer.trim().length >= 3;
      case 'resources':
        return form.budget.trim().length > 0 && form.timeline.trim().length > 0;
    }
  }, [step, form]);

  const handleNext = () => {
    if (!canProceed) return;
    if (isLastStep) {
      onClearError();
      onAnalyze(form);
    } else {
      setStep(STEPS[stepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setStep(STEPS[stepIndex - 1].id);
    }
  };

  const progressPercent = ((stepIndex + 1) / STEPS.length) * 100;

  const tips = STEP_TIPS[step];

  /* Founder preview data */
  const previewItems = [
    { label: 'Idea', value: form.idea || '—' },
    { label: 'Challenge', value: form.challenge || '—' },
    { label: 'Background', value: form.background || '—' },
    { label: 'Customer', value: form.customer || '—' },
    { label: 'Budget', value: form.budget || '—' },
    { label: 'Timeline', value: form.timeline || '—' },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Page Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.03em',
            marginBottom: '8px',
          }}
        >
          New Analysis
        </h1>
        <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.5 }}>
          Describe your startup idea and context. Our knowledge base of 280 patterns will
          analyze your situation.
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          {STEPS.map((s, i) => {
            const isActive = s.id === step;
            const isCompleted = i < stepIndex;
            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flex: i < STEPS.length - 1 ? 1 : '0 0 auto',
                }}
              >
                <div
                  className={
                    isCompleted
                      ? 'progress-dot completed'
                      : isActive
                      ? 'progress-dot active'
                      : 'progress-dot pending'
                  }
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    s.number
                  )}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#2563EB' : isCompleted ? '#10B981' : '#9CA3AF',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={isCompleted ? 'progress-line completed' : 'progress-line'}
                    style={{ flex: 1, minWidth: '24px' }}
                  />
                )}
              </div>
            );
          })}
        </div>
        {/* Thin progress bar */}
        <div
          style={{
            width: '100%',
            height: '3px',
            background: '#E5E7EB',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: '#2563EB',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Main Form Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Step 1: Idea */}
          {step === 'idea' && (
            <div className="card-static animate-slideUp">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  1
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: '17px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Your Idea
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>
                    Tell us what you're building and the problem you're solving
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="label">What is your startup idea?</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="e.g. A last-mile delivery service for small businesses in tier-2 cities..."
                  value={form.idea}
                  onChange={(e) => updateField('idea', e.target.value)}
                  style={{ minHeight: '90px' }}
                />
              </div>

              <div style={{ marginBottom: '4px' }}>
                <label className="label">
                  What's the biggest challenge you're facing?
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="e.g. Customer acquisition cost is too high, or regulatory hurdles for logistics licensing..."
                  value={form.challenge}
                  onChange={(e) => updateField('challenge', e.target.value)}
                  style={{ minHeight: '90px' }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Context */}
          {step === 'context' && (
            <div className="card-static animate-slideUp">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  2
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: '17px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Your Context
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>
                    Who you are and who you're building for
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="label">What is your background?</label>
                <select
                  className="select-field"
                  value={form.background}
                  onChange={(e) => updateField('background', e.target.value)}
                >
                  <option value="">Select your background</option>
                  <option value="student">Student — building while learning</option>
                  <option value="working professional">
                    Working Professional — solving a problem I've seen firsthand
                  </option>
                  <option value="developer">
                    Developer/Engineer — technical founder
                  </option>
                  <option value="logistics industry">
                    Logistics Industry — domain expert
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '4px' }}>
                <label className="label">Who is your first customer?</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. Small restaurants in Bandra, Mumbai"
                  value={form.customer}
                  onChange={(e) => updateField('customer', e.target.value)}
                />
                <p
                  style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    marginTop: '6px',
                  }}
                >
                  Be as specific as possible — the narrower the better.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Resources */}
          {step === 'resources' && (
            <div className="card-static animate-slideUp">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  3
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: '17px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    Your Resources
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>
                    Budget, timeline, and constraints
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="label">
                  What is your budget?
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. $5,000 — Enough for MVP validation in one city"
                  value={form.budget}
                  onChange={(e) => updateField('budget', e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '4px' }}>
                <label className="label">
                  What is your timeline?
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. 3 months to first paying customer"
                  value={form.timeline}
                  onChange={(e) => updateField('timeline', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '24px',
            }}
          >
            <div>
              {!isFirstStep && (
                <button className="btn-secondary" onClick={handleBack}>
                  ← Back
                </button>
              )}
            </div>
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={!canProceed || loading}
              style={{ minWidth: '140px', height: '42px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  Analyzing...
                </span>
              ) : isLastStep ? (
                'Analyze Idea →'
              ) : (
                'Continue →'
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div
              style={{
                marginTop: '20px',
                padding: '14px 16px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                color: '#DC2626',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Right: Suggestions Panel */}
        <div style={{ width: '260px', flexShrink: 0 }}>
          <div className="card-static" style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 0-7.07 17.07L2 22l2.93-2.93A10 10 0 1 0 12 2z" />
              </svg>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                AI Suggestions
              </span>
            </div>

            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {tips.map((tip, i) => (
                <li
                  key={i}
                  style={{
                    padding: '10px 0',
                    borderBottom:
                      i < tips.length - 1 ? '1px solid #F3F4F6' : 'none',
                    fontSize: '13px',
                    color: '#6B7280',
                    lineHeight: 1.5,
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <span style={{ color: '#2563EB', flexShrink: 0, marginTop: '2px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: '#EFF6FF',
                borderRadius: '8px',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  color: '#2563EB',
                  fontWeight: 500,
                }}
              >
                {280} patterns ready to analyze
              </p>
            </div>
          </div>

          {/* Founder Preview */}
          <div className="card-static" style={{ marginTop: '16px', padding: '20px' }}>
            <p
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
              }}
            >
              Profile Preview
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {previewItems.map((item) => (
                <div key={item.label}>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#9CA3AF',
                      marginBottom: '2px',
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: item.value === '—' ? '#D1D5DB' : '#111827',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.value.length > 40
                      ? item.value.slice(0, 40) + '...'
                      : item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Keybind hint */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#D1D5DB',
          marginTop: '24px',
        }}
      >
        Press Enter to {isLastStep ? 'analyze' : 'continue'}
      </p>
    </div>
  );
}
