import type { ModelSnapshot } from './types';
export const effectiveCost = (m: ModelSnapshot) => (m.inputPricePerM + m.outputPricePerM * 3) / 4;
export function withValue(models: ModelSnapshot[]) {
  const maxPerformance = Math.max(1, ...models.map(m => m.intelligence));
  const maxCost = Math.max(1, ...models.map(effectiveCost));
  return models.map(m => ({ ...m, valueScore: Math.round(100 * (m.intelligence / maxPerformance) / (0.25 + effectiveCost(m) / maxCost)) }));
}
export function ranked(models: ModelSnapshot[]) { return [...models].sort((a,b) => b.intelligence - a.intelligence || a.modelId.localeCompare(b.modelId)); }
export function changes(current: ModelSnapshot[], before: ModelSnapshot[]) {
  const previous = ranked(before);
  return ranked(current).map((model, index) => {
    const oldIndex = previous.findIndex(m => m.modelId === model.modelId);
    const old = previous[oldIndex];
    const compatible = old?.benchmarkVersion === model.benchmarkVersion;
    return { ...model, rank: index + 1, isNewModel: !old, criteriaChanged: !!old && !compatible,
      rankChange: old && compatible ? oldIndex - index : null,
      performanceChange: old && compatible ? model.intelligence - old.intelligence : null,
      priceChangePct: old && effectiveCost(old) ? (effectiveCost(model) / effectiveCost(old) - 1) * 100 : null };
  });
}
