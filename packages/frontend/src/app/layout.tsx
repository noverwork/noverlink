import './globals.css';

export const metadata = {
  title: 'Noverlink - Tunnel Management',
  description: 'Local-to-global tunneling solution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
