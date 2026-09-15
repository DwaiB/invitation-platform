import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Celebrato | Personalized Digital Invitations',
  description:
    'Create stunning, bespoke digital invitations for weddings, birthdays, anniversaries, and parties with personalized guest links and seamless RSVP tracking.',
  openGraph: {
    title: 'Celebrato | Personalized Digital Invitations',
    description:
      'Create stunning, bespoke digital invitations with individual and group personalized delivery.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} scroll-smooth`}>
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased font-sans selection:bg-amber-500 selection:text-neutral-950">
        {children}
      </body>
    </html>
  );
}
