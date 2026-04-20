import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GraphQL Blog App',
  description: 'A blog app with GraphQL API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen bg-gray-50 py-8">
              {children}
            </main>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}