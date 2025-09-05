// Root Layout
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CISPA Platform',
  description: 'CIS Platform Assessment - Streamline transaction readiness',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}