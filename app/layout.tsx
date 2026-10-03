import type { Metadata } from 'next';
import './globals.css';
import './scope.css';
export const metadata: Metadata = {
  metadataBase:new URL('https://ai-scope-sage.vercel.app'),
  title: { default:'AI SCOPE — AI 성능·가격 비교', template:'%s | AI SCOPE' },
  description:'GPT, Claude, Grok의 공개 성능과 가격을 한눈에. 모델과 추론량을 체크하고 나에게 맞는 AI를 비교하세요.',
  openGraph:{type:'website',locale:'ko_KR',siteName:'AI SCOPE',title:'AI SCOPE — AI 성능·가격, 한눈에',description:'공개된 성능·가격 자료로 비교하는 AI 모델 대시보드.',images:[{url:'/branding/ai-scope-thumbnail-v3.png',alt:'AI SCOPE — AI 성능·가격, 한눈에'}]},
  twitter:{card:'summary_large_image',title:'AI SCOPE — AI 성능·가격, 한눈에',images:['/branding/ai-scope-thumbnail-v3.png']},
  robots:{ index:false, follow:false },
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ko"><body>{children}</body></html>;
}
