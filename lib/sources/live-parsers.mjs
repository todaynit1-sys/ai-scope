const creators = {openai:'OpenAI',anthropic:'Anthropic',google:'Google','x-ai':'xAI',xai:'xAI'};
export function numberOrNull(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}
function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
export function parseOpenRouter(body, capturedAt, allowBenchmarks = true) {
  if (!Array.isArray(body?.data)) throw new Error('OpenRouter 응답의 data 배열이 없습니다.');
  return body.data.flatMap(raw => {
    const m = object(raw);
    if (typeof m.id !== 'string' || typeof m.name !== 'string') return [];
    const creator = creators[m.id.split('/')[0]];
    if (!creator || m.id.includes(':') || !m.architecture?.output_modalities?.includes('text')) return [];
    const pricing = object(m.pricing);
    const benchmark = allowBenchmarks ? object(m.benchmarks?.artificial_analysis) : {};
    const reasoning = object(m.reasoning);
    const input = numberOrNull(pricing.prompt), output = numberOrNull(pricing.completion);
    const created = numberOrNull(m.created);
    return [{
      id:`or:${m.id}`, familyId:m.id, name:m.name.replace(/^[^:]+:\s*/, ''), creator,
      source:'openrouter', sourceUrl:`https://openrouter.ai/${m.id}`, capturedAt,
      catalogDate:created !== null && created < 1e12 ? new Date(created * 1000).toISOString().slice(0,10) : null,
      releaseDate:null, intelligence:numberOrNull(benchmark.intelligence_index),
      coding:numberOrNull(benchmark.coding_index), agentic:numberOrNull(benchmark.agentic_index),
      speedTps:null, responseSeconds:null, inputPricePerM:input === null ? null : input * 1e6,
      outputPricePerM:output === null ? null : output * 1e6, benchmarkVersion:null, benchmarkEffort:null,
      supportedEfforts:Array.isArray(reasoning.supported_efforts) ? reasoning.supported_efforts.filter(e=>typeof e==='string') : [],
      defaultEffort:typeof reasoning.default_effort==='string'?reasoning.default_effort:null,
      costPerTask:null, contextLength:numberOrNull(m.context_length),
      priceNotes:[...(Array.isArray(pricing.overrides)&&pricing.overrides.length?['긴 입력에 별도 단가 적용']:[]), ...(numberOrNull(pricing.request)>0?['요청당 추가 요금 있음']:[])],
    }];
  });
}
export function parseArtificialAnalysis(body, capturedAt) {
  if (!Array.isArray(body?.data)) throw new Error('Artificial Analysis 응답의 data 배열이 없습니다.');
  const version = numberOrNull(body.intelligence_index_version);
  return body.data.flatMap(raw => {
    const m = object(raw), creatorName = m.model_creator?.name;
    const creator = creatorName === 'xAI' || creatorName === 'x.ai' ? 'xAI' : ['OpenAI','Anthropic','Google'].includes(creatorName) ? creatorName : null;
    if (!creator || typeof m.id !== 'string' || typeof m.name !== 'string' || typeof m.slug !== 'string') return [];
    // Assign a setting only when the source explicitly names the tested effort.
    const effort = m.name.match(/\((low|medium|high|xhigh|ultra|max|none|minimal)\)\s*$/i)?.[1]?.toLowerCase() || null;
    const name = effort ? m.name.replace(/\s*\([^()]+\)\s*$/, '') : m.name;
    const e = object(m.evaluations), p = object(m.pricing), performance = object(m.performance);
    return [{
      id:`aa:${m.id}:${m.slug}:${effort||'unspecified'}`, familyId:`aa:${creator}:${name.toLowerCase()}`,
      name, creator, source:'artificial-analysis', sourceUrl:`https://artificialanalysis.ai/models/${m.slug}`,
      capturedAt, catalogDate:null, releaseDate:typeof m.release_date==='string'?m.release_date:null,
      intelligence:numberOrNull(e.artificial_analysis_intelligence_index), coding:numberOrNull(e.artificial_analysis_coding_index),
      agentic:numberOrNull(e.artificial_analysis_agentic_index), speedTps:numberOrNull(performance.median_output_tokens_per_second),
      responseSeconds:numberOrNull(performance.median_end_to_end_response_time_seconds),
      inputPricePerM:numberOrNull(p.price_1m_input_tokens), outputPricePerM:numberOrNull(p.price_1m_output_tokens),
      benchmarkVersion:version === null?null:`AA v${version}`, benchmarkEffort:effort,
      supportedEfforts:[], defaultEffort:null, costPerTask:numberOrNull(m.artificial_analysis_intelligence_index_cost?.cost_per_task?.total_cost),
      contextLength:numberOrNull(m.context_window), priceNotes:[],
    }];
  });
}
