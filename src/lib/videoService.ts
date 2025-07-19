import { supabase } from './supabaseClient';

export interface Video {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
  thumbnail_url?: string;
  gpt_notes?: string;
  transcript?: string;
  tone_rating?: number;
  frames?: { timestamp: number; imageUrl: string; score: number }[];
}

export async function fetchVideos(userId: string) {
  const { data, error } = await supabase
    .from('videos')
    .select('id, title, file_url, created_at, thumbnail_url, gpt_notes, transcript, tone_rating, frames')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) throw error;
  return data as Video[];
}

export async function uploadVideo({
  userId,
  file,
  title,
  category,
  description,
  toneEnabled,
}: {
  userId: string;
  file: File;
  title: string;
  category: string;
  description: string;
  toneEnabled: boolean;
}) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('user-uploads')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('user-uploads').getPublicUrl(filePath);

  const { error: insertError } = await supabase.from('videos').insert([
    {
      user_id: userId,
      title,
      category,
      description,
      file_url: urlData.publicUrl,
      status: 'pending',
      tone_data: toneEnabled ? {} : null,
      created_at: new Date().toISOString(),
    },
  ]);

  if (insertError) throw insertError;
}
