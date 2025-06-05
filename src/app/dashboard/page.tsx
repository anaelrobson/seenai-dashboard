'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) console.error('Error getting user:', error.message);
      else setUser(user);
    };
    getUser();
  }, []);

  const fetchVideos = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('videos')
      .select('id, title, file_url, created_at, thumbnail_url, gpt_notes')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);
    if (!error) setVideos(data || []);
  };

  useEffect(() => {
    fetchVideos();
  }, [user]);

  const handleUpload = async () => {
    setErrorMessage('');
    if (!user) return setErrorMessage('User not authenticated.');
    if (!videoTitle.trim() || !videoCategory.trim()) return setErrorMessage('Title and category are required.');
    if (!selectedFile) return setErrorMessage('Please select a video file.');

    setUploading(true);
    const fileExt = selectedFile.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(filePath, selectedFile);

    if (uploadError) {
      setErrorMessage('File upload failed.');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('user-uploads').getPublicUrl(filePath);

    const { error: insertError } = await supabase.from('videos').insert([
      {
        user_id: user.id,
        title: videoTitle,
        category: videoCategory,
        description: videoDescription,
        file_url: urlData.publicUrl,
        status: 'pending',
        tone_data: toneEnabled ? {} : null,
        created_at: new Date().toISOString(),
      }
    ]);

    setUploading(false);

    if (insertError) {
      setErrorMessage('Metadata save failed.');
    } else {
      setVideoTitle('');
      setVideoCategory('');
      setVideoDescription('');
      setToneEnabled(true);
      setSelectedFile(null);
      fetchVideos();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      className="flex min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <aside className="w-64 bg-gradient-to-b from-black to-zinc-900 border-r border-zinc-800 p-6 flex flex-col justify-between shadow-xl">
        <div>
          <motion.div
            className="mb-8 cursor-pointer"
            whileHover={{ scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => window.open('https://seen-ai.com', '_blank')}
          >
            <Image src="/seenailogo.png" alt="SeenAI Logo" width={60} height={60} />
          </motion.div>
          <nav className="flex flex-col gap-4 text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Dashboard</a>
            <a href="#" className="hover:text-white transition-colors">Upload</a>
            <a href="#" className="hover:text-white transition-colors">Talk to SeenAI</a>
          </nav>
        </div>
        <div className="text-xs text-zinc-500">Logged in as: {user?.email || 'Loading...'}</div>
      </aside>

      <main className="flex-1 bg-gradient-to-b from-[#0b0b0b] to-black p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold drop-shadow-sm">Hello, {user?.user_metadata?.first_name || 'friend'}.</h1>
          <Button variant="secondary" onClick={handleUpload} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Upload Video
          </Button>
        </div>

        <motion.div
          className="bg-[#111]/80 border border-zinc-800 rounded-2xl p-6 mb-10 w-full max-w-4xl mx-auto backdrop-blur-sm shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
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
              className="bg-black/50 border border-white/20 rounded-lg p-2 backdrop-blur-md"
            />
            <select
              value={videoCategory}
              onChange={(e) => setVideoCategory(e.target.value)}
              className="bg-black/50 border border-white/20 rounded-lg p-2 backdrop-blur-md"
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
            className="w-full bg-black/50 border border-white/20 rounded-lg p-2 mt-4 backdrop-blur-md"
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

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="hidden"
          />

          {selectedFile && (
            <video
              controls
              className="mt-4 rounded-md border border-white/10 w-full"
            >
              <source src={URL.createObjectURL(selectedFile)} />
              Your browser does not support the video tag.
            </video>
          )}

          {errorMessage && (
            <motion.div
              className="text-red-500 text-sm mt-2"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errorMessage}
            </motion.div>
          )}

          <div
            className="mt-6 border border-dashed border-zinc-600 rounded-lg p-6 text-center text-zinc-400 cursor-pointer hover:bg-zinc-800/70 transition-colors"
            onClick={handleBrowseClick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            Drag & drop your video here or click to browse files
          </div>
        </motion.div>

        <section className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Your Recent Uploads</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {videos.length === 0 ? (
              <p className="text-zinc-500 text-sm col-span-full">No uploads found.</p>
            ) : (
              videos.map((video) => (
                <motion.div
                  key={video.id}
                  className="bg-[#111]/80 rounded-xl border border-zinc-800 p-4 shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>
    </motion.div>
  );
}
