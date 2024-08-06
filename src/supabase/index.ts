import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import {decode} from 'base64-arraybuffer';
import {supabaseAnonKey, supabaseUrl} from '../../config';
import * as FileSystem from 'expo-file-system';
import type {Database} from '../../src/types/supabase';
import {FileType, ImageInsertArgs} from '../types';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // https://github.com/supabase/auth-js/issues/23#issuecomment-2253757376
    // detectSessionInUrl: false,
  },
});

export const uploadFileToSupabase = async ({
  uri,
  fileType,
  bucket,
  destPath,
}: {
  uri: string;
  fileType?: FileType;
  bucket: string;
  destPath: string;
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
    image_url: getPublicUrlFromPath(data.path),
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
}: {
  bucket: string;
  filePath: string;
}): Promise<void> => {
  const {error} = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw error;
  }
};

export const getPublicUrlFromPath = (path: string): string => {
  const {data} = supabase.storage.from('images').getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error('Failed to get signed URL');
  }

  return data?.publicUrl;
};

export const getSignedUrlFromUploadFile = async ({
  bucket,
  path,
  expiresIn = 60,
}: {
  bucket: string;
  path: string;
  expiresIn?: number;
}): Promise<string> => {
  const {data} = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (!data?.signedUrl) {
    throw new Error('Failed to get signed URL');
  }

  return data.signedUrl;
};
