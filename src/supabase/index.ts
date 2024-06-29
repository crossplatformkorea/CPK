import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import {decode} from 'base64-arraybuffer';

import {supabaseAnonKey, supabaseUrl} from '../../config';
import type {Database} from '../../src/types/supabase';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const uploadFileToSupabase = async ({
  file,
  fileType,
  bucket,
  destPath,
}: {
  file: string;
  fileType?: string;
  bucket: string;
  destPath: string;
}): Promise<string | undefined> => {
  const {data, error} = await supabase.storage
    .from(bucket)
    .upload(destPath, decode(file), fileType ? {contentType: fileType} : {});

  if (error) {
    throw error;
  }

  return data?.path;
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
