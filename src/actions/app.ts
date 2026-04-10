'use server';

import { revalidatePath } from 'next/cache';
import {
  acceptConnectionInvite,
  declineConnectionInvite,
  loadAuthenticatedAppSnapshot,
  sendConnectionInvite,
  updateDashboardSnapshot,
} from '@/lib/server/couplesna';

export async function getAppSnapshot() {
  return loadAuthenticatedAppSnapshot();
}

export async function saveDashboardData(input: {
  nextMeetDate?: string;
  notes?: { user: string; partner?: string };
  distanceApartKm?: number;
}) {
  const snapshot = await updateDashboardSnapshot(input);
  revalidatePath('/');
  return snapshot;
}

export async function requestConnection(partnerIdentifier: string) {
  const result = await sendConnectionInvite(partnerIdentifier);
  revalidatePath('/');
  return result;
}

export async function acceptInvite(inviteId: string) {
  await acceptConnectionInvite(inviteId);
  revalidatePath('/');
}

export async function declineInvite(inviteId: string) {
  await declineConnectionInvite(inviteId);
  revalidatePath('/');
}
