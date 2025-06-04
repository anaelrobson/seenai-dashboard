'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient';

interface Video {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
  thumbnail_url?: string;
  gpt_notes?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [toneEnabled, setToneEnabled] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      if (typeof window !== 'undefined') {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error('Error getting user:', error.message);
        } else {
          setUser(user);
        }
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('videos')
        .select('id, title, file_url, created_at, thumbnail_url, gpt_notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Failed to fetch videos:', error);
      } else {
        setVideos(data || []);
      }
    };

    fetchVideos();
  }, [user]);

  return (
    <div className="flex min-h-screen text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-zinc-800 p-6 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <Image src="/seenailogo.png" alt="SeenAI Logo" width={40} height={40} />
          </div>
          <nav className="flex flex-col gap-4 text-zinc-400">
            <a href="#" className="hover:text-white">Dashboard</a>
            <a href="#" className="hover:text-white">Upload</a>
            <a href="#" className="hover:text-white">Talk to SeenAI</a>
          </nav>
        </div>
        <div className="text-xs text-zinc-500">Logged in as: {user?.email || 'Loading...'}</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#0b0b0b] p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Hello, {user?.user_metadata?.first_name || 'friend'}.</h1>
          <Button variant="secondary">Upload Video</Button>
        </div>

        {/* Upload Section */}
        <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 mb-10 w-full max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">Upload your video</h2>
          <p className="text-sm text-zinc-400 mb-4">
            SeenAI will analyze your tone, emotion, and transcript to give personalized feedback.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Video Title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="bg-black border border-white/20 rounded-lg p-2"
            />

            <select
              value={videoCategory}
              onChange={(e) => setVideoCategory(e.target.value)}
              className="bg-black border border-white/20 rounded-lg p-2"
            >
              <option value="">Select Category</option>
              <option value="education">🎓 Education</option>
              <option value="pitch">📈 Pitch</option>
              <option value="speaking">🎙️ Speaking</option>
              <option value="freestyle">🎤 Freestyle</option>
            </select>
          </div>

          <textarea
            placeholder="Describe what’s happening in the video..."
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
            className="w-full bg-black border border-white/20 rounded-lg p-2 mt-4"
          />

          <label className="flex items-center mt-4 text-sm">
            <input
              type="checkbox"
              checked={toneEnabled}
              onChange={(e) => setToneEnabled(e.target.checked)}
              className="mr-2"
            />
            Extract Tone & Emotion
          </label>

          <div className="mt-6 border border-dashed border-zinc-600 rounded-lg p-6 text-center text-zinc-400">
            Drag & drop your video here or click to browse files
          </div>
        </div>

        {/* Recent Uploads Section */}
        <section className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Your Recent Uploads</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {videos.length === 0 ? (
              <p className="text-zinc-500 text-sm col-span-full">No uploads found.</p>
            ) : (
              videos.map((video) => (
                <div key={video.id} className="bg-[#111] rounded-xl border border-zinc-800 p-4">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt="Video thumbnail"
                      className="w-full h-40 object-cover rounded-md mb-2"
                    />
                  ) : (
                    <div className="bg-zinc-900 h-40 rounded-lg mb-2 flex items-center justify-center text-zinc-500 text-sm">
                      No Thumbnail
                    </div>
                  )}
                  <h4 className="text-white text-sm font-medium truncate">{video.title || 'Untitled Video'}</h4>
                  <p className="text-zinc-500 text-xs mb-1">{new Date(video.created_at).toLocaleDateString()}</p>
                  <a
                    href={video.file_url}
                    target="_blank"
                    className="text-blue-400 text-xs hover:underline"
                  >
                    View Video
                  </a>
                  {video.gpt_notes && (
                    <p className="text-xs mt-2 italic text-white/70 line-clamp-2">{video.gpt_notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
