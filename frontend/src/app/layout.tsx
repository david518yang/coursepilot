import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Coursepilot',
  description: 'Notetaking, accelerated',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInFallbackRedirectUrl='/editor' signUpFallbackRedirectUrl='/editor'>
      <html lang='en' className={`${lexend.className}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
