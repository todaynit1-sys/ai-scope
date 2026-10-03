import RadarRoute from '@/components/radar-route';
export const dynamic='force-dynamic';
export const metadata={title:'변화 기록'};
export default function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  return <RadarRoute params={Promise.resolve({route:['history']})} searchParams={searchParams}/>;
}
