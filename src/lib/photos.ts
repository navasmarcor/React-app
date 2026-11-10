import { supabase } from './supabase';

/**
 * Uploads a picked photo to the athlete's own folder and returns its public address,
 * so coaches can see it from the profile link.
 */
export async function uploadPhoto(userId: string, kind: 'track' | 'life', uri: string, mimeType?: string) {
  const res = await fetch(uri);
  const body = await res.arrayBuffer();
  const type = mimeType || res.headers.get('content-type') || 'image/jpeg';
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('heic') ? 'heic' : 'jpg';
  const path = `${userId}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await supabase.storage.from('photos').upload(path, body, { contentType: type, upsert: false });
  if (error) throw error;
  return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
}

/** Removes a photo from storage when it lives in the athlete's folder. */
export async function deletePhoto(url: string) {
  const marker = '/storage/v1/object/public/photos/';
  const i = url.indexOf(marker);
  if (i < 0) return;
  await supabase.storage.from('photos').remove([decodeURIComponent(url.slice(i + marker.length))]);
}
