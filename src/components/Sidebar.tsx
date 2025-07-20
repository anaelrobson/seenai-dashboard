'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User | null;
}

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();
  return (
    <aside className="w-full md:w-64 bg-black border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-row md:flex-col justify-between items-center md:items-start gap-4 md:gap-6">
      <motion.a
        href="https://seen-ai.com/"
        className="block"
        whileHover={{ scale: 1.15 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Image src="/logo.svg" alt="SeenAI Logo" width={60} height={60} />
      </motion.a>
      <nav className="text-zinc-400 md:mt-8 text-sm flex gap-4 md:flex-col">
        <a
          href="/dashboard"
          className={`hover:text-white px-2 py-1 rounded ${pathname === '/dashboard' ? 'bg-zinc-800 text-white font-semibold' : ''}`}
        >
          Dashboard
        </a>
        <a
          href="https://chatgpt.com/g/g-6807e8981c5881919b3abb34f11a3226-seenai"
          target="_blank"
          className="hover:text-white px-2 py-1 rounded"
        >
          Talk to SeenAI
        </a>
      </nav>
      <div className="text-xs text-zinc-500 hidden md:block mt-4">
        Logged in as: {user?.email || 'Loading...'}
      </div>
    </aside>
  );
}
