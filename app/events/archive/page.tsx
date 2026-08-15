'use client';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { motion } from 'motion/react';
import { MapPin, Calendar, Clock, ExternalLink, Archive } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getArchivedEvents, EventItem } from '@/lib/db';
import Markdown from 'react-markdown';

export default function ArchivePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const e = await getArchivedEvents(50);
        setEvents(e);
      } catch (err) {
        console.error('Error fetching past events:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl pb-24">
      <PageHeader 
        title="Past Events & Archives" 
        description="Explore the archives of our previous symposia, workshops, civil fests, and competitions." 
      />
      
      <div className="flex flex-col gap-10">
        {loading && (
          <div className="text-center py-16 text-primary-light/60 dark:text-primary/60 font-medium">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-info-light border-t-transparent rounded-full mb-3" />
            <p>Loading past events from archive...</p>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-16 glass-card max-w-xl mx-auto p-8 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-info-light/10 text-info-light flex items-center justify-center mx-auto mb-3">
              <Archive className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Past Events in Archive</h3>
            <p className="text-sm text-primary-light/60 dark:text-primary/60">
              Completed events and program memories will appear here.
            </p>
          </div>
        )}

        {events.map((event, idx) => {
          const title = event.title;
          const loc = event.location || 'HSTU Campus';
          const desc = event.descriptionMarkdown || event.description || '';
          const img = event.coverImageUrl || event.imageUrl || `https://picsum.photos/seed/archive_${event.id || idx}/960/540`;
          const eventDate = event.eventDate ? new Date(event.eventDate) : new Date();
          const dStr = event.eventDate ? eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Past Event';
          const tStr = event.time || 'Completed';

          return (
            <motion.div
              key={event.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="glass-card overflow-hidden group flex flex-col md:flex-row items-stretch border border-white/20 hover:border-info-light/40 transition-colors"
            >
              {/* 16:9 Fixed Aspect Ratio Cover Image Container (Identical to Upcoming) */}
              <div className="relative w-full md:w-[380px] lg:w-[440px] aspect-video shrink-0 overflow-hidden bg-slate-900 filter grayscale group-hover:grayscale-0 transition-all duration-700">
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-800/90 backdrop-blur-md text-white/90 flex items-center gap-1 shadow-md border border-white/10">
                  <Archive className="w-3 h-3" /> ARCHIVED
                </span>
              </div>
              
              {/* Event Content & Details */}
              <div className="p-6 sm:p-8 md:p-9 flex flex-col justify-center flex-grow">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold text-primary-light/70 dark:text-primary/70 mb-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10">
                    <Calendar className="w-4 h-4 text-info-light" /> {dStr}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10">
                    <Clock className="w-4 h-4 text-info-light" /> {tStr}
                  </div>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-snug text-primary-light dark:text-primary group-hover:text-info-light transition-colors">
                  {title}
                </h3>
                
                <div className="flex items-center gap-2 text-primary-light/70 dark:text-primary/70 font-semibold text-sm mb-4">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" /> 
                  <span>{loc}</span>
                </div>
                
                {/* Formatted Markdown Content */}
                <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-primary-light/80 dark:text-primary/80 leading-relaxed mb-6">
                  <Markdown>{desc}</Markdown>
                </div>
                
                {event.facebookUrl && (
                  <div className="mt-auto pt-2">
                    <a 
                      href={event.facebookUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn-secondary inline-flex items-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4 text-info-light" />
                      <span>View Event Gallery & Highlights</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
