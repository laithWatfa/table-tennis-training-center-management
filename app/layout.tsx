import type { Metadata } from "next";
import "./globals.css";
import { Tajawal } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';

export const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400','500','800', '700','200'], 
  variable: '--font-tajawal',
});



export const metadata: Metadata = {
  title: "Al Sindyan",
  description: "Ping Pong training center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const themeScript = `
    (function() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);;
    })()
  `;
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
        <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${tajawal.variable} antialiased`}
      >
        <NextTopLoader 
          color="rgba(239, 83, 80, 1)" // Sourced to your --secondary or --accent theme colors
          initialPosition={0.08}
          crawlSpeed={100}
          height={5}
          crawl={true} // Ensures smooth progression crawling behavior
          speed={300}
          showSpinner={false}
        />
        {children}
      </body>
    </html>
  );
}
