import { AuthGuard } from '@/components/auth-guard';

export default function TunnelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
