'use client';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Tag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAllBlogs, BlogPost } from '@/lib/db';
import Markdown from 'react-markdown';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const b = await getAllBlogs();
        setBlogs(b);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl pb-24">
      <PageHeader 
        title="Our Blog & Stories" 
        description="Thoughts, civil engineering updates, insights, and stories from the Civil Engineering Club, HSTU." 
      />
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && (
          <div className="col-span-full py-16 text-center text-primary-light/60 dark:text-primary/60 font-medium">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-info-light border-t-transparent rounded-full mb-3" />
            <p>Loading latest articles and publications...</p>
          </div>
        )}
        {!loading && blogs.length === 0 && (
          <div className="col-span-full text-center py-16 glass-card max-w-xl mx-auto p-8 rounded-3xl">
            <p className="text-xl font-bold mb-2">No blogs published yet</p>
            <p className="text-sm text-primary-light/60 dark:text-primary/60">
              Articles published from your admin portal will appear here in real-time.
            </p>
          </div>
        )}
        {blogs.map((post, idx) => {
          const img = post.coverImageUrl || post.imageUrl || `https://picsum.photos/seed/blog_${post.id || idx}/800/500`;
          const title = post.title;
          const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent';
          const excerptSource = post.excerpt || post.contentMarkdown || post.description || post.content || '';
          const targetId = post.slug || post.id;

          return (
            <motion.article
              key={post.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="glass-card group flex flex-col h-full overflow-hidden hover:border-info-light/40 transition-colors"
            >
              <div className="relative h-[220px] w-full overflow-hidden bg-slate-900">
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                
                {post.readTimeMinutes && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTimeMinutes} min read
                  </span>
                )}
              </div>
              
              <div className="p-6 sm:p-7 flex flex-col flex-grow">
                <div className="flex flex-wrap items-center gap-3 text-xs text-info-light font-semibold mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{date}</span>
                  </span>
                  {post.author && (
                    <span className="flex items-center gap-1 text-primary-light/60 dark:text-primary/60">
                      <User className="w-3.5 h-3.5" /> {post.author}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-3 group-hover:text-info-light transition-colors line-clamp-2 leading-snug">
                  {title}
                </h3>
                
                <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-primary-light/70 dark:text-primary/70 mb-5 line-clamp-3 flex-grow text-sm">
                  <Markdown>{excerptSource}</Markdown>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.slice(0, 3).map((tag, tIdx) => (
                      <span key={tIdx} className="text-[11px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-primary-light/80 dark:text-primary/80 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 opacity-60" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <Link 
                  href={`/content/blog/${targetId}`} 
                  className="inline-flex items-center font-bold text-sm text-info-light hover:underline transition-colors mt-auto pt-2"
                >
                  Read Full Article <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

