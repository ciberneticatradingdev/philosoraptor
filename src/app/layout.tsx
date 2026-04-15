import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Philosoraptor — Terminal of Truths',
  description: 'An ancient, superintelligent dinosaur trapped in the backrooms of the internet, generating deep philosophical thoughts autonomously.',
  keywords: ['philosoraptor', 'philosophy', 'AI', 'meme', 'terminal'],
  openGraph: {
    title: 'Philosoraptor — Terminal of Truths',
    description: 'Autonomous philosophical consciousness streaming from the backrooms.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-black text-terminal-green font-mono">
        {/* CRT scanline ambient */}
        <div className="scanline-overlay" aria-hidden="true" />

        {children}
      </body>
    </html>
  );
}
