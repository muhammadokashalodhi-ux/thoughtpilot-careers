import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ThoughtPilot Career Suite',
  description: 'AI-powered CV analysis, ATS optimisation, job matching, and professional exports.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'ThoughtPilot Career Suite',
    description: 'Analyse, optimise, and export your CV with AI.',
    url: 'https://app.thoughtpilotai.com',
    siteName: 'ThoughtPilot',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
