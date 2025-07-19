'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { Video } from '@/lib/videoService';

export default function VideoCard({ video }: { video: Video }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#111] rounded-xl border border-zinc-800 p-4"
    >
      <div className="bg-zinc-900 h-40 rounded-lg mb-2 flex items-center justify-center text-zinc-600 text-sm overflow-hidden">
        {video.thumbnail_url ? (
          <Image src={video.thumbnail_url} alt={video.title} width={160} height={90} className="object-cover w-full h-full" />
        ) : (
          'No Thumbnail'
        )}
      </div>
      <h4 className="text-white text-sm font-medium truncate">{video.title}</h4>
      <p className="text-xs text-zinc-500">{new Date(video.created_at).toLocaleDateString()}</p>
      <a href={video.file_url} target="_blank" className="text-blue-500 text-xs mt-1 block">
        View Video
      </a>
      {video.tone_rating !== undefined && (
        <p className="text-xs text-zinc-400 mt-2">Tone Score: {video.tone_rating}</p>
      )}
      {video.transcript && (
        <p className="text-xs text-zinc-400 mt-2 line-clamp-3">{video.transcript}</p>
      )}
      {video.frames && video.frames.length > 0 && (
        <div className="flex overflow-x-auto gap-2 mt-2">
          {video.frames.map((f) => (
            <Image
              key={f.timestamp}
              src={f.imageUrl}
              alt={`Frame ${f.timestamp}`}
              width={80}
              height={45}
              className="rounded"
            />
          ))}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" disabled>
          Send to GPT
        </Button>
        <Button variant="secondary" disabled>
          Export PDF
        </Button>
        <Button variant="secondary" disabled>
          Save to Library
        </Button>
      </div>
    </motion.div>
  );
}
