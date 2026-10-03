import 'server-only';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { collectLiveData } from './sources/live-collector.mjs';
import { preserveFailedSources } from './sources/live-fallback.mjs';
import type { LiveSnapshot } from './live-types';
// Route handlers and RSC pages can compile this module into separate bundles.
// Share the process cache so a refresh also applies when navigating to another page.
const processStore=globalThis as typeof globalThis & {radarLiveData?:{snapshot:LiveSnapshot|null;expiresAt:number;pending:Promise<LiveSnapshot>|null}};
const cache=processStore.radarLiveData??={snapshot:null,expiresAt:0,pending:null};
const mode = () => process.env.DATA_MODE === 'public' ? 'public' : 'internal';
function publicFilter(snapshot: LiveSnapshot): LiveSnapshot {
  if(mode()==='internal') return snapshot;
  const allow=process.env.AA_REDISTRIBUTION_ALLOWED==='true';
  return {...snapshot,mode:'public',models:snapshot.models.filter(m=>allow||m.source!=='artificial-analysis').map(m=>allow?m:{...m,intelligence:null,coding:null,agentic:null}),sources:snapshot.sources.map(s=>!allow&&s.source==='artificial-analysis'?{...s,state:'restricted',count:0,message:'공개 모드에서는 성능 데이터 재배포 설정이 필요합니다.'}:s)};
}
export async function getLiveHistory(): Promise<LiveSnapshot[]> {
  try {
    const root=path.join(process.cwd(),'data/history');
    const files=(await readdir(root)).filter(f=>f.endsWith('.json')).sort().slice(-100);
    const snapshots=await Promise.all(files.map(async file=>JSON.parse(await readFile(path.join(root,file),'utf8')) as LiveSnapshot));
    return snapshots.filter(s=>s.schemaVersion===1&&Array.isArray(s.models)).map(publicFilter);
  } catch { return []; }
}
export async function getLiveSnapshot(refresh=false): Promise<LiveSnapshot> {
  if(cache.snapshot&&Date.now()<cache.expiresAt&&!refresh) return publicFilter(cache.snapshot);
  if(cache.pending) return cache.pending;
  cache.pending=(async()=>{
    let saved: LiveSnapshot | null=null;
    try { const body=JSON.parse(await readFile(path.join(process.cwd(),'data/latest.json'),'utf8'));if(body.schemaVersion===1&&Array.isArray(body.models))saved=publicFilter(body); } catch {}
    const keyAdded=!!process.env.ARTIFICIAL_ANALYSIS_API_KEY&&saved?.sources.some(s=>s.source==='artificial-analysis'&&s.state==='missing-key');
    if(!refresh&&!keyAdded&&saved&&Date.now()-Date.parse(saved.capturedAt)<6*60*60*1000) {cache.snapshot=saved;cache.expiresAt=Date.parse(saved.capturedAt)+6*60*60*1000;return saved;}
    const current=await collectLiveData({apiKey:process.env.ARTIFICIAL_ANALYSIS_API_KEY||'',mode:mode(),redistributionAllowed:process.env.AA_REDISTRIBUTION_ALLOWED==='true'}) as LiveSnapshot;
    const previous=cache.snapshot&&(!saved||cache.snapshot.capturedAt>=saved.capturedAt)?cache.snapshot:saved;
    const failed=current.sources.some(s=>s.state==='error');
    cache.snapshot=preserveFailedSources(current,previous) as LiveSnapshot;
    cache.expiresAt=Date.now()+(failed?60*1000:6*60*60*1000);
    return publicFilter(cache.snapshot);
  })().finally(()=>{cache.pending=null;});
  return cache.pending;
}
