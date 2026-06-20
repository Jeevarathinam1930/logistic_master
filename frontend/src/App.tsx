import { useState, useCallback } from 'react';
import type { FounderInput, AnalysisResult, Decision, Screen } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Screen1Form from './components/Screen1Form';
import Screen2Analysis from './components/Screen2Analysis';
import Screen3Decision from './components/Screen3Decision';
import KnowledgeBase from './components/KnowledgeBase';

const INITIAL_FORM: FounderInput = {
  idea: '',
  challenge: '',
  background: '',
  customer: '',
  budget: '',
  timeline: '',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('input');
  const [formData, setFormData] = useState<FounderInput>(INITIAL_FORM);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [decision, setDecision] = useState<Decision>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = useCallback(async (data: FounderInput) => {
    setLoading(true);
    setError(null);
    setFormData(data);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        throw new Error(`API error ${res.status}: ${errText}`);
      }

      const json: AnalysisResult = await res.json();

      if (!json || typeof json.confidence_score !== 'number') {
        throw new Error('Invalid API response format');
      }

      setResult(json);
      setScreen('analysis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDecision = useCallback((d: Decision) => {
    setDecision(d);
  }, []);

  const handleReAnalyze = useCallback(
    async (revisedIdea: string) => {
      if (!result) return;
      const updated: FounderInput = {
        ...formData,
        idea: revisedIdea || formData.idea,
        challenge: revisedIdea ? `Revised: ${revisedIdea}` : formData.challenge,
      };
      setScreen('input');
      setDecision(null);
      setResult(null);
      await handleAnalyze(updated);
    },
    [formData, result, handleAnalyze]
  );

  const handleBackToStart = useCallback(() => {
    setScreen('input');
    setDecision(null);
    setResult(null);
    setFormData(INITIAL_FORM);
    setError(null);
  }, []);

  const handleNavigate = useCallback((s: Screen) => {
    setScreen(s);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar screen={screen} onNavigate={handleNavigate} />
        <main
          style={{
            flex: 1,
            padding: screen === 'knowledge' ? '0' : '36px',
            maxWidth: screen === 'knowledge' ? '100%' : '900px',
            minHeight: 'calc(100vh - 60px)',
          }}
        >
          {screen === 'input' && (
            <Screen1Form
              onAnalyze={handleAnalyze}
              loading={loading}
              error={error}
              onClearError={() => setError(null)}
            />
          )}

          {screen === 'analysis' && result && (
            <Screen2Analysis
              result={result}
              onContinue={() => setScreen('decision')}
              onBackToStart={handleBackToStart}
            />
          )}

          {screen === 'decision' && result && (
            <Screen3Decision
              result={result}
              formData={formData}
              decision={decision}
              onDecision={handleDecision}
              onReAnalyze={handleReAnalyze}
              onBackToStart={handleBackToStart}
            />
          )}

          {screen === 'knowledge' && (
            <KnowledgeBase onBackToStart={handleBackToStart} />
          )}
        </main>
      </div>
    </div>
  );
}
