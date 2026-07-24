import React, { useState, useEffect } from 'react';
import { PortfolioData } from '../types';
import { X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface PortfolioProps {
  data: PortfolioData;
}

interface MediaItem {
  src: string;
  alt: string;
}

// Marathon Terminal Text Scramble Effect
function ScrambleText({ text, className = "" }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789//[]_';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '\n') return char;
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, 25);

    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayText}</span>;
}

function LazyMedia({ src, alt, onClick, index }: { src: string; alt: string; onClick: () => void; index: number }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isVideo = src.startsWith('data:video/') || Boolean(src.match(/\.(mp4|webm|ogg|mov)$/i));

  return (
    <div 
      onClick={onClick}
      className={`group relative border border-[#1A1A1A] dark:border-[#F5F5F3] break-inside-avoid mb-4 overflow-hidden cursor-pointer transition-colors ${
        isLoaded ? 'bg-transparent' : 'bg-[#E0E0DE] dark:bg-[#2A2A2A] min-h-[120px]'
      }`}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#E0E0DE] dark:bg-[#2A2A2A] animate-pulse flex items-center justify-center text-[9px] font-mono uppercase tracking-[1px] opacity-40 min-h-[120px]">
          Loading...
        </div>
      )}
      
      {/* Marathon HUD Reticles / Corner Brackets */}
      <div className="absolute top-1.5 left-1.5 text-[10px] font-mono leading-none opacity-0 group-hover:opacity-100 transition-opacity z-20 text-lime-600 dark:text-[#D8FF00] font-bold pointer-events-none select-none">
        +
      </div>
      <div className="absolute top-1.5 right-1.5 text-[10px] font-mono leading-none opacity-0 group-hover:opacity-100 transition-opacity z-20 text-lime-600 dark:text-[#D8FF00] font-bold pointer-events-none select-none">
        +
      </div>
      <div className="absolute bottom-1.5 left-1.5 text-[10px] font-mono leading-none opacity-0 group-hover:opacity-100 transition-opacity z-20 text-lime-600 dark:text-[#D8FF00] font-bold pointer-events-none select-none">
        +
      </div>
      <div className="absolute bottom-1.5 right-1.5 text-[10px] font-mono leading-none opacity-0 group-hover:opacity-100 transition-opacity z-20 text-lime-600 dark:text-[#D8FF00] font-bold pointer-events-none select-none">
        +
      </div>

      {/* Marathon Zoom / Targeting HUD Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center pointer-events-none p-2 text-center space-y-1">
        <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
        <span className="text-[8px] font-mono uppercase tracking-[2px] text-lime-400 dark:text-[#D8FF00] font-bold">
          [SCAN_LOCK // MEDIA_{index + 1}]
        </span>
      </div>

      {isVideo ? (
        <video 
          src={src} 
          controls={false}
          muted 
          playsInline
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          className={`w-full h-auto block object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : (
        <img 
          src={src} 
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-auto block object-cover transition-opacity duration-300 group-hover:scale-105 transition-transform duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}

export default function Portfolio({ data }: PortfolioProps) {
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMedia(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-6 md:pt-12 pb-16 md:pb-24 print:py-0">
      {/* Subtle Telemetry Indicator */}
      <div className="flex items-center justify-between gap-2 text-[9px] font-mono opacity-50 tracking-[1.5px] uppercase mb-8 print:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-lime-500 dark:bg-[#D8FF00] rounded-full animate-pulse"></span>
          <span>SYS.ONLINE // BRUSSELS, BE</span>
        </div>
        <div className="hidden sm:block text-right">
          LAT 50.8503° N // LON 4.3517° E
        </div>
      </div>

      {/* Hero Section */}
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 print:space-y-4"
      >
        <h1 className="text-5xl md:text-[72px] leading-[0.9] uppercase font-bold tracking-tight">
          <ScrambleText text={data.name} />
        </h1>
        <div className="text-lg md:text-xl max-w-3xl leading-[1.5] font-serif italic opacity-80 prose dark:prose-invert">
          <Markdown>{data.bio}</Markdown>
        </div>
        
        <div className="flex flex-wrap gap-6 pt-2 print:pt-2">
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] font-bold hover:underline">
              <span>Email</span>
            </a>
          )}
          {data.github && (
            <a href={data.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] font-bold hover:underline">
              <span>GitHub</span>
            </a>
          )}
          {data.linkedin && (
            <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] uppercase tracking-[2px] font-bold hover:underline">
              <span>LinkedIn</span>
            </a>
          )}
        </div>
      </motion.header>

      {/* Projects Section */}
      <main className="mt-16 md:mt-20 print:space-y-6">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] dark:border-[#F5F5F3] pb-3 mb-10">
          <h2 className="text-[12px] uppercase tracking-[2px] font-bold">
            <ScrambleText text="Selected Projects" />
          </h2>
          <div className="text-[10px] font-mono opacity-40 tracking-[1px] hidden sm:block">
            {(data.projects.length).toString().padStart(2, '0')} RECORDS
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-14 md:gap-16 print:gap-12">
          {data.projects.map((project, index) => (
            <motion.article 
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="break-inside-avoid print:mb-8 space-y-5"
            >
              <div className="space-y-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-3xl md:text-4xl uppercase font-bold tracking-tight">
                    <ScrambleText text={project.title} />
                  </h3>
                  <div className="hidden md:block text-[32px] font-light leading-none opacity-20">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-1 border border-[#1A1A1A] dark:border-[#F5F5F3] text-[10px] uppercase tracking-[1px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="text-lg leading-[1.5] font-serif italic opacity-90 max-w-3xl prose dark:prose-invert">
                  <Markdown>{project.description}</Markdown>
                </div>

                {project.images.length > 0 && (
                  <div className="columns-2 sm:columns-3 md:columns-4 gap-4 pt-4 print:hidden">
                    {project.images.map((mediaUrl, i) => (
                      <LazyMedia 
                        key={i} 
                        index={i}
                        src={mediaUrl} 
                        alt={`${project.title} media ${i + 1}`} 
                        onClick={() => setActiveMedia({ src: mediaUrl, alt: `${project.title} media ${i + 1}` })}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.article>
          ))}
          {data.projects.length === 0 && (
            <p className="text-[10px] uppercase tracking-[1px] opacity-60">No projects added yet.</p>
          )}
        </div>
      </main>

      {/* Enlarged Media Modal / Lightbox */}
      <AnimatePresence>
        {activeMedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveMedia(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 cursor-zoom-out print:hidden"
          >
            <button 
              onClick={() => setActiveMedia(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
              title="Close (Esc)"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] flex items-center justify-center cursor-default overflow-hidden border border-[#D8FF00]/50 shadow-2xl"
            >
              {activeMedia.src.startsWith('data:video/') || activeMedia.src.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video 
                  src={activeMedia.src} 
                  controls 
                  autoPlay 
                  className="max-w-full max-h-[85vh] block object-contain bg-black"
                />
              ) : (
                <img 
                  src={activeMedia.src} 
                  alt={activeMedia.alt} 
                  className="max-w-full max-h-[85vh] block object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
