import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HSK 1급 150일 마스터 - 중국어 매일 1단어 챌린지",
  description: "YouTube 원본 영상 강사 육성 음성 반복 청취와 한자 획순 쓰기 챌린지",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-slate-900 min-h-screen flex justify-center items-center p-0 md:p-4">
        {/* 모바일 스마트폰 뷰포트 프레임 (최대 440px) */}
        <div className="w-full max-w-[440px] h-[100dvh] bg-slate-50 shadow-2xl flex flex-col relative overflow-hidden md:rounded-3xl md:h-[92vh] md:border-4 md:border-slate-800">
          {children}
        </div>
      </body>
    </html>
  );
}
