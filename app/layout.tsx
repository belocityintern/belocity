import './globals.css';

export const metadata = {
  title: '[BELOCITY]',
  description: 'Real-time narrative momentum analysis for tokens.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
