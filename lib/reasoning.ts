import type { ModelSnapshot, ReasoningEffort } from './types';
export const effortLabels: Record<ReasoningEffort,string> = {low:'Low',medium:'Middle',high:'High',xhigh:'XHigh',ultra:'Ultra'};
export const efforts: ReasoningEffort[] = ['low','medium','high','xhigh','ultra'];
// Illustrative workload: 1,000 input + 500 visible output tokens.
// Sample reasoning tokens are billed at output rate. Real provider billing must be verified.
export function atEffort(model:ModelSnapshot, effort:ReasoningEffort):ModelSnapshot {
  const profile = model.reasoningProfiles[effort];
  return {...model,...profile,reasoningEffort:effort,
    taskCost:(1000*model.inputPricePerM + (500+profile.reasoningTokens)*model.outputPricePerM)/1_000_000};
}
