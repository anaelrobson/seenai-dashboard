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
    <motion.div
      className="flex min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <aside className="w-64 bg-black border-r border-zinc-800 p-6 flex flex-col justify-between">
        <div>
          <motion.a
            href="https://seen-ai.com/"
            className="mb-8 block"
            whileHover={{ scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Image src="/seenailogo.png" alt="SeenAI Logo" width={60} height={60} />
          </motion.a>
          <nav className="flex flex-col gap-4 text-zinc-400 mt-8">
            <a
              href="https://chatgpt.com/g/g-6807e8981c5881919b3abb34f11a3226-seenai"
              target="_blank"
              className="hover:text-white"
            >
              Talk to SeenAI
            </a>
          </nav>
        </div>
        <div className="text-xs text-zinc-500">Logged in as: {user?.email || 'Loading...'}</div>
      </aside>

      {/* ...rest of the component remains unchanged... */}
    </motion.div>
  );
}
