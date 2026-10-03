import RadarRoute from '@/components/radar-route';
export const dynamic='force-dynamic';
export const metadata={title:'모델 비교'};
export default function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  return <RadarRoute params={Promise.resolve({route:['compare']})} searchParams={searchParams}/>;
}
