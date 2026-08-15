'use client';
import { PageHeader } from '@/components/page-header';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getBlogById } from '@/lib/db';
import { ChevronLeft, Calendar } from 'lucide-react';
import Markdown from 'react-markdown';

export default function BlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (typeof id === 'string') {
        const data = await getBlogById(id);
        setPost(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto px-6 pt-32 pb-24 text-center">Loading post...</div>;
  }

  if (!post) {
    return (
      <div className="container mx-auto px-6 pt-32 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Post not found</h2>
        <button onClick={() => router.back()} className="btn-secondary">Go Back</button>
      </div>
    );
  }

  const dStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';

  return (
    <div className="container mx-auto px-6 max-w-4xl pt-32 pb-24">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-primary-light/60 hover:text-primary-light dark:text-primary/60 dark:hover:text-primary transition-colors mb-8 font-semibold"
      >
        <ChevronLeft className="w-5 h-5" /> Back to Blogs
      </button>

      <div className="flex items-center gap-2 text-info-light font-bold mb-6">
        <Calendar className="w-4 h-4" />
        {dStr}
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{post.title}</h1>

            <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl">
        <Image
          src={post.imageUrl || post.coverImageUrl || `https://picsum.photos/seed/${post.id}/1200/600`}
          alt={post.title}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="markdown-body prose prose-lg dark:prose-invert max-w-none prose-a:text-info-light">
        <Markdown>{post.contentMarkdown || post.description || post.content || ''}</Markdown>
      </div>
    </div>
  );
}
