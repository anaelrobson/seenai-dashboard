'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User | null;
}

export default function Sidebar({ user }: Props) {
  return (
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
      <div className="text-xs text-zinc-500 hidden md:block mt-4">
        Logged in as: {user?.email || 'Loading...'}
      </div>
    </aside>
  );
}
