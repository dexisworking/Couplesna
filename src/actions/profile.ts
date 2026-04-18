'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  username: z.string().min(3).max(24).regex(/^[a-z0-9_]+$/).optional(),
  details: z.object({
    birthday: z.string().optional(),
    anniversary: z.string().optional(),
    favoriteColor: z.string().optional(),
    favoriteSong: z.string().optional(),
  }).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export async function updateProfile(input: ProfileUpdateInput) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const admin = createAdminSupabaseClient();
  
  // First, get current profile to merge details if necessary
  const { data: currentProfile, error: fetchError } = await admin
    .from('profiles')
    .select('details')
    .eq('id', user.id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch profile: ${fetchError.message}`);
  }

  const existingDetails = (currentProfile.details as Record<string, string | undefined>) || {};
  const updatedDetails = input.details 
    ? { ...existingDetails, ...input.details }
    : undefined;

  // Validate the input
  profileUpdateSchema.parse(input);

  const { error: updateError } = await admin
    .from('profiles')
    .update({
      ...(input.fullName ? { full_name: input.fullName } : {}),
      ...(input.username ? { username: input.username } : {}),
      ...(updatedDetails ? { details: updatedDetails } : {}),
    })
    .eq('id', user.id);

  if (updateError) {
    if (updateError.code === '23505') {
       throw new Error('Username is already taken.');
    }
    throw new Error(`Failed to update profile: ${updateError.message}`);
  }

  revalidatePath('/');
  return { success: true };
}
