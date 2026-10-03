export type ReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'ultra';
export type ReasoningSelection = ReasoningEffort | 'all';
export type ModelTier = '최상위' | '차상위' | '경량' | '미확인';
export interface ReasoningProfile {
  intelligence: number; coding: number; agentic: number; speedTps: number;
  reasoningTokens: number; responseSeconds: number;
}
export interface ModelSnapshot {
  capturedAt: string; source: string; sourceUrl: string; modelId: string;
  modelName: string; creator: string; releaseDate?: string; intelligence: number;
  coding: number; agentic: number; speedTps: number; ttftSeconds?: number;
  inputPricePerM: number; outputPricePerM: number; valueScore?: number;
  benchmarkVersion: string; redistributionAllowed: boolean;
  tier: ModelTier; reasoningProfiles: Record<ReasoningEffort, ReasoningProfile>;
  reasoningEffort?: ReasoningEffort; reasoningTokens?: number; responseSeconds?: number; taskCost?: number;
}
export interface Snapshot { capturedAt: string; models: ModelSnapshot[] }
