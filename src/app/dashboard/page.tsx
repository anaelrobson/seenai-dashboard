'use client';
import { useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchVideos, Video } from '@/lib/videoService';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import UploadForm from '@/components/UploadForm';
import RecentUploads from '@/components/RecentUploads';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error) setUser(data.user);
    });
  }, []);

  const loadVideos = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchVideos(user.id);
      setVideos(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  return (
    <motion.div className="flex flex-col md:flex-row min-h-screen text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Sidebar user={user} />
      <main className="flex-1 bg-[#0b0b0b] p-4 sm:p-6 md:p-10 overflow-y-auto">
        {user && <UploadForm userId={user.id} onUploaded={loadVideos} />}
        <RecentUploads videos={videos} />
      </main>
    </motion.div>
  );
}
