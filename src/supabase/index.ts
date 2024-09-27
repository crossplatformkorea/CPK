import 'react-native-url-polyfill/auto';

import {decode} from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import {FileType, ImageInsertArgs} from '../types';
import {SupabaseClient} from '../hooks/useSupabase';

export const uploadFileToSupabase = async ({
  uri,
  fileType,
  bucket,
  destPath,
  supabase,
}: {
  uri: string;
  fileType?: FileType;
  bucket: string;
  destPath: string;
  supabase: SupabaseClient;
}): Promise<ImageInsertArgs | undefined> => {
  const ext = uri.split('.').pop();
  const base64 = await FileSystem.readAsStringAsync(uri, {encoding: 'base64'});

  const {data, error} = await supabase.storage
    .from(bucket)
    .upload(
      destPath,
      decode(base64),
      fileType ? {contentType: fileType, upsert: true} : {upsert: true},
    );

  if (error) {
    throw error;
  }

  return {
    image_url: getPublicUrlFromPath({
      path: data.fullPath,
      supabase,
    }),
    url: data.fullPath,
    id: data.id,
    type: fileType || null,
    mime_type:
      fileType === 'Audio'
        ? `audio/${ext}`
        : fileType === 'Video'
          ? `video/${ext}`
          : `image/${ext}`,
  };
};

export const deleteFileFromSupabase = async ({
  bucket,
  filePath,
  supabase,
}: {
  bucket: string;
  filePath: string;
  supabase: SupabaseClient;
}): Promise<void> => {
  const {error} = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    throw error;
  }
};

export const getPublicUrlFromPath = ({
  path,
  supabase,
}: {
  path: string;
  supabase: SupabaseClient;
}): string => {
  const {data} = supabase.storage.from('images').getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error('Failed to get signed URL');
  }

  //! Note: supabase returns wrong url based on platform
  return data.publicUrl.replace(/(\/images)(\/images)+/, '/images');
};

export const getSignedUrlFromUploadFile = async ({
  bucket,
  path,
  expiresIn = 60,
  supabase,
}: {
  bucket: string;
  path: string;
  expiresIn?: number;
  supabase: SupabaseClient;
}): Promise<string> => {
  const {data} = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (!data?.signedUrl) {
    throw new Error('Failed to get signed URL');
  }

  return data.signedUrl;
};
