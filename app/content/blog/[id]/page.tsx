'use client';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getBlogById, BlogPost } from '@/lib/db';
import { ChevronLeft, Calendar, Clock, User, Tag, Share2, Check } from 'lucide-react';
import Markdown from 'react-markdown';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      if (typeof id === 'string') {
        try {
          const data = await getBlogById(id);
          setPost(data);
        } catch (err) {
          console.error('Error fetching blog post:', err);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 pt-36 pb-24 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-info-light border-t-transparent rounded-full mb-3" />
        <p className="text-primary-light/60 dark:text-primary/60 font-medium">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-6 pt-36 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Post Not Found</h2>
        <p className="text-primary-light/60 dark:text-primary/60 mb-6 max-w-md mx-auto">
          The requested article may have been unpublished, moved, or the link is incorrect.
        </p>
        <button onClick={() => router.push('/content/blog')} className="btn-secondary">
          Back to Blog List
        </button>
      </div>
    );
  }

  const dStr = post.createdAt 
    ? new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
    : 'Recent Publication';

  const postImage = post.coverImageUrl || post.imageUrl || `https://picsum.photos/seed/${post.id}/1200/600`;
  const postContent = post.contentMarkdown || post.bodyRichText || post.description || post.content || '';

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl pt-32 pb-24">
      <div className="flex items-center justify-between gap-4 mb-8">
        <button 
          onClick={() => router.push('/content/blog')} 
          className="inline-flex items-center gap-2 text-primary-light/70 hover:text-info-light dark:text-primary/70 dark:hover:text-info-light transition-colors font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to All Stories
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass text-xs font-semibold hover:border-info-light/50 transition-colors"
          title="Copy link to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-info-light mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{dStr}</span>
        </span>

        {post.author && (
          <span className="flex items-center gap-1.5 text-primary-light/70 dark:text-primary/70">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </span>
        )}

        {post.readTimeMinutes && (
          <span className="flex items-center gap-1.5 text-primary-light/60 dark:text-primary/60">
            <Clock className="w-4 h-4" />
            <span>{post.readTimeMinutes} min read</span>
          </span>
        )}
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 leading-[1.2] text-primary-light dark:text-primary">
        {post.title}
      </h1>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag, tIdx) => (
            <span 
              key={tIdx} 
              className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-info-light font-medium flex items-center gap-1"
            >
              <Tag className="w-3 h-3" /> {tag}
            </span>
          ))}
        </div>
      )}

      <div className="relative w-full aspect-video rounded-[28px] overflow-hidden mb-12 shadow-2xl bg-slate-900 border border-white/20">
        <Image
          src={postImage}
          alt={post.title}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
          priority
        />
      </div>

      <div className="markdown-body prose prose-lg dark:prose-invert max-w-none prose-a:text-info-light leading-relaxed">
        <Markdown>{postContent}</Markdown>
      </div>
    </div>
  );
}

