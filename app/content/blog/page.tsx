'use client';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAllBlogs } from '@/lib/db';
import Markdown from 'react-markdown';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      const b = await getAllBlogs();
      setBlogs(b);
      setLoading(false);
    }
    fetchBlogs();
  }, []);

  return (
    <div className="container mx-auto px-6 max-w-7xl pb-24">
      <PageHeader title="Our Blog" description="Thoughts, stories, and insights from our community." />
      
      <div className="grid md:grid-cols-2 gap-8">
        {loading && <div className="col-span-full text-center p-8">Loading blogs...</div>}
        {!loading && blogs.length === 0 && (
          <div className="col-span-full text-center p-8">No blogs available yet.</div>
        )}
        {blogs.map((post, idx) => {
          const img = post.imageUrl || post.coverImageUrl || `https://picsum.photos/seed/b${idx}/800/500`;
          const title = post.title;
          const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown Date';
          const excerptSource = post.contentMarkdown || post.description || post.content || '';

          return (
          <motion.article
            key={post.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="glass-card group flex flex-col h-full overflow-hidden"
          >
            <div className="relative h-[250px] w-full overflow-hidden">
              <Image
                src={img}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>
            
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex items-center gap-2 text-info-light font-semibold text-sm mb-3">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 group-hover:text-info-light transition-colors line-clamp-2">
                {title}
              </h3>
              
              <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-primary-light/70 dark:text-primary/70 mb-6 line-clamp-3 flex-grow">
                <Markdown>{excerptSource}</Markdown>
              </div>
              
              <Link href={`/content/blog/${post.id}`} className="inline-flex items-center font-bold text-sm hover:text-info-light transition-colors mt-auto">
                Read Article <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </motion.article>
          );
        })}
      </div>
    </div>
  );
}
