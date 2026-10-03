import { notFound } from 'next/navigation';
import Radar from '@/components/radar';
import { getSnapshot, availableDates } from '@/lib/repository';
import LiveRadar from '@/components/live-radar';
import { getLiveSnapshot, getLiveHistory } from '@/lib/live-repository';
export const dynamic = 'force-dynamic';
export async function generateMetadata({params}:{params:Promise<{route?:string[]}>}) {
  const {route} = await params;
  return {title: ({compare:'모델 비교',history:'변화 기록',lecture:'강의 캡처',methodology:'지표와 출처'} as Record<string,string>)[route?.[0] || ''] || '오늘의 AI 모델'};
}
export default async function Page({params,searchParams}:{params:Promise<{route?:string[]}>,searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const {route} = await params;
  const page = route?.[0] || 'dashboard';
  if ((route?.length || 0)>1 || !['dashboard','compare','history','lecture','methodology'].includes(page)) notFound();
  const query = await searchParams;
  if (query.demo !== '1') {
    const [current,history] = await Promise.all([getLiveSnapshot(),getLiveHistory()]);
    const requested = typeof query.date === 'string' ? query.date : undefined;
    const saved = requested ? history.find(s=>s.capturedAt===requested || s.capturedAt.slice(0,10)===requested) : undefined;
    return <LiveRadar initial={saved||current} history={history} page={page} requestedDate={requested&&!saved?requested:undefined}/>;
  }
  const requestedDate = typeof query.date === 'string' ? query.date : '2026-10-02';
  const dates = typeof query.compare === 'string' ? query.compare.split(',') : [];
  const date = dates[1] || requestedDate;
  const beforeDate = dates[0] || '2026-09-25';
  const available = availableDates.includes(date) && availableDates.includes(beforeDate);
  return <Radar page={page} current={getSnapshot(available ? date : '2026-10-02')} previous={getSnapshot(available ? beforeDate : '2026-09-25')} history={availableDates.map(getSnapshot)} unavailable={!available}/>;
}
