'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2, RefreshCw, Sparkles, MessageCircleQuestion } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const ASSISTANT_NAME = 'Engr. Kuchu Puchu';
const GREETING_TEXT =
  'হাই! আমি **Engr. Kuchu Puchu** 🤖\n\nHSTU Civil Engineering Club এর তথ্য ও সহায়তায় আছি। নিচের বিষয়গুলোতে সাহায্য করতে পারি:\n- 📋 ক্লাবের মেম্বারশিপ ও নিয়মকানুন\n- 🏗️ সিভিল ইঞ্জিনিয়ারিং একাডেমিক তথ্য\n- 🎓 ইভেন্ট, ওয়ার্কশপ ও নোটিশ\n\nকীভাবে সাহায্য করতে পারি?';

const QUICK_SUGGESTIONS = [
  'ওয়েবসাইট কে তৈরি করেছে?',
  'মেম্বারশিপ কীভাবে নেওয়া যায়?',
  'সিভিল ক্লাব কী কী কাজ করে?',
];

// Beautiful high-fidelity SVG Robot matching user reference
function RobotAvatar({ isWaving = false, size = 'md' }: { isWaving?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  if (isSmall) {
    return (
      <div className="relative w-10 h-10 flex items-center justify-center select-none shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
          {/* Head White Shell */}
          <rect x="18" y="16" width="64" height="46" rx="23" fill="url(#botSmallWhite)" stroke="#CBD5E1" strokeWidth="2" />
          {/* Ears */}
          <rect x="12" y="28" width="8" height="22" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="80" y="28" width="8" height="22" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Dark Glass Visor */}
          <rect x="26" y="22" width="48" height="34" rx="15" fill="#0B132B" />
          {/* Visor Glare */}
          <path d="M 28 30 Q 50 24 72 30" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" fill="none" />
          {/* Cyan Glow Eyes */}
          <path d="M 35 38 Q 41 31 47 38" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 53 38 Q 59 31 65 38" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Smile */}
          <path d="M 45 47 Q 50 51 55 47" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Body */}
          <path d="M 34 64 Q 50 63 66 64 C 66 75 59 86 50 86 C 41 86 34 75 34 64 Z" fill="url(#botSmallWhite)" stroke="#CBD5E1" strokeWidth="2" />
          <defs>
            <linearGradient id="botSmallWhite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Large Interactive Robot
  return (
    <div className={`relative ${isLarge ? 'w-48 h-52' : 'w-28 h-32'} flex items-center justify-center select-none`}>
      {/* Floating Shadow */}
      <motion.div
        className="absolute bottom-1 w-28 h-4 rounded-full bg-slate-400/20 dark:bg-black/40 blur-sm"
        animate={{ scale: [1, 0.85, 1], opacity: [0.35, 0.2, 0.35] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating Robot Body */}
      <motion.div
        className="relative w-full h-full flex flex-col items-center justify-start"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 200 210" className="w-full h-full overflow-visible drop-shadow-2xl">
          <defs>
            <linearGradient id="shellWhite" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F8FAFC" />
              <stop offset="85%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            <linearGradient id="torsoWhite" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#F1F5F9" />
              <stop offset="85%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            <linearGradient id="earPodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            <linearGradient id="darkVisorGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="60%" stopColor="#1C2541" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <filter id="cyanGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Left Ear */}
          <rect x="22" y="44" width="16" height="42" rx="8" fill="url(#earPodGrad)" stroke="#CBD5E1" strokeWidth="2" />
          {/* Right Ear */}
          <rect x="162" y="44" width="16" height="42" rx="8" fill="url(#earPodGrad)" stroke="#CBD5E1" strokeWidth="2" />

          {/* Left Arm */}
          <path
            d="M 52 108 C 30 115 24 135 32 155 C 38 168 50 162 50 150 C 44 138 48 124 58 116 Z"
            fill="url(#shellWhite)"
            stroke="#CBD5E1"
            strokeWidth="2.5"
          />

          {/* Right Arm (Waving) */}
          <g>
            {isWaving ? (
              <motion.g
                style={{ originX: '148px', originY: '110px' }}
                animate={{ rotate: [0, 26, -14, 26, -8, 18, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.4, ease: 'easeInOut' }}
              >
                {/* Arm raised up to wave */}
                <path
                  d="M 148 110 C 168 100 178 84 172 65 C 166 54 154 58 152 70 C 154 84 148 96 140 104 Z"
                  fill="url(#shellWhite)"
                  stroke="#CBD5E1"
                  strokeWidth="2.5"
                />
                {/* Hand Palm */}
                <circle cx="166" cy="60" r="10" fill="url(#shellWhite)" stroke="#CBD5E1" strokeWidth="2" />
              </motion.g>
            ) : (
              <path
                d="M 148 108 C 170 115 176 135 168 155 C 162 168 150 162 150 150 C 156 138 152 124 142 116 Z"
                fill="url(#shellWhite)"
                stroke="#CBD5E1"
                strokeWidth="2.5"
              />
            )}
          </g>

          {/* Body */}
          <g>
            <path
              d="M 62 102 C 90 98 110 98 138 102 C 146 126 132 170 100 170 C 68 170 54 126 62 102 Z"
              fill="url(#torsoWhite)"
              stroke="#CBD5E1"
              strokeWidth="3"
            />
            <ellipse cx="78" cy="116" rx="14" ry="20" fill="#FFFFFF" opacity="0.6" transform="rotate(-15 78 116)" />
            <path d="M 68 134 Q 100 137 132 134" stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 86 135 L 86 146 Q 100 148 114 146 L 114 135" stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>

          {/* Neck */}
          <rect x="86" y="90" width="28" height="14" rx="6" fill="#94A3B8" />

          {/* Head Shell */}
          <g>
            <rect
              x="34"
              y="18"
              width="132"
              height="88"
              rx="44"
              fill="url(#shellWhite)"
              stroke="#CBD5E1"
              strokeWidth="3"
            />
            {/* Specular Highlight */}
            <path d="M 58 26 Q 100 20 142 26" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />

            {/* Dark Visor */}
            <rect x="48" y="32" width="104" height="62" rx="28" fill="url(#darkVisorGrad)" stroke="#1E293B" strokeWidth="2" />
            
            {/* Visor Glare */}
            <path d="M 52 46 C 70 36 130 36 148 46 C 144 54 130 44 100 44 C 70 44 56 54 52 46 Z" fill="#FFFFFF" opacity="0.2" />

            {/* Cyan Eyes (Happy Winks) */}
            <g filter="url(#cyanGlowEffect)">
              <path d="M 68 58 Q 78 48 88 58" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 70 60 Q 78 52 86 60" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              <path d="M 112 58 Q 122 48 132 58" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 114 60 Q 122 52 130 60" stroke="#E0F2FE" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Cyan Mouth */}
              <path d="M 94 72 Q 100 78 106 72" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 95 72 Q 100 76 105 72" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          </g>
        </svg>
      </motion.div>
    </div>
  );
}

function MessageBubble({ text, isUser }: { text: string; isUser: boolean }) {
  if (isUser) {
    return <span className="whitespace-pre-line">{text}</span>;
  }
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:my-0.5 [&_a]:text-blue-500 [&_a]:underline font-normal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-blue-500 hover:text-blue-600 underline font-medium"
            />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export function FaqAiBubble() {
  const [showIntroOverlay, setShowIntroOverlay] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const introTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (introTimer.current) clearTimeout(introTimer.current);
    };
  }, []);

  function handleBubbleClick() {
    if (hasIntroduced) {
      setOpen(true);
      return;
    }

    // Fast, crisp 1.2s Greeting Overlay
    setShowIntroOverlay(true);
    introTimer.current = setTimeout(() => {
      setShowIntroOverlay(false);
      setHasIntroduced(true);
      setMessages([{ role: 'assistant', text: GREETING_TEXT }]);
      setOpen(true);
    }, 1200);
  }

  function skipIntro() {
    if (introTimer.current) clearTimeout(introTimer.current);
    setShowIntroOverlay(false);
    setHasIntroduced(true);
    setMessages([{ role: 'assistant', text: GREETING_TEXT }]);
    setOpen(true);
  }

  async function sendMessage(textToSend?: string) {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => ({}));
      const reply = data.reply || data.error || 'দুঃখিত, উত্তর দিতে পারলাম না।';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'নেটওয়ার্ক সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleClearChat = () => {
    setMessages([{ role: 'assistant', text: GREETING_TEXT }]);
  };

  return (
    <>
      {/* Eye-Catching Fullscreen Intro Overlay (Fast 1.2s or Click to Skip) */}
      <AnimatePresence>
        {showIntroOverlay && (
          <motion.div
            id="faq-ai-intro-overlay"
            onClick={skipIntro}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="relative rounded-[32px] p-8 flex flex-col items-center text-center max-w-sm w-full mx-auto bg-gradient-to-b from-white/95 to-slate-100/90 dark:from-slate-900/95 dark:to-slate-950/90 border border-white/60 dark:border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-xl"
              initial={{ scale: 0.6, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Bot Avatar */}
              <div className="mb-2">
                <RobotAvatar size="lg" isWaving={true} />
              </div>

              {/* Tag */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300 font-semibold text-xs mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>👋 হ্যালো ফ্রেন্ড!</span>
              </div>

              <h2 className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
                আমি {ASSISTANT_NAME}
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                সিভিল ইঞ্জিনিয়ারিং ক্লাবের তথ্য ও সহায়তায় আছি!
              </p>

              <button
                onClick={skipIntro}
                className="mt-5 px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                কথা বলো
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Eye-Catching Bubble Trigger */}
      <motion.button
        id="faq-ai-bubble-trigger"
        onClick={handleBubbleClick}
        className="fixed bottom-6 right-6 z-50 p-2 rounded-full flex items-center gap-2.5 shadow-[0_10px_35px_rgba(37,99,235,0.25)] border-2 border-white/80 dark:border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:shadow-[0_15px_45px_rgba(37,99,235,0.35)] transition-all cursor-pointer group select-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: open || showIntroOverlay ? 0 : 1,
          opacity: open || showIntroOverlay ? 0 : 1,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Open ${ASSISTANT_NAME} assistant`}
      >
        <RobotAvatar size="sm" isWaving={true} />
        <div className="hidden sm:flex flex-col text-left pr-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight flex items-center gap-1">
            {ASSISTANT_NAME}
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          </span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
            Ask AI Assistant
          </span>
        </div>
      </motion.button>

      {/* Beautiful, High-Performance Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="faq-ai-chat-panel"
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] max-w-sm sm:max-w-md h-[78vh] max-h-[600px] rounded-[28px] flex flex-col overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.25)] border border-white/50 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl"
            style={{ transformOrigin: 'bottom right' }}
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <RobotAvatar size="sm" isWaving={false} />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                    {ASSISTANT_NAME}
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-[10px] font-semibold text-blue-600 dark:text-blue-400">AI</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    CE Club HSTU Official Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleClearChat}
                    title="Clear chat"
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    aria-label="Clear chat"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-slate-800 dark:text-slate-100">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start items-start gap-2'}
                >
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center shrink-0 border border-sky-300/40 mt-0.5">
                      <RobotAvatar size="sm" isWaving={false} />
                    </div>
                  )}
                  <div
                    className={
                      'max-w-[85%] px-4 py-3 rounded-[20px] text-xs sm:text-sm leading-relaxed ' +
                      (m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs shadow-md shadow-blue-500/20'
                        : 'bg-slate-100/90 dark:bg-slate-800/90 rounded-bl-xs border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100')
                    }
                  >
                    <MessageBubble text={m.text} isUser={m.role === 'user'} />
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center shrink-0 border border-sky-300/40">
                    <RobotAvatar size="sm" isWaving={false} />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-[18px] rounded-bl-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  </div>
                </motion.div>
              )}

              {/* Quick suggestions if 1 message */}
              {messages.length === 1 && (
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1">
                    <MessageCircleQuestion className="w-3.5 h-3.5" />
                    সাজেস্টেড প্রশ্নসমূহ:
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_SUGGESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(q)}
                        className="text-left text-xs px-3.5 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/50 dark:border-slate-700/50 transition-all active:scale-[0.98]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3.5 border-t border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="যেকোনো প্রশ্ন লিখুন..."
                maxLength={500}
                className="flex-1 bg-white dark:bg-slate-800/90 border border-slate-300/70 dark:border-slate-700/70 rounded-full px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-inner"
              />
              <motion.button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                whileTap={{ scale: 0.92 }}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 cursor-pointer"
                aria-label="Send"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
