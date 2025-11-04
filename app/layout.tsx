import type { Metadata } from 'next';
import { AppProvider } from './context/AppContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'NRC Management System',
  description: 'AI-Assisted Healthcare Management for SAM Children & Pregnant Women',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
