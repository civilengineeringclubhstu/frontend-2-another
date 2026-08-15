'use client';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { motion } from 'motion/react';
import { MapPin, Calendar, Clock, Ticket, CalendarPlus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUpcomingEvents, EventItem } from '@/lib/db';
import Markdown from 'react-markdown';

export default function UpcomingPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const e = await getUpcomingEvents(20);
        setEvents(e);
      } catch (err) {
        console.error('Error loading upcoming events:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl pb-24">
      <PageHeader 
        title="Upcoming Events" 
        description="Register and save your spot for upcoming seminars, workshops, contests, and gatherings." 
      />
      
      <div className="flex flex-col gap-10">
        {loading && (
          <div className="text-center py-16 text-primary-light/60 dark:text-primary/60 font-medium">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-info-light border-t-transparent rounded-full mb-3" />
            <p>Loading upcoming events...</p>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-16 glass-card max-w-xl mx-auto p-8 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-info-light/10 text-info-light flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Upcoming Events Scheduled</h3>
            <p className="text-sm text-primary-light/60 dark:text-primary/60">
              New workshops, seminars, and club events will be announced here soon.
            </p>
          </div>
        )}

        {events.map((event, idx) => {
          const title = event.title;
          const loc = event.location || 'HSTU Campus / TBA';
          const desc = event.descriptionMarkdown || event.description || '';
          const img = event.coverImageUrl || event.imageUrl || `https://picsum.photos/seed/event_${event.id || idx}/960/540`;
          const eventDate = event.eventDate ? new Date(event.eventDate) : new Date();
          const dStr = event.eventDate ? eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBA';
          const tStr = event.time || 'TBA';
          
          const startStr = event.eventDate ? event.eventDate.replace(/-/g, '') + 'T' + (event.time ? event.time.replace(/[^0-9]/g, '').padEnd(4, '0') + '00Z' : '090000Z') : '20261114T090000Z';
          const endStr = event.eventDate ? event.eventDate.replace(/-/g, '') + 'T' + '235900Z' : '20261114T170000Z';

          return (
            <motion.div
              key={event.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="glass-card overflow-hidden group flex flex-col md:flex-row items-stretch border border-white/20 hover:border-info-light/40 transition-colors"
            >
              {/* 16:9 Fixed Aspect Ratio Cover Image Container */}
              <div className="relative w-full md:w-[380px] lg:w-[440px] aspect-video shrink-0 overflow-hidden bg-slate-900">
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold bg-info-light text-white flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3" /> UPCOMING
                </span>
              </div>
              
              {/* Event Content & Details */}
              <div className="p-6 sm:p-8 md:p-9 flex flex-col justify-center flex-grow">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold text-info-light mb-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10">
                    <Calendar className="w-4 h-4" /> {dStr}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-primary-light/80 dark:text-primary/80">
                    <Clock className="w-4 h-4" /> {tStr}
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
                
                <div className="flex flex-wrap items-center gap-3 mt-auto pt-2">
                  {event.googleFormUrl && (
                    <button 
                      onClick={() => window.open(event.googleFormUrl, '_blank')} 
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      <Ticket className="w-4 h-4" /> Register Now
                    </button>
                  )}
                  <button 
                    className="btn-secondary flex items-center gap-2 text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const plainDesc = desc.replace(/<[^>]+>/g, '').replace(/[#*_`]/g, '');
                      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(plainDesc)}&location=${encodeURIComponent(loc)}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    title="Add to Google Calendar"
                  >
                    <CalendarPlus className="w-4 h-4 text-info-light" />
                    <span>Add to Calendar</span>
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
