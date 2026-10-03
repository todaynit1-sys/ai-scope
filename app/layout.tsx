import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: { default:'AI Model Radar — AI 모델 비교', template:'%s | AI Model Radar' },
  description:'AI 모델의 성능, 가격, 속도와 변화를 한눈에 비교하는 한국어 대시보드 초안.',
  robots:{ index:false, follow:false },
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ko"><body>{children}</body></html>;
}
