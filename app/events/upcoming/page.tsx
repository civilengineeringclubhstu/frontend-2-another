'use client';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { motion } from 'motion/react';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUpcomingEvents } from '@/lib/db';

export default function UpcomingPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const e = await getUpcomingEvents(20);
      setEvents(e);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto px-6 max-w-7xl pb-24">
      <PageHeader title="Upcoming Events" description="Register and save your spot for our next big things." />
      
      <div className="flex flex-col gap-12">
        {loading && <div className="text-center p-8">Loading upcoming events...</div>}
        {!loading && events.length === 0 && (
          <div className="text-center p-8">No upcoming events scheduled at the moment.</div>
        )}
        {events.map((event, idx) => {
          const title = event.title;
          const loc = event.location || 'TBA';
          const desc = event.descriptionMarkdown || '';
          const img = event.coverImageUrl || 'https://picsum.photos/seed/ev/800/450';
          const eventDate = event.eventDate ? new Date(event.eventDate) : new Date();
          const dStr = eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
          const tStr = event.time || 'TBA';
          
          const startStr = event.eventDate ? event.eventDate.replace(/-/g, '') + 'T' + (event.time ? event.time.replace(':', '') + '00Z' : '090000Z') : '20261114T090000Z';
          const endStr = event.eventDate ? event.eventDate.replace(/-/g, '') + 'T' + '235900Z' : '20261114T170000Z';

          return (
          <motion.div
            key={event.id || idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="glass-card overflow-hidden group flex flex-col md:flex-row"
          >
            <div className="relative md:w-2/5 aspect-video md:aspect-auto h-64 md:h-auto overflow-hidden shrink-0">
              <Image
                src={img}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            </div>
            
            <div className="p-8 md:p-10 flex flex-col justify-center flex-grow">
              <div className="flex flex-wrap gap-4 text-sm font-bold text-info-light mb-4">
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
              
              <div className="flex flex-wrap gap-4 mt-auto">
                {event.googleFormUrl && (
                  <button onClick={() => window.open(event.googleFormUrl, '_blank')} className="btn-primary">
                    <Ticket className="w-5 h-5 mr-2" /> Register Now
                  </button>
                )}
                <button 
                  className="btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(loc)}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  title="Add to Google Calendar"
                >
                  Add to Calendar
                </button>
              </div>
            </div>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
}
