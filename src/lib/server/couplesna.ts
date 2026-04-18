import 'server-only';

import { randomUUID } from 'crypto';
import type { User as AuthUser } from '@supabase/supabase-js';
import { buildFallbackDashboard } from '@/lib/data';
import { DEFAULT_GALLERY_ALBUMS, GALLERY_BUCKET } from '@/lib/gallery';
import { getWeatherForLocation } from '@/lib/providers/weather';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Database, Json } from '@/lib/supabase/database.types';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logEventServer } from '@/lib/logging-service.server';
import type {
  AppDataSnapshot,
  ConnectionInvite,
  DashboardData,
  DashboardPerson,
  GalleryCategory,
  GalleryImage,
  Location,
  Partner,
  UserDetails,
  UserMedia,
} from '@/lib/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type GalleryAlbumRow = Database['public']['Tables']['gallery_albums']['Row'];
type GalleryImageRow = Database['public']['Tables']['gallery_images']['Row'];

const EMPTY_LOCATION: Location = {
  city: 'Unknown City',
  country: 'Unknown Country',
  timezone: 'UTC',
  coords: { lat: 0, lon: 0 },
};

const EMPTY_DETAILS: UserDetails = {
  anniversary: '',
  birthday: '',
  favoriteColor: '',
  favoriteSong: '',
};

const EMPTY_MEDIA: UserMedia = {
  app: 'Spotify',
  track: 'Not synced yet',
};

function toSafeUsername(value: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);

  return cleaned || `couplesna_${randomUUID().slice(0, 8)}`;
}

function isObject(value: Json | null | undefined): value is Record<string, Json | undefined> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeLocation(value: Json | null | undefined): Location {
  if (!isObject(value)) {
    return EMPTY_LOCATION;
  }

  const coords = isObject(value.coords)
    ? {
        lat: Number(value.coords.lat ?? 0),
        lon: Number(value.coords.lon ?? 0),
      }
    : { lat: 0, lon: 0 };

  return {
    city: String(value.city ?? EMPTY_LOCATION.city),
    country: String(value.country ?? EMPTY_LOCATION.country),
    timezone: String(value.timezone ?? EMPTY_LOCATION.timezone),
    coords,
  };
}

function normalizeDetails(value: Json | null | undefined): UserDetails {
  if (!isObject(value)) {
    return EMPTY_DETAILS;
  }

  return {
    anniversary: String(value.anniversary ?? ''),
    birthday: String(value.birthday ?? ''),
    favoriteColor: String(value.favoriteColor ?? ''),
    favoriteSong: String(value.favoriteSong ?? ''),
  };
}

function normalizeMedia(value: Json | null | undefined): UserMedia | null {
  if (!isObject(value)) {
    return null;
  }

  return {
    app: String(value.app ?? EMPTY_MEDIA.app),
    track: String(value.track ?? EMPTY_MEDIA.track),
  };
}

function calculateDistanceKm(a: Location, b: Location) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.coords.lat - a.coords.lat);
  const dLon = toRadians(b.coords.lon - a.coords.lon);
  const lat1 = toRadians(a.coords.lat);
  const lat2 = toRadians(b.coords.lat);

  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return Math.round(earthRadiusKm * arc);
}

function profileToPerson(profile: ProfileRow): DashboardPerson {
  const name =
    profile.full_name ||
    profile.username ||
    profile.email?.split('@')[0] ||
    'Couplesna User';

  return {
    id: profile.id,
    name,
    email: profile.email,
    username: profile.username || toSafeUsername(name),
    profilePic:
      profile.avatar_url ||
      `https://placehold.co/200x200/1f1f1f/ffffff?text=${encodeURIComponent(
        name.slice(0, 1).toUpperCase()
      )}`,
    location: normalizeLocation(profile.location),
    details: normalizeDetails(profile.details),
    media: normalizeMedia(profile.media),
  };
}

function createGalleryLookup(
  albums: GalleryAlbumRow[],
  images: GalleryImageRow[],
  signedUrls: Map<string, string>
): GalleryCategory[] {
  return albums.map((album) => {
    const categoryImages: GalleryImage[] = images
      .filter((image) => image.album_id === album.id)
      .map((image) => ({
        id: image.id,
        url:
          signedUrls.get(image.storage_path) ||
          'https://placehold.co/800x600/1f1f1f/ffffff?text=Image',
        hint: image.caption_hint || 'shared memory',
        storagePath: image.storage_path,
      }));

    return {
      id: album.id,
      slug: album.slug,
      title: album.title,
      images: categoryImages,
    };
  });
}

async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function ensureProfileForUser(user: AuthUser) {
  const admin = createAdminSupabaseClient();
  const usernameBase = user.user_metadata?.user_name || user.email?.split('@')[0] || user.id;
  const username = toSafeUsername(String(usernameBase));

  const { data, error } = await admin
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name:
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          user.email?.split('@')[0] ||
          'Couplesna User',
        avatar_url:
          (user.user_metadata?.avatar_url as string | undefined) ||
          (user.user_metadata?.picture as string | undefined) ||
          null,
        username,
      },
      {
        onConflict: 'id',
      }
    )
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Unable to ensure user profile: ${error?.message || 'unknown error'}`);
  }

  return data;
}

async function getCurrentMembership(admin: ReturnType<typeof createAdminSupabaseClient>, profileId: string) {
  const { data, error } = await admin
    .from('couple_members')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load couple membership: ${error.message}`);
  }

  return data;
}

async function getConnectionInvites(admin: ReturnType<typeof createAdminSupabaseClient>, profileId: string) {
  const { data, error } = await admin
    .from('couple_invites')
    .select('*')
    .or(`sender_profile_id.eq.${profileId},receiver_profile_id.eq.${profileId}`)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Unable to load connection invites: ${error.message}`);
  }

  const otherProfileIds = Array.from(
    new Set(
      (data || []).map((invite) =>
        invite.sender_profile_id === profileId ? invite.receiver_profile_id : invite.sender_profile_id
      )
    )
  );

  const { data: profiles } = otherProfileIds.length
    ? await admin.from('profiles').select('*').in('id', otherProfileIds)
    : { data: [] as ProfileRow[] };

  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return (data || []).map((invite) => {
    const isIncoming = invite.receiver_profile_id === profileId;
    const otherProfileId = isIncoming ? invite.sender_profile_id : invite.receiver_profile_id;
    const otherProfile = profileMap.get(otherProfileId);

    return {
      id: invite.id,
      direction: isIncoming ? 'incoming' : 'outgoing',
      otherProfileId,
      otherName: otherProfile?.full_name || otherProfile?.username || 'Couplesna User',
      otherUsername: otherProfile?.username || otherProfileId,
      otherAvatarUrl: otherProfile?.avatar_url || null,
      createdAt: invite.created_at,
    } satisfies ConnectionInvite;
  });
}

async function ensureDefaultAlbums(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  coupleId: string
) {
  const { data: existing, error } = await admin
    .from('gallery_albums')
    .select('slug')
    .eq('couple_id', coupleId);

  if (error) {
    throw new Error(`Unable to load gallery albums: ${error.message}`);
  }

  const existingSlugs = new Set((existing || []).map((album) => album.slug));
  const missingAlbums = DEFAULT_GALLERY_ALBUMS.filter((album) => !existingSlugs.has(album.slug)).map(
    (album) => ({
      couple_id: coupleId,
      slug: album.slug,
      title: album.title,
      sort_order: album.sortOrder,
    })
  );

  if (missingAlbums.length > 0) {
    const { error: insertError } = await admin.from('gallery_albums').insert(missingAlbums);

    if (insertError) {
      throw new Error(`Unable to create default gallery albums: ${insertError.message}`);
    }
  }
}

async function getSignedImageUrls(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  images: GalleryImageRow[]
) {
  const signedUrlMap = new Map<string, string>();
  const storagePaths = images.map((image) => image.storage_path);

  if (storagePaths.length === 0) {
    return signedUrlMap;
  }

  const { data, error } = await admin.storage
    .from(GALLERY_BUCKET)
    .createSignedUrls(storagePaths, 60 * 60);

  if (error) {
    throw new Error(`Unable to sign gallery URLs: ${error.message}`);
  }

  data.forEach((item, index) => {
    if (item.signedUrl) {
      signedUrlMap.set(storagePaths[index], item.signedUrl);
    }
  });

  return signedUrlMap;
}

export async function loadAppSnapshotForUser(user: AuthUser): Promise<AppDataSnapshot> {
  const admin = createAdminSupabaseClient();
  const currentProfile = await ensureProfileForUser(user);
  const currentPerson = profileToPerson(currentProfile);
  const invites = await getConnectionInvites(admin, currentProfile.id);
  const membership = await getCurrentMembership(admin, currentProfile.id);

  if (!membership) {
    return {
      dashboard: buildFallbackDashboard(currentPerson),
      coupleId: null,
      invites,
    };
  }

  const { data: couple, error: coupleError } = await admin
    .from('couples')
    .select('*')
    .eq('id', membership.couple_id)
    .single();

  if (coupleError || !couple) {
    throw new Error(`Unable to load couple: ${coupleError?.message || 'not found'}`);
  }

  const { data: members, error: membersError } = await admin
    .from('couple_members')
    .select('*')
    .eq('couple_id', couple.id);

  if (membersError) {
    throw new Error(`Unable to load couple members: ${membersError.message}`);
  }

  const partnerMembership = (members || []).find((member) => member.profile_id !== currentProfile.id);

  if (!partnerMembership) {
    return {
      dashboard: buildFallbackDashboard(currentPerson),
      coupleId: couple.id,
      invites,
    };
  }

  const { data: partnerProfile, error: partnerError } = await admin
    .from('profiles')
    .select('*')
    .eq('id', partnerMembership.profile_id)
    .single();

  if (partnerError || !partnerProfile) {
    throw new Error(`Unable to load partner profile: ${partnerError?.message || 'not found'}`);
  }

  await ensureDefaultAlbums(admin, couple.id);

  const [{ data: notes, error: notesError }, { data: albums, error: albumsError }] = await Promise.all([
    admin.from('couple_notes').select('*').eq('couple_id', couple.id),
    admin.from('gallery_albums').select('*').eq('couple_id', couple.id).order('sort_order'),
  ]);

  if (notesError) {
    throw new Error(`Unable to load notes: ${notesError.message}`);
  }

  if (albumsError) {
    throw new Error(`Unable to load gallery albums: ${albumsError.message}`);
  }

  const albumIds = (albums || []).map((album) => album.id);
  const { data: images, error: imagesError } = albumIds.length
    ? await admin
        .from('gallery_images')
        .select('*')
        .eq('couple_id', couple.id)
        .in('album_id', albumIds)
        .order('sort_order')
    : { data: [] as GalleryImageRow[], error: null };

  if (imagesError) {
    throw new Error(`Unable to load gallery images: ${imagesError.message}`);
  }

  const signedImageUrls = await getSignedImageUrls(admin, images || []);
  const partnerPerson = profileToPerson(partnerProfile);
  const weather = await getWeatherForLocation(partnerPerson.location);
  
  // Log map/location request
  await logEventServer('map_request', `Loaded location data for partner of ${currentProfile.email}`, { partner_city: partnerPerson.location.city });

  const distanceApartKm =
    couple.distance_apart_km ?? calculateDistanceKm(currentPerson.location, partnerPerson.location);

  const currentUserNote = (notes || []).find((note) => note.profile_id === currentProfile.id)?.note || '';
  const partnerNote = (notes || []).find((note) => note.profile_id === partnerProfile.id)?.note || '';

  const dashboard: DashboardData = {
    user: currentPerson,
    partner: {
      ...partnerPerson,
      weather,
    } satisfies Partner,
    coupleId: couple.id,
    nextMeetDate:
      couple.next_meet_date || new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    notes: {
      user: currentUserNote,
      partner: partnerNote,
    },
    distanceApartKm,
    gallery: createGalleryLookup(albums || [], images || [], signedImageUrls),
  };

  return {
    dashboard,
    coupleId: couple.id,
    invites,
  };
}

export async function loadAuthenticatedAppSnapshot() {
  const user = await getAuthenticatedUser();
  return loadAppSnapshotForUser(user);
}

function sanitizeFilename(filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
  return safe.length > 80 ? safe.slice(safe.length - 80) : safe;
}

async function ensureCoupleContext(profileId: string) {
  const admin = createAdminSupabaseClient();
  const membership = await getCurrentMembership(admin, profileId);

  if (!membership) {
    throw new Error('You must be connected to a partner first.');
  }

  return { admin, membership };
}

export async function updateDashboardSnapshot(input: {
  nextMeetDate?: string;
  notes?: { user: string; partner?: string };
  distanceApartKm?: number;
}) {
  const user = await getAuthenticatedUser();
  const profile = await ensureProfileForUser(user);
  const { admin, membership } = await ensureCoupleContext(profile.id);

  if (input.nextMeetDate !== undefined || input.distanceApartKm !== undefined) {
    const { error } = await admin
      .from('couples')
      .update({
        ...(input.nextMeetDate !== undefined ? { next_meet_date: input.nextMeetDate } : {}),
        ...(input.distanceApartKm !== undefined
          ? { distance_apart_km: input.distanceApartKm }
          : {}),
      })
      .eq('id', membership.couple_id);

    if (error) {
      throw new Error(`Unable to update couple data: ${error.message}`);
    }
  }

  if (input.notes?.user !== undefined) {
    const { error } = await admin.from('couple_notes').upsert(
      {
        couple_id: membership.couple_id,
        profile_id: profile.id,
        note: input.notes.user,
      },
      {
        onConflict: 'couple_id,profile_id',
      }
    );

    if (error) {
      throw new Error(`Unable to update heartbeat note: ${error.message}`);
    }
  }

  return loadAppSnapshotForUser(user);
}

export async function sendConnectionInvite(partnerIdentifier: string) {
  const trimmedIdentifier = partnerIdentifier.trim();
  if (!trimmedIdentifier) {
    throw new Error('Enter a partner username or user ID.');
  }

  const user = await getAuthenticatedUser();
  const admin = createAdminSupabaseClient();
  const currentProfile = await ensureProfileForUser(user);
  const currentMembership = await getCurrentMembership(admin, currentProfile.id);

  if (currentMembership) {
    throw new Error('You are already connected to a partner.');
  }

  let partnerProfile: ProfileRow | null = null;

  if (trimmedIdentifier === currentProfile.id) {
    throw new Error('You cannot connect with yourself.');
  }

  const { data: byId } = await admin
    .from('profiles')
    .select('*')
    .eq('id', trimmedIdentifier)
    .maybeSingle();

  if (byId) {
    partnerProfile = byId;
  } else {
    const { data: byUsername } = await admin
      .from('profiles')
      .select('*')
      .eq('username', trimmedIdentifier.toLowerCase())
      .maybeSingle();
    partnerProfile = byUsername;
  }

  if (!partnerProfile) {
    throw new Error('No partner profile found for that username or ID.');
  }

  if (partnerProfile.id === currentProfile.id) {
    throw new Error('You cannot connect with yourself.');
  }

  const partnerMembership = await getCurrentMembership(admin, partnerProfile.id);
  if (partnerMembership) {
    throw new Error('That partner is already connected.');
  }

  const { data: reverseInvite } = await admin
    .from('couple_invites')
    .select('*')
    .eq('sender_profile_id', partnerProfile.id)
    .eq('receiver_profile_id', currentProfile.id)
    .eq('status', 'pending')
    .maybeSingle();

  if (reverseInvite) {
    await acceptConnectionInvite(reverseInvite.id);
    return { autoAccepted: true };
  }

  const { data: existingInvite } = await admin
    .from('couple_invites')
    .select('*')
    .eq('sender_profile_id', currentProfile.id)
    .eq('receiver_profile_id', partnerProfile.id)
    .eq('status', 'pending')
    .maybeSingle();

  if (existingInvite) {
    return { autoAccepted: false };
  }

  const { error } = await admin.from('couple_invites').insert({
    sender_profile_id: currentProfile.id,
    receiver_profile_id: partnerProfile.id,
    status: 'pending',
  });

  if (error) {
    throw new Error(`Unable to send connection invite: ${error.message}`);
  }

  await logEventServer('connection_request', `Invite sent from ${currentProfile.email} to ${partnerProfile.email}`);

  return { autoAccepted: false };
}

export async function acceptConnectionInvite(inviteId: string) {
  const user = await getAuthenticatedUser();
  const admin = createAdminSupabaseClient();
  const currentProfile = await ensureProfileForUser(user);

  const { data: invite, error: inviteError } = await admin
    .from('couple_invites')
    .select('*')
    .eq('id', inviteId)
    .eq('receiver_profile_id', currentProfile.id)
    .eq('status', 'pending')
    .maybeSingle();

  if (inviteError) {
    throw new Error(`Unable to load invite: ${inviteError.message}`);
  }

  if (!invite) {
    throw new Error('Invite not found or already handled.');
  }

  const [currentMembership, senderMembership] = await Promise.all([
    getCurrentMembership(admin, currentProfile.id),
    getCurrentMembership(admin, invite.sender_profile_id),
  ]);

  if (currentMembership || senderMembership) {
    throw new Error('One of these users is already connected.');
  }

  const { data: couple, error: coupleError } = await admin
    .from('couples')
    .insert({})
    .select('*')
    .single();

  if (coupleError || !couple) {
    throw new Error(`Unable to create couple: ${coupleError?.message || 'unknown error'}`);
  }

  const { error: membersError } = await admin.from('couple_members').insert([
    { couple_id: couple.id, profile_id: invite.sender_profile_id },
    { couple_id: couple.id, profile_id: invite.receiver_profile_id },
  ]);

  if (membersError) {
    throw new Error(`Unable to create couple membership: ${membersError.message}`);
  }

  const { error: notesError } = await admin.from('couple_notes').insert([
    { couple_id: couple.id, profile_id: invite.sender_profile_id, note: '' },
    { couple_id: couple.id, profile_id: invite.receiver_profile_id, note: '' },
  ]);

  if (notesError) {
    throw new Error(`Unable to initialize notes: ${notesError.message}`);
  }

  await ensureDefaultAlbums(admin, couple.id);

  const { error: inviteUpdateError } = await admin
    .from('couple_invites')
    .update({ status: 'accepted' })
    .eq('id', invite.id);

  if (inviteUpdateError) {
    throw new Error(`Unable to mark invite accepted: ${inviteUpdateError.message}`);
  }

  await admin
    .from('couple_invites')
    .update({ status: 'cancelled' })
    .or(
      `sender_profile_id.eq.${invite.sender_profile_id},receiver_profile_id.eq.${invite.sender_profile_id},sender_profile_id.eq.${invite.receiver_profile_id},receiver_profile_id.eq.${invite.receiver_profile_id}`
    )
    .eq('status', 'pending');

  await logEventServer('connection_bond', `Couple bond formed between ${invite.sender_profile_id} and ${invite.receiver_profile_id}`, { couple_id: couple.id });
}

export async function declineConnectionInvite(inviteId: string) {
  const user = await getAuthenticatedUser();
  const admin = createAdminSupabaseClient();
  const currentProfile = await ensureProfileForUser(user);

  const { error } = await admin
    .from('couple_invites')
    .update({ status: 'declined' })
    .eq('id', inviteId)
    .eq('receiver_profile_id', currentProfile.id)
    .eq('status', 'pending');

  if (error) {
    throw new Error(`Unable to decline invite: ${error.message}`);
  }
}

export async function uploadGalleryFiles(albumId: string, files: File[]) {
  if (files.length === 0) {
    return;
  }

  const user = await getAuthenticatedUser();
  const profile = await ensureProfileForUser(user);
  const { admin, membership } = await ensureCoupleContext(profile.id);

  const { data: album, error: albumError } = await admin
    .from('gallery_albums')
    .select('*')
    .eq('id', albumId)
    .eq('couple_id', membership.couple_id)
    .single();

  if (albumError || !album) {
    throw new Error(`Unable to find album: ${albumError?.message || 'not found'}`);
  }

  const { data: existingImages } = await admin
    .from('gallery_images')
    .select('sort_order')
    .eq('album_id', album.id)
    .order('sort_order', { ascending: false })
    .limit(1);

  let nextSortOrder = (existingImages?.[0]?.sort_order ?? -1) + 1;

  for (const file of files) {
    const storagePath = `couples/${membership.couple_id}/albums/${album.id}/${randomUUID()}-${sanitizeFilename(
      file.name
    )}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage.from(GALLERY_BUCKET).upload(storagePath, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

    if (uploadError) {
      throw new Error(`Unable to upload image: ${uploadError.message}`);
    }

    const { error: insertError } = await admin.from('gallery_images').insert({
      album_id: album.id,
      couple_id: membership.couple_id,
      storage_path: storagePath,
      caption_hint: 'new upload',
      created_by_profile_id: profile.id,
      sort_order: nextSortOrder,
    });

    if (insertError) {
      throw new Error(`Unable to save image metadata: ${insertError.message}`);
    }

    nextSortOrder += 1;
  }
}

export async function deleteGalleryImage(imageId: string) {
  const user = await getAuthenticatedUser();
  const profile = await ensureProfileForUser(user);
  const { admin, membership } = await ensureCoupleContext(profile.id);

  const { data: image, error: imageError } = await admin
    .from('gallery_images')
    .select('*')
    .eq('id', imageId)
    .eq('couple_id', membership.couple_id)
    .single();

  if (imageError || !image) {
    throw new Error(`Unable to find gallery image: ${imageError?.message || 'not found'}`);
  }

  const { error: removeError } = await admin.storage.from(GALLERY_BUCKET).remove([image.storage_path]);
  if (removeError) {
    throw new Error(`Unable to remove stored image: ${removeError.message}`);
  }

  const { error: deleteError } = await admin.from('gallery_images').delete().eq('id', image.id);
  if (deleteError) {
    throw new Error(`Unable to remove gallery metadata: ${deleteError.message}`);
  }
}

export async function getSupabaseHealth() {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from('profiles').select('id').limit(1);
  return {
    ok: !error,
    message: error?.message || 'Supabase reachable',
  };
}
