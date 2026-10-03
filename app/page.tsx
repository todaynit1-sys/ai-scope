import RadarRoute from '@/components/radar-route';
export const dynamic='force-dynamic';
export const metadata={title:'오늘의 AI 모델'};
export default function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  return <RadarRoute params={Promise.resolve({})} searchParams={searchParams}/>;
}
