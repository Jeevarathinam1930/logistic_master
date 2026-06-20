export interface FounderInput {
  idea: string;
  challenge: string;
  background: string;
  customer: string;
  budget: string;
  timeline: string;
}

export interface Pattern {
  name: string;
  source: string;
  insight: string;
  score: number;
}

export interface AnalysisResult {
  confidence_score: number;
  patterns: Pattern[];
  clarified_idea: string;
  assumptions: string;
  failure_risk: string;
  milestone_plan: string;
  first_step: string;
}

export type Screen = 'input' | 'analysis' | 'decision' | 'knowledge';
export type Decision = 'proceed' | 'pivot' | 'pause' | null;

export interface AppState {
  screen: Screen;
  decision: Decision;
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  formData: FounderInput;
  revisedIdea: string;
}

export interface KBPattern {
  id: number;
  name: string;
  category: string;
  type: string;
  summary: string;
  source: string;
  tags: string[];
  logistics_segment: string;
  framework_type: string;
  applies_to: string;
}

export interface KBPatternDetail extends KBPattern {
  context: string;
  insight: string;
  warning_sign: string;
  resolution: string;
  steps: string;
  decision_point: string;
  fails_when: string;
}
