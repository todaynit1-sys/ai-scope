import type { Snapshot, ModelTier, ReasoningEffort, ReasoningProfile } from '../types';
import { efforts } from '../reasoning';
// Intentionally fictional metrics. Model labels are illustrative, not a current model catalog.
const rows = [
  ['gpt','GPT · Astra','OpenAI',93,95,91,82,2.5,10],
  ['opus','Claude · Opus','Anthropic',94,96,93,54,5,25],
  ['claude','Claude · Sonnet','Anthropic',91,97,94,73,3,15],
  ['fable','Claude · Fable','Anthropic',92,94,90,96,2,10],
  ['gemini','Gemini · Pro','Google',90,89,88,116,1.25,5],
  ['grok','Grok · Reasoning','xAI',87,86,85,94,3,15],
  ['flash','Gemini · Flash','Google',81,80,75,218,0.15,0.6],
  ['mini','GPT · Sol','OpenAI',90,93,88,125,2,8],
  ['haiku','Claude · Haiku','Anthropic',78,81,76,155,0.8,4],
] as const;
const tiers: Record<string,ModelTier> = {gpt:'최상위',mini:'차상위',opus:'최상위',claude:'차상위',fable:'미확인',haiku:'경량',gemini:'최상위',flash:'차상위',grok:'최상위'};
export function manualSnapshot(date = '2026-10-02'): Snapshot {
  const age = Math.round((Date.parse('2026-10-02') - Date.parse(date)) / 86400000);
  return { capturedAt: `${date}T07:00:00Z`, models: rows.map((r,i) => ({
    modelId:r[0], modelName:r[1], creator:r[2], intelligence:r[3] - (age ? (i % 3) * Math.min(age, 14) / 7 : 0),
    coding:r[4], agentic:r[5], speedTps:r[6], inputPricePerM:r[7], outputPricePerM:r[8] * (age && r[0] === 'gemini' ? 1.2 : 1),
    capturedAt:`${date}T07:00:00Z`, source:'화면 검토용 예시 데이터', sourceUrl:'/methodology',
    releaseDate: undefined, benchmarkVersion:'demo-v1', redistributionAllowed:true, tier:tiers[r[0]],
    reasoningProfiles: Object.fromEntries(efforts.map((effort,j) => [effort, {
      intelligence:r[3] - [7,3,0,-1.5,-2.5][j] - (age ? (i % 3) * Math.min(age,14)/7 : 0),
      coding:Math.min(100,r[4]-[8,3,0,-1,-2][j]), agentic:Math.min(100,r[5]-[9,4,0,-2,-3][j]), speedTps:Math.round(r[6]*[1.3,1.15,1,0.95,0.9][j]),
      reasoningTokens:Math.round([500,2500,8000,16000,32000][j]*(r[0]==='gpt'?1.2:r[0]==='mini'?0.8:1)),
      responseSeconds:Number(((500+[500,2500,8000,16000,32000][j]*(r[0]==='gpt'?1.2:r[0]==='mini'?0.8:1))/(r[6]*[1.3,1.15,1,0.95,0.9][j])).toFixed(1)),
    } satisfies ReasoningProfile])) as Record<ReasoningEffort,ReasoningProfile>,
  })) };
}
