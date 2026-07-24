import React from 'react';
import { Project, PortfolioData } from '../types';
import { Mail, Code, Briefcase, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';

interface PortfolioProps {
  data: PortfolioData;
}

export default function Portfolio({ data }: PortfolioProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 space-y-16 print:py-0 print:space-y-8">
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
              className="group break-inside-avoid print:mb-8"
            >
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                  <h3 className="text-3xl md:text-4xl uppercase">
                    {project.title}
                  </h3>
                  <div className="text-[48px] font-light leading-none opacity-20">
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
                      <div key={i} className="relative border border-[#1A1A1A] dark:border-[#F5F5F3] bg-[#E0E0DE] dark:bg-[#2A2A2A] break-inside-avoid mb-4">
                        {mediaUrl.startsWith('data:video/') || mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                          <video 
                            src={mediaUrl} 
                            controls 
                            className="w-full h-auto block"
                          />
                        ) : (
                          <img 
                            src={mediaUrl} 
                            alt={`${project.title} media ${i + 1}`}
                            className="w-full h-auto block"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
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
    </div>
  );
}
