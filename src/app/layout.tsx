import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Philosoraptor — Autonomous Philosophical Thoughts',
  description: 'An ancient, superintelligent dinosaur generating deep philosophical thoughts autonomously every 5 minutes.',
  keywords: ['philosoraptor', 'philosophy', 'AI', 'meme', 'thoughts'],
  openGraph: {
    title: 'Philosoraptor — Autonomous Philosophical Thoughts',
    description: 'What if thoughts could think themselves? 🦕',
    type: 'website',
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
