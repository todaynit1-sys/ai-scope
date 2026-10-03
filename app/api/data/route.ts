import { getLiveSnapshot } from '@/lib/live-repository';
export const runtime='nodejs';
export const dynamic='force-dynamic';
let lastRefresh=0;
export async function GET() {
  return Response.json(await getLiveSnapshot(),{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:Request) {
  const origin=request.headers.get('origin');
  // Next's internal request URL can use localhost while the browser uses 127.0.0.1.
  // Validate the actual Host header rather than that rewritten internal origin.
  let sameOrigin=false;
  try { const url=new URL(origin||'');sameOrigin=(url.protocol==='http:'||url.protocol==='https:')&&url.host===request.headers.get('host')&&url.origin===origin; } catch {}
  if(!sameOrigin) return Response.json({error:'같은 사이트에서만 갱신할 수 있습니다.'},{status:403});
  if(Date.now()-lastRefresh<60000) return Response.json({error:'잠시 후 다시 갱신하세요. 갱신은 1분에 한 번 가능합니다.'},{status:429,headers:{'Retry-After':'60'}});
  lastRefresh=Date.now();
  return Response.json(await getLiveSnapshot(true),{headers:{'Cache-Control':'no-store'}});
}
