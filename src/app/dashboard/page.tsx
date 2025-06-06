'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle } from 'lucide-react';

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
  const [successMessage, setSuccessMessage] = useState(false);
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
    setSuccessMessage(false);
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
      setSuccessMessage(true);
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
    <motion.div className="flex flex-col md:flex-row min-h-screen text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <aside className="w-full md:w-64 bg-black border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-row md:flex-col justify-between items-center md:items-start">
        <motion.a
          href="https://seen-ai.com/"
          className="block"
          whileHover={{ scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Image src="/seenailogo.png" alt="SeenAI Logo" width={60} height={60} />
        </motion.a>
        <nav className="text-zinc-400 md:mt-8 text-sm">
          <a
            href="https://chatgpt.com/g/g-6807e8981c5881919b3abb34f11a3226-seenai"
            target="_blank"
            className="hover:text-white"
          >
            Talk to SeenAI
          </a>
        </nav>
        <div className="text-xs text-zinc-500 hidden md:block mt-4">Logged in as: {user?.email || 'Loading...'}</div>
      </aside>

      <main className="flex-1 bg-[#0b0b0b] p-4 sm:p-6 md:p-10 overflow-y-auto">
        <div className="bg-[#111] border border-zinc-800 rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">Upload your video</h2>
          <p className="text-sm text-zinc-400 mb-4">
            SeenAI will analyze your tone, emotion, and transcript to give personalized feedback.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Video Title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="bg-black border border-white/20 rounded-lg p-2 w-full"
            />
            <select
              value={videoCategory}
              onChange={(e) => setVideoCategory(e.target.value)}
              className="bg-black border border-white/20 rounded-lg p-2 w-full"
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

          {selectedFile && (
            <video controls className="mt-4 w-full max-h-[300px] rounded-md">
              <source src={URL.createObjectURL(selectedFile)} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {errorMessage && <p className="mt-4 text-red-500 text-sm">{errorMessage}</p>}
          {successMessage && (
            <div className="mt-4 flex items-center gap-2 text-green-500 text-sm">
              <CheckCircle size={16} /> Upload successful!
            </div>
          )}

          <div
            className="mt-6 border border-dashed border-zinc-600 rounded-lg p-6 text-center text-zinc-400 hover:border-white cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleBrowseClick}
          >
            Drag & drop your video here or click to browse files
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="mt-4 text-right">
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Upload Video'}
            </Button>
          </div>
        </div>

        <section className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Your Recent Uploads</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#111] rounded-xl border border-zinc-800 p-4"
              >
                <div className="bg-zinc-900 h-40 rounded-lg mb-2 flex items-center justify-center text-zinc-600 text-sm">
                  No Thumbnail
                </div>
                <h4 className="text-white text-sm font-medium truncate">{video.title}</h4>
                <p className="text-xs text-zinc-500">{new Date(video.created_at).toLocaleDateString()}</p>
                <a href={video.file_url} target="_blank" className="text-blue-500 text-xs mt-1 block">
                  View Video
                </a>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </motion.div>
  );
}
