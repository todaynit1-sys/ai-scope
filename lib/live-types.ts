export type LiveCreator = 'OpenAI' | 'Anthropic' | 'Google' | 'xAI';
export interface LiveModel {
  id: string; familyId: string; name: string; creator: LiveCreator;
  source: 'openrouter' | 'artificial-analysis' | 'public-reference'; sourceUrl: string;
  capturedAt: string; catalogDate: string | null; releaseDate: string | null;
  intelligence: number | null; coding: number | null; agentic: number | null;
  speedTps: number | null; responseSeconds: number | null;
  inputPricePerM: number | null; outputPricePerM: number | null;
  benchmarkVersion: string | null; benchmarkEffort: string | null;
  supportedEfforts: string[]; defaultEffort: string | null;
  costPerTask: number | null; contextLength: number | null; priceNotes: string[];
}
export interface SourceStatus {
  source: 'openrouter' | 'artificial-analysis' | 'public-reference';
  state: 'connected' | 'missing-key' | 'error' | 'restricted'; message: string; count: number;
}
export interface LiveSnapshot {
  schemaVersion: 1; capturedAt: string; mode: 'internal' | 'public';
  models: LiveModel[]; sources: SourceStatus[]; stale?: boolean; notice?: string;
}
