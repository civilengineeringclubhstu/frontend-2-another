'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { Facebook, Linkedin, Mail } from 'lucide-react';

export interface MemberProps {
  name: string;
  designation: string;
  batch?: string;
  photoUrl: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  email?: string;
  index: number;
}

export function MemberCard({ name, designation, batch, photoUrl, facebookUrl, linkedinUrl, email, index }: MemberProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="glass-card p-6 flex flex-col items-center text-center group"
    >
      <div className="relative w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white/40 shadow-lg group-hover:scale-105 transition-transform duration-500">
        <Image 
          src={photoUrl}
          alt={name}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <h3 className="text-xl font-bold mb-1">{name}</h3>
      <p className="text-info-light font-semibold text-sm mb-2 uppercase tracking-wide">{designation}</p>
      {batch && <p className="text-primary-light/60 dark:text-primary/60 text-sm mb-4">Batch {batch}</p>}
      
      <div className="flex items-center gap-3 mt-auto pt-4">
        {facebookUrl && (
          <a href={facebookUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-info-light hover:text-white transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
        )}
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-info-light hover:text-white transition-colors">
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-info-light hover:text-white transition-colors">
            <Mail className="w-4 h-4" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
