import { useState, useCallback } from 'react';
import type { FounderInput, AnalysisResult } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = useCallback(async (input: FounderInput) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Server responded with ${res.status}`);
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return { loading, error, result, analyze, reset };
}
