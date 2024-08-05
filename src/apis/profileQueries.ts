import {supabase} from '../supabase';
import {User, UserUpdateArgs} from '../types';

export const fetchUpdateProfile = async ({
  args,
  authId,
  tags,
}: {
  args: UserUpdateArgs;
  tags: string[];
  authId: string;
}) => {
  const {data: updatedProfile, error: updateError} = await supabase
    .from('users')
    .update({
      ...args,
    })
    .eq('id', authId)
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
      .eq('id', authId)
      .select('id')
      .single();

    if (data?.id) {
      await supabase.from('_TagToUser').upsert(
        {
          A: data.id,
          B: authId,
        },
        {
          ignoreDuplicates: true,
        },
      );
    }
  });

  return updatedProfile as unknown as User;
};
