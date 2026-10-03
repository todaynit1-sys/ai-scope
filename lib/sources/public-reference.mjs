// A manually verified factual summary of the five linked public release pages.
// This is a dated reference, not a live API response or a website scraper.
export const REFERENCE_DATE = '2026-10-03T00:00:00+09:00';
const releases = [
  {name:'GPT-6 Astra',creator:'OpenAI',slug:'gpt-6-astra',values:[['low',46,0.82],['medium',50,1.54],['high',51,1.73],['xhigh',52,2.31],['max',53,3.26]]},
  {name:'GPT-6.1 Sol',creator:'OpenAI',slug:'gpt-6-1-sol',values:[['low',42,0.13],['medium',48,0.21],['high',50,0.32],['xhigh',51,0.39],['max',52,0.72]]},
  {name:'Claude Fable 5.1',creator:'Anthropic',slug:'claude-fable-5-1',values:[['low',47,2.37],['medium',49,2.98],['high',51,3.91],['xhigh',53,5.98],['max',53,7.63]]},
  {name:'Claude Opus 5.5',creator:'Anthropic',slug:'claude-opus-5-5',values:[['low',42,0.55],['medium',51,1.34],['high',54,1.82],['xhigh',56,3.46],['max',58,5.98]]},
  {name:'Grok 4.7',creator:'xAI',slug:'grok-4-7',values:[['low',42,1.25],['high',46,2.73],['xhigh',46,3.74]]},
];
/** @returns {import('../live-types').LiveModel[]} */
export function publicReferenceModels() {
  return releases.flatMap(release=>release.values.map(([effort,intelligence,costPerTask])=>({
    id:`ref:${release.slug}:${effort}`,familyId:`ref:${release.slug}`,name:release.name,
    creator:/** @type {import('../live-types').LiveCreator} */(release.creator),
    source:'public-reference',sourceUrl:`https://artificialanalysis.ai/models/releases/${release.slug}`,
    capturedAt:REFERENCE_DATE,catalogDate:null,releaseDate:null,
    intelligence:/** @type {number} */(intelligence),costPerTask:/** @type {number} */(costPerTask),
    benchmarkEffort:/** @type {string} */(effort),benchmarkVersion:'AA v4.3.2',
    coding:null,agentic:null,speedTps:null,responseSeconds:null,
    inputPricePerM:null,outputPricePerM:null,contextLength:null,
    supportedEfforts:[],defaultEffort:null,
    priceNotes:['공개 비교 페이지의 정수 점수 · 2026-10-03 확인',...(release.creator==='Anthropic'?['Default Fallback 사용 평가']:[])],
  })));
}
