import {SupabaseClient} from '../hooks/useSupabase';
import {t} from '../STRINGS';
import {User, UserUpdateArgs} from '../types';

export const fetchUserProfile = async ({
  clerkId,
  supabase,
}: {
  clerkId: string;
  supabase: SupabaseClient;
}) => {
  const {data: profile, error: profileError} = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (profileError || !profile) {
    if (__DEV__) {
      console.error(profileError);
    }

    throw new Error(t('error.failedToFetchData'));
  }

  const {data: tagsData, error: tagsError} = await supabase
    .from('_TagToUser')
    .select('A')
    .eq('B', profile.id);

  if (tagsError) {
    throw new Error(tagsError.message);
  }

  const tagIds = tagsData.map((tag) => tag.A);

  const {data: tags, error: tagsFetchError} = await supabase
    .from('tags')
    .select('tag')
    .in('id', tagIds);

  if (tagsFetchError) {
    if (__DEV__) {
      console.error(tagsFetchError);
    }
  }

  const userTags = tags?.map((tag) => tag.tag) || [];

  return {profile, userTags};
};

export const fetchUserWithDisplayName = async ({
  displayName,
  supabase,
}: {
  displayName: string;
  supabase: SupabaseClient;
}) => {
  const {data: profile, error: profileError} = await supabase
    .from('users')
    .select('*')
    .eq('display_name', displayName)
    .single();

  if (profileError) {
    if (__DEV__) {
      console.error(profileError);
    }
    throw new Error(t('error.failedToFetchData'));
  }

  const {data: tagsData, error: tagsError} = await supabase
    .from('_TagToUser')
    .select('A')
    .eq('B', profile.id);

  if (tagsError) {
    if (__DEV__) {
      console.error(tagsError);
    }
    throw new Error(t('error.failedToFetchData'));
  }

  const tagIds = tagsData.map((tag) => tag.A);

  const {data: tags, error: tagsFetchError} = await supabase
    .from('tags')
    .select('tag')
    .in('id', tagIds);

  if (tagsFetchError) {
    if (__DEV__) {
      console.error(tagsFetchError);
    }
  }

  const userTags = tags?.map((tag) => tag.tag) || [];

  return {profile, userTags};
};

export const fetchUpdateProfile = async ({
  args,
  clerkId,
  tags,
  supabase,
}: {
  args: UserUpdateArgs;
  tags: string[];
  clerkId: string;
  supabase: SupabaseClient;
}) => {
  if (!args.display_name) {
    const error = new Error(t('error.displayNameIsEmpty'));
    error.name = 'displayName';
    throw error;
  }

  const {data: existingUser} = await supabase
    .from('users')
    .select('id')
    .eq('display_name', args.display_name)
    .neq('clerk_id', clerkId)
    .single();

  if (existingUser?.id) {
    const error = new Error(t('error.displayNameExists'));
    error.name = 'displayName';
    throw error;
  }

  const {data: updatedProfile, error: updateError} = await supabase
    .from('users')
    .update({
      ...args,
    })
    .eq('clerk_id', clerkId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  tags.forEach(async (tag) => {
    if (!tag) return;

    const tagData = tag.toLowerCase();

    const {data} = await supabase
      .from('tags')
      .upsert({tag: tagData})
      .eq('tag', tagData)
      .eq('id', updatedProfile.id)
      .select('id')
      .single();

    if (data?.id) {
      await supabase.from('_TagToUser').upsert(
        {
          A: data.id,
          B: updatedProfile.id,
        },
        {
          ignoreDuplicates: true,
        },
      );
    }
  });

  return updatedProfile as unknown as User;
};
