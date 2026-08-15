'use client';
import { PageHeader } from '@/components/page-header';
import { motion } from 'motion/react';
import { Bell, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getNotices } from '@/lib/db';

export default function NoticePage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getNotices();
      setNotices(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="container mx-auto px-6 max-w-4xl pb-24">
      <PageHeader title="Notices & Announcements" noTopSpace />
      
      <div className="flex flex-col gap-4">
        {loading && <div className="text-center py-10">Loading notices...</div>}
        {!loading && notices.length === 0 && <div className="text-center py-10">No notices found.</div>}
        {notices.map((notice, idx) => {
          const dateStr = notice.noticeDate 
            ? new Date(notice.noticeDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
            : (notice.createdAt ? new Date(notice.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown Date');

          return (
          <motion.div
            key={notice.id || idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="glass rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
          >
            <div className="hidden md:flex shrink-0 w-16 h-16 rounded-full bg-info-light/10 text-info-light items-center justify-center">
              <Bell className="w-8 h-8" />
            </div>
            
            <div className="flex flex-col flex-grow">
              <div className="flex items-center gap-2 text-sm font-bold text-info-light mb-2">
                <Calendar className="w-4 h-4" /> {dateStr}
              </div>
              <h3 className="text-xl font-bold mb-3">{notice.title}</h3>
              <p className="text-primary-light/70 dark:text-primary/70 leading-relaxed">
                {notice.description}
              </p>
            </div>
          </motion.div>
        )})}
      </div>
    </div>
  );
}
