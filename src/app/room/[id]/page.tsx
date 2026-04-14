import { redirect } from 'next/navigation';
import { LiveKitWrapper } from '@/components/LiveKitWrapper';

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const room = resolvedParams.id;
  const username = Array.isArray(resolvedSearchParams.username) ? resolvedSearchParams.username[0] : resolvedSearchParams.username;
  const role = Array.isArray(resolvedSearchParams.role) ? resolvedSearchParams.role[0] : resolvedSearchParams.role;

  if (!username) {
    redirect(`/?room=${room}`);
  }

  return (
    <LiveKitWrapper room={room} initialUsername={username} initialRole={role || 'waiting'} />
  );
}
