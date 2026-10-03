import 'server-only';
import { collectLiveData } from './live-collector.mjs';
import type { LiveSnapshot } from '../live-types';
export async function artificialAnalysisSnapshot(): Promise<LiveSnapshot> {
  const data=await collectLiveData({apiKey:process.env.ARTIFICIAL_ANALYSIS_API_KEY||'',mode:process.env.DATA_MODE==='public'?'public':'internal',redistributionAllowed:process.env.AA_REDISTRIBUTION_ALLOWED==='true'}) as LiveSnapshot;
  return {...data,models:data.models.filter(m=>m.source==='artificial-analysis'),sources:data.sources.filter(s=>s.source==='artificial-analysis')};
}
