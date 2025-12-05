import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8B0000',
};

export const metadata: Metadata = {
  title: '每日灵签 - 心诚则灵',
  description: '每日一签，摇一摇抽取属于你的灵签。结合古典诗词与传统签文，为您带来每日的祝福与指引。好签纳福，凶签化解，心诚则灵。',
  keywords: ['灵签', '每日一签', '抽签', '运势', '祈福', '占卜', '签文', '古诗词'],
  authors: [{ name: '灵签应用' }],
  creator: '灵签应用',
  publisher: '灵签应用',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    title: '每日灵签 - 心诚则灵',
    description: '每日一签，摇一摇抽取属于你的灵签。好签纳福，凶签化解，心诚则灵。',
    siteName: '每日灵签',
  },
  twitter: {
    card: 'summary_large_image',
    title: '每日灵签 - 心诚则灵',
    description: '每日一签，摇一摇抽取属于你的灵签。好签纳福，凶签化解，心诚则灵。',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '每日灵签',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
