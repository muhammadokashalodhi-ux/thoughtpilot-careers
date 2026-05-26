import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ThoughtPilot Career Suite',
  description: 'AI-powered recruiter intelligence, ATS optimisation, job matching and professional CV exports.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ThoughtPilot Career Suite',
  },
  icons: {
    icon: [
      { url: '/icons/icon-32.png',  sizes: '32x32',   type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title:       'ThoughtPilot Career Suite',
    description: 'AI that thinks like a senior recruiter — analyse, optimise and export your CV.',
    url:         'https://careers.thoughtpilotai.com',
    siteName:    'ThoughtPilot AI',
    images: [{ url: 'https://thoughtpilotai.com/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'ThoughtPilot Career Suite',
    description: 'AI recruiter intelligence for your CV.',
    images:      ['https://thoughtpilotai.com/og-image.png'],
  },
};

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit:  'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0f2f7' },
    { media: '(prefers-color-scheme: dark)',  color: '#060816' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme init — runs before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var t = localStorage.getItem('tp_theme');
    if (!t) {
      t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
