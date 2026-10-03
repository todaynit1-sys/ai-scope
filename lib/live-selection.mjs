export const DEFAULT_EFFORTS = ['low', 'medium', 'high', 'xhigh'];

/** @param {import('./live-types').LiveModel[]} rows */
export function defaultFamilies(rows) {
  const targets = [
    ['OpenAI', /^GPT[- ]\d+(?:\.\d+)*[- ]Astra$/i],
    ['OpenAI', /^GPT[- ]\d+(?:\.\d+)*[- ]Sol$/i],
    ['Anthropic', /^Claude Fable \d+(?:\.\d+)*$/i],
    ['Anthropic', /^Claude Opus \d+(?:\.\d+)*$/i],
    ['xAI', /^Grok \d+(?:\.\d+)*$/i],
  ];
  return targets.flatMap(([creator, pattern]) => {
    const candidates = rows.filter(m => m.creator === creator && pattern.test(m.name));
    candidates.sort((a, b) =>
      (b.catalogDate || b.releaseDate || '').localeCompare(a.catalogDate || a.releaseDate || '') ||
      b.name.localeCompare(a.name, 'en', { numeric: true })
    );
    return candidates.length ? [candidates[0].familyId] : [];
  });
}

/**
 * Unknown evaluation settings remain one source row, never one row per checked effort.
 * @template {{benchmarkEffort: string|null}} T
 * @param {T[]} rows
 * @param {string[]} efforts
 * @returns {T[]}
 */
export function filterEfforts(rows, efforts) {
  return efforts.length ? rows.filter(m => m.benchmarkEffort === null || efforts.includes(m.benchmarkEffort)) : [];
}
