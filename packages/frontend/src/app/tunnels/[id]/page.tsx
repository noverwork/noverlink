import { TunnelDetailPage } from '../../../components/pages/tunnel-detail-page';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <TunnelDetailPage tunnelId={id} />;
}
