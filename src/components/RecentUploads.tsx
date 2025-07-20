'use client';
import VideoCard from './VideoCard';
import type { Video } from '@/lib/videoService';

export default function RecentUploads({ videos }: { videos: Video[] }) {
  return (
    <section className="mt-10">
      <h3 className="text-lg font-semibold mb-4">Your Recent Uploads</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}
