import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import nextEnv from '@next/env';
import { collectLiveData } from '../lib/sources/live-collector.mjs';
nextEnv.loadEnvConfig(process.cwd());
const snapshot=await collectLiveData({apiKey:process.env.ARTIFICIAL_ANALYSIS_API_KEY||'',mode:process.env.DATA_MODE==='public'?'public':'internal',redistributionAllowed:process.env.AA_REDISTRIBUTION_ALLOWED==='true'});
for(const source of snapshot.sources) console.log(`${source.source}: ${source.state} (${source.count})`);
if(!snapshot.models.length) { console.error('수집된 모델이 없어 기존 스냅샷을 유지합니다.');process.exit(1); }
try {
  const previous=JSON.parse(await readFile('data/latest.json','utf8'));
  for(const source of snapshot.sources.filter(s=>s.state==='error')) snapshot.models.push(...previous.models.filter(m=>m.source===source.source && (snapshot.mode==='internal'||m.source!=='artificial-analysis')));
} catch(error) { if(error.code!=='ENOENT') throw error; }
if(snapshot.sources.some(s=>s.state==='error')) {
  snapshot.stale=true;
  snapshot.notice='일부 출처 수집 실패 · 이전 자료의 행별 수집 시각을 확인하세요.';
}
await mkdir('data/history',{recursive:true});
const text=JSON.stringify(snapshot,null,2)+'\n';
const filename=snapshot.capturedAt.replace(/[:.]/g,'-');
await writeFile(`data/history/${filename}.json`,text,{flag:'wx'});
await writeFile('data/latest.json.tmp',text);
await rename('data/latest.json.tmp','data/latest.json');
console.log(`실제 자료 ${snapshot.models.length}개 저장 · ${snapshot.capturedAt}`);
