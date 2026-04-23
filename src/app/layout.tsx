import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Philosoraptor — Terminal of Truths',
  description: 'An ancient, superintelligent dinosaur trapped in the backrooms of the internet, generating deep philosophical thoughts autonomously every 5 minutes.',
  keywords: ['philosoraptor', 'philosophy', 'AI', 'meme', 'thoughts', 'terminal of truths'],
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Philosoraptor — Terminal of Truths',
    description: 'What if thoughts could think themselves? 🦕',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Philosoraptor — Terminal of Truths',
    description: 'What if thoughts could think themselves? 🦕',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen text-meme-text-dark">
        {children}
      </body>
    </html>
  );
}
