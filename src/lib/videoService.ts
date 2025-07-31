import { supabase } from './supabase';

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
  const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(filePath, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('videos').getPublicUrl(filePath);

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

export async function analyzeVideo(file: File): Promise<Record<string, unknown>> {
  const formData = new FormData();
  formData.append('video', file);

  const res = await fetch(
    'https://seenai-unified-backend-production.up.railway.app/analyze',
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error('Failed to analyze video');
  }

  return (await res.json()) as Record<string, unknown>;
}
