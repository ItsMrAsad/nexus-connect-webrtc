import { redirect } from 'next/navigation';
import { AccessToken } from 'livekit-server-sdk';
import { LiveKitWrapper } from '@/components/LiveKitWrapper';

async function generateToken(room: string, username: string, role: string) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error('Server misconfigured: missing LiveKit env vars');
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    metadata: JSON.stringify({ role }),
  });

  if (role === 'host') {
    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: true,
    });
  } else if (role === 'guest') {
    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
  } else {
    at.addGrant({
      room,
      roomJoin: true,
      canPublish: false,
      canSubscribe: true,
      canPublishData: true,
    });
  }

  const token = await at.toJwt();
  return { token, serverUrl: wsUrl };
}

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

  // Generate token server-side — eliminates cold-start API round-trip
  const { token, serverUrl } = await generateToken(room, username, role || 'waiting');

  return (
    <LiveKitWrapper
      room={room}
      initialUsername={username}
      initialRole={role || 'waiting'}
      initialToken={token}
      initialServerUrl={serverUrl}
    />
  );
}
