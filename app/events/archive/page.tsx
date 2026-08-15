'use client';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { motion } from 'motion/react';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getArchivedEvents } from '@/lib/db';

export default function ArchivePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const e = await getArchivedEvents(50);
      setEvents(e);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto px-6 max-w-7xl pb-24">
      <PageHeader title="Past Events" description="Explore the archives of our previous symposia, workshops, and galas." />
      
      <div className="flex flex-col gap-12">
        {loading && <div className="text-center p-8">Loading past events...</div>}
        {!loading && events.length === 0 && (
          <div className="text-center p-8">No past events found in the archives.</div>
        )}
        {events.map((event, idx) => {
          const title = event.title;
          const loc = event.location || 'TBA';
          const desc = event.descriptionMarkdown || '';
          const img = event.coverImageUrl || 'https://picsum.photos/seed/ev/800/450';
          const eventDate = event.eventDate ? new Date(event.eventDate) : new Date();
          const dStr = eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
          const tStr = event.time || 'TBA';

          return (
          <motion.div
            key={event.id || idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="glass-card overflow-hidden group flex flex-col md:flex-row opacity-80 hover:opacity-100 transition-opacity"
          >
            <div className="relative md:w-2/5 aspect-video md:aspect-auto h-64 md:h-auto overflow-hidden shrink-0 filter grayscale group-hover:grayscale-0 transition-all duration-700">
              <Image
                src={img}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
            </div>
            
            <div className="p-8 md:p-10 flex flex-col justify-center flex-grow">
              <div className="flex flex-wrap gap-4 text-sm font-bold text-primary-light/60 dark:text-primary/60 mb-4">
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {dStr}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {tStr}</div>
              </div>
              
              <h3 className="text-3xl font-bold mb-4">{title}</h3>
              
              <div className="flex items-center gap-2 text-primary-light/60 dark:text-primary/60 font-semibold mb-6">
                <MapPin className="w-5 h-5" /> {loc}
              </div>
              
              <p className="text-primary-light/80 dark:text-primary/80 text-lg leading-relaxed mb-8">
                {desc}
              </p>
              
              {event.facebookUrl && (
                <div className="mt-auto">
                   <a href={event.facebookUrl} target="_blank" rel="noreferrer" className="btn-secondary inline-flex">
                     View Event Gallery
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
