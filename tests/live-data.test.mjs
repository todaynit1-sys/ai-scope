import test from 'node:test';
import assert from 'node:assert/strict';
import { numberOrNull, parseOpenRouter, parseArtificialAnalysis } from '../lib/sources/live-parsers.mjs';
import { collectLiveData, AA_URL } from '../lib/sources/live-collector.mjs';
import { preserveFailedSources } from '../lib/sources/live-fallback.mjs';
test('failed refresh retains prior rows with original timestamps without duplicating healthy sources',()=>{
  const old={models:[{id:'old',source:'openrouter',capturedAt:'old-time'},{id:'old-aa',source:'artificial-analysis'}]};
  const current={models:[{id:'new-aa',source:'artificial-analysis'}],sources:[{source:'openrouter',state:'error'},{source:'artificial-analysis',state:'connected'}]};
  const result=preserveFailedSources(current,old);
  assert.deepEqual(result.models.map(m=>m.id),['new-aa','old']);
  assert.equal(result.models[1].capturedAt,'old-time');assert.equal(result.stale,true);
  assert.match(result.notice,/이전 수집값/);
  assert.equal(preserveFailedSources(current,null).models.length,1);
  assert.doesNotMatch(preserveFailedSources(current,null).notice,/이전 수집값/);
});
const at='2026-10-02T07:00:00Z';
const model={id:'openai/test',name:'OpenAI: Test',architecture:{output_modalities:['text']},pricing:{prompt:'0.000002',completion:'0.00001'},benchmarks:{artificial_analysis:{intelligence_index:51,coding_index:null}},reasoning:{supported_efforts:['low','max'],default_effort:'low'}};
test('per-token prices convert to USD/M, null never becomes zero, no generated effort scores',()=>{
  const [row]=parseOpenRouter({data:[model]},at);
  assert.equal(row.inputPricePerM,2);assert.equal(row.outputPricePerM,10);
  assert.equal(row.coding,null);assert.equal(row.speedTps,null);assert.equal(row.benchmarkEffort,null);
  assert.deepEqual(row.supportedEfforts,['low','max']);assert.equal(row.benchmarkVersion,null);
  assert.equal(parseOpenRouter({data:[model]},at).length,1);
  for(const value of [null,undefined,'',false,-1,'abc',Infinity]) assert.equal(numberOrNull(value),null);
  assert.equal(numberOrNull('0'),0);
});
test('only requested creators and text models are included; variants keep separate identity',()=>{
  const rows=parseOpenRouter({data:[model,{...model,id:'meta-llama/test'},{...model,id:'openai/test:batch'},{...model,id:'openai/image',architecture:{output_modalities:['image']}},{...model,id:'anthropic/fable'}]},at);
  assert.equal(rows.length,2);assert.notEqual(rows[0].id,rows[1].id);
});
test('explicit parser opt-out can suppress embedded benchmark metrics',()=>{
  assert.equal(parseOpenRouter({data:[model]},at,false)[0].intelligence,null);
});
const aa=(page=1,more=false)=>({intelligence_index_version:4.3,pagination:{page,has_more:more},data:[{id:`id${page}`,slug:`test-${page}`,name:`Test (${page===1?'high':'max'})`,model_creator:{name:'OpenAI'},evaluations:{artificial_analysis_intelligence_index:50+page},pricing:{price_1m_input_tokens:2,price_1m_output_tokens:10},performance:{median_output_tokens_per_second:100},artificial_analysis_intelligence_index_cost:{cost_per_task:{total_cost:0.05}}}]});
test('AA preserves provided scores and distinct measured efforts without extrapolation',()=>{
  const [row]=parseArtificialAnalysis(aa(),at);
  assert.equal(row.benchmarkEffort,'high');assert.equal(row.benchmarkVersion,'AA v4.3');assert.equal(row.costPerTask,0.05);
  assert.equal(row.intelligence,51);assert.equal(row.inputPricePerM,2);assert.deepEqual(row.supportedEfforts,[]);
  const [other]=parseArtificialAnalysis(aa(2),at);assert.equal(row.familyId,other.familyId);assert.notEqual(row.id,other.id);
});
test('AA pagination is collected, secrets are only sent to the AA origin',async()=>{
  const calls=[];
  const fetcher=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>url.startsWith(AA_URL)?aa(Number(new URL(url).searchParams.get('page')),new URL(url).searchParams.get('page')==='1'):{data:[model]}};};
  const snapshot=await collectLiveData({apiKey:'test-secret',fetcher});
  assert.equal(snapshot.models.length,3);assert.equal(calls.filter(c=>c.url.startsWith(AA_URL)).length,2);
  assert.equal(calls.find(c=>!c.url.startsWith(AA_URL)).options.headers['x-api-key'],undefined);
  assert.ok(!JSON.stringify(snapshot).includes('test-secret'));
});
test('missing keys and upstream failures return explicit status and never mock data',async()=>{
  const snapshot=await collectLiveData({fetcher:async()=>({ok:false,status:429})});
  assert.equal(snapshot.models.length,0);assert.equal(snapshot.sources[0].state,'error');assert.equal(snapshot.sources[1].state,'missing-key');
  assert.throws(()=>parseOpenRouter({},at));
});
test('public mode retains OpenRouter published scores without requesting the separate AA API',async()=>{
  const calls=[];
  const snapshot=await collectLiveData({mode:'public',apiKey:'test-secret',fetcher:async(url)=>{calls.push(url);return {ok:true,json:async()=>({data:[model]})};}});
  assert.equal(calls.length,1);assert.equal(snapshot.models[0].intelligence,51);assert.equal(snapshot.models[0].coding,null);assert.equal(snapshot.sources[1].state,'restricted');
});
test('inconsistent AA page versions discard the partial source',async()=>{
  const snapshot=await collectLiveData({apiKey:'test',fetcher:async(url)=>({ok:true,json:async()=>url.startsWith(AA_URL)?new URL(url).searchParams.get('page')==='1'?aa(1,true):{...aa(2),intelligence_index_version:4.4}:{data:[model]}})});
  assert.equal(snapshot.models.length,1);assert.equal(snapshot.sources[1].state,'error');
});
