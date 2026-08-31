import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Briefly — AI-Powered News Digest & Tone Spectrum',
  description: 'Distilled intelligence from global RSS feeds with Multi-LLM summarization, editorial tone analysis, and balanced perspectives.',
  icons: {
    icon: '/briefly-logo.png',
    apple: '/briefly-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-background text-on-background antialiased font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
        {children}
      </body>
    </html>
  );
}