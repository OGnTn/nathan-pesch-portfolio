import React, { useState, useEffect } from 'react';
import { Project, PortfolioData } from '../types';
import { Mail, Code, Briefcase, ExternalLink, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface PortfolioProps {
  data: PortfolioData;
}

interface MediaItem {
  src: string;
  alt: string;
}

function LazyMedia({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isVideo = src.startsWith('data:video/') || Boolean(src.match(/\.(mp4|webm|ogg|mov)$/i));

  return (
    <div 
      onClick={onClick}
      className="group relative border border-[#1A1A1A] dark:border-[#F5F5F3] bg-[#E0E0DE] dark:bg-[#2A2A2A] break-inside-avoid mb-4 overflow-hidden min-h-[120px] cursor-pointer"
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#E0E0DE] dark:bg-[#2A2A2A] animate-pulse flex items-center justify-center text-[9px] uppercase tracking-[1px] opacity-40">
          Loading...
        </div>
      )}
      
      {/* Zoom hint overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center pointer-events-none">
        <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
      </div>

      {isVideo ? (
        <video 
          src={src} 
          controls={false}
          muted 
          playsInline
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          className={`w-full h-auto block transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : (
        <img 
          src={src} 
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-auto block transition-opacity duration-300 group-hover:scale-105 transition-transform duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
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
    <div className="max-w-5xl mx-auto px-6 pt-6 md:pt-10 pb-12 md:pb-24 space-y-16 print:py-0 print:space-y-8">
      {/* Hero Section */}
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 print:space-y-4"
      >
        <h1 className="text-5xl md:text-[72px] leading-[0.9] uppercase">
          {data.name}
        </h1>
        <div className="text-lg md:text-xl max-w-3xl leading-[1.5] font-serif italic opacity-80 prose dark:prose-invert">
          <Markdown>{data.bio}</Markdown>
        </div>
        
        <div className="flex flex-wrap gap-6 pt-4 print:pt-2">
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
      <main className="space-y-12 print:space-y-6">
        <h2 className="text-[12px] uppercase tracking-[2px] font-bold border-b border-[#1A1A1A] dark:border-[#F5F5F3] pb-4">
          Selected Projects
        </h2>
        
        <div className="grid grid-cols-1 gap-16 print:gap-12 mt-8">
          {data.projects.map((project, index) => (
            <motion.article 
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="break-inside-avoid print:mb-8"
            >
              <div className="space-y-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-3xl md:text-4xl uppercase">
                    {project.title}
                  </h3>
                  <div className="hidden md:block text-[48px] font-light leading-none opacity-20">
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
              className="relative max-w-5xl max-h-[90vh] flex items-center justify-center cursor-default overflow-hidden border border-white/20 shadow-2xl"
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
