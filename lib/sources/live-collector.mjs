import { parseOpenRouter, parseArtificialAnalysis } from './live-parsers.mjs';
import { publicReferenceModels } from './public-reference.mjs';
export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/models';
export const AA_URL = 'https://artificialanalysis.ai/api/v2/language/models/free';
async function requestJson(url, key, fetcher) {
  const response = await fetcher(url, {headers:{Accept:'application/json',...(key?{'x-api-key':key}:{})}, signal:AbortSignal.timeout(20000), cache:'no-store'});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
export async function collectLiveData({apiKey='',mode='internal',redistributionAllowed=false,fetcher=fetch,includeReferences=true}={}) {
  const capturedAt = new Date().toISOString();
  const allowBenchmarks = mode === 'internal' || redistributionAllowed;
  const [router, aa] = await Promise.allSettled([
    requestJson(OPENROUTER_URL, '', fetcher).then(body=>parseOpenRouter(body,capturedAt)),
    !allowBenchmarks || !apiKey ? Promise.resolve(null) : (async()=>{
      let page=1, version=null; const models=[];
      while(page<=20) {
        const body = await requestJson(`${AA_URL}?page=${page}`, apiKey, fetcher);
        if(version!==null && version!==body.intelligence_index_version) throw new Error('페이지 간 평가 버전이 바뀌었습니다.');
        version=body.intelligence_index_version;
        models.push(...parseArtificialAnalysis(body,capturedAt));
        if(!body.pagination || !body.pagination.has_more) return models;
        if(body.pagination.page !== page) throw new Error('API 페이지 번호가 일치하지 않습니다.');
        page++;
      }
      throw new Error('API 페이지 수가 수집 한도를 초과했습니다.');
    })(),
  ]);
  const sources=[{
    source:'openrouter', state:router.status==='fulfilled'?'connected':'error', count:router.status==='fulfilled'?router.value.length:0,
    message:router.status==='fulfilled'?'공개 모델 목록·기본 토큰 단가 연결됨':'OpenRouter 수집 실패 · 연결 또는 응답 형식을 확인하세요.',
  },{
    source:'artificial-analysis', state:!allowBenchmarks?'restricted':!apiKey?'missing-key':aa.status==='fulfilled'?'connected':'error',
    count:aa.status==='fulfilled'&&aa.value?aa.value.length:0,
    message:!allowBenchmarks?'별도 공식 API 미연결':!apiKey?'공식 성능·속도 자료 확장: 서버에 API 키를 설정하세요.':aa.status==='fulfilled'?'공식 Free API 연결됨':'Artificial Analysis 수집 실패 · API 키·접근 권한·요청 한도를 확인하세요.',
  }];
  const references=includeReferences?publicReferenceModels():[];
  if(includeReferences) sources.push({source:'public-reference',state:'connected',count:references.length,message:'단계별 공개 측정값 · 2026-10-03 확인 (자동 갱신 아님)'});
  const rows=[...(router.status==='fulfilled'?router.value:[]),...(aa.status==='fulfilled'&&aa.value?aa.value:[]),...references];
  const models=[...new Map(rows.map(m=>[m.id,m])).values()];
  return {schemaVersion:1,capturedAt,mode,models,sources};
}
