import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PortfolioData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateStaticHTML(data: PortfolioData): string {
  const projectsHtml = data.projects.map(p => `
    <div class="project-card">
      <h3>${p.title}</h3>
      <div class="tags">
        ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <p class="description">${p.description}</p>
      ${p.images.length > 0 ? `
        <div class="images">
          ${p.images.map((mediaUrl, i) => {
            if (mediaUrl.startsWith('data:video/') || mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i)) {
              return `<video src="${mediaUrl}" controls preload="metadata" class="media-item"></video>`;
            }
            return `<img src="${mediaUrl}" alt="${p.title} media ${i + 1}" loading="lazy" decoding="async" class="media-item" />`;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.name} - Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: "Helvetica Neue", Arial, sans-serif; background-color: #F5F5F3; color: #1A1A1A; -webkit-font-smoothing: antialiased; }
    @media (prefers-color-scheme: dark) { body { background-color: #1A1A1A; color: #F5F5F3; } }
    .serif { font-family: "Georgia", serif; }
    h1, h2, h3, h4, h5, h6 { font-family: "Georgia", serif; font-weight: 400; }
    .project-card { border-bottom: 1px solid #1A1A1A; padding-bottom: 3rem; margin-bottom: 3rem; break-inside: avoid; }
    @media (prefers-color-scheme: dark) { .project-card { border-color: #F5F5F3; } }
    .project-card h3 { font-size: 2rem; margin-bottom: 1rem; text-transform: uppercase; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .tag { border: 1px solid #1A1A1A; padding: 0.25rem 0.5rem; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
    @media (prefers-color-scheme: dark) { .tag { border-color: #F5F5F3; } }
    .description { font-family: "Georgia", serif; font-style: italic; line-height: 1.5; font-size: 1.125rem; opacity: 0.9; margin-bottom: 1rem; white-space: pre-wrap; }
    .images { column-count: 2; column-gap: 1rem; margin-top: 1rem; }
    @media (min-width: 640px) { .images { column-count: 3; } }
    @media (min-width: 768px) { .images { column-count: 4; } }
    .media-item { width: 100%; height: auto; border: 1px solid #1A1A1A; background: #E0E0DE; display: block; break-inside: avoid; margin-bottom: 1rem; cursor: pointer; transition: transform 0.2s, opacity 0.2s; }
    .media-item:hover { opacity: 0.85; transform: scale(1.01); }
    @media (prefers-color-scheme: dark) { .media-item { border-color: #F5F5F3; background: #2A2A2A; } }
    .header-link { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; text-decoration: none; color: inherit; }
    .header-link:hover { text-decoration: underline; }
    .lightbox { display: none; position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,0.9); backdrop-filter: blur(8px); justify-content: center; align-items: center; padding: 2rem; cursor: zoom-out; }
    .lightbox.active { display: flex; }
    .lightbox-content { max-width: 90vw; max-height: 90vh; border: 1px solid rgba(255,255,255,0.2); object-fit: contain; cursor: default; }
    .lightbox-close { position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.1); color: white; border: none; font-size: 1.5rem; width: 3rem; height: 3rem; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  </style>
</head>
<body>
  <div class="max-w-4xl mx-auto px-6 py-12 md:py-24">
    <header style="margin-bottom: 4rem; padding-bottom: 2rem;">
      <h1 style="font-size: 4rem; line-height: 0.9; text-transform: uppercase; margin-bottom: 1rem;">${data.name}</h1>
      <p class="description" style="max-width: 48rem;">${data.bio}</p>
      <div style="display: flex; gap: 1.5rem; margin-top: 2rem;">
        ${data.email ? `<a href="mailto:${data.email}" class="header-link">Email</a>` : ''}
        ${data.github ? `<a href="${data.github}" class="header-link">GitHub</a>` : ''}
        ${data.linkedin ? `<a href="${data.linkedin}" class="header-link">LinkedIn</a>` : ''}
        ${(data.cv || './nathan_pesch_cv_2026.pdf') ? `<a href="${data.cv || './nathan_pesch_cv_2026.pdf'}" download="nathan_pesch_cv_2026.pdf" class="header-link">Download CV</a>` : ''}
      </div>
    </header>
    <main>
      <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: bold; border-bottom: 1px solid currentColor; padding-bottom: 1rem; margin-bottom: 2rem;">Selected Projects</h2>
      ${projectsHtml}
    </main>
    <footer style="margin-top: 4rem; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.6;">
      Generated by PORTFOLIO.SYS
    </footer>
  </div>

  <div id="lightbox" class="lightbox" onclick="closeLightbox()">
    <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
    <div id="lightbox-container" onclick="event.stopPropagation()"></div>
  </div>

  <script>
    function openLightbox(element) {
      const lightbox = document.getElementById('lightbox');
      const container = document.getElementById('lightbox-container');
      container.innerHTML = '';
      if (element.tagName === 'VIDEO') {
        const vid = document.createElement('video');
        vid.src = element.src;
        vid.controls = true;
        vid.autoplay = true;
        vid.className = 'lightbox-content';
        container.appendChild(vid);
      } else {
        const img = document.createElement('img');
        img.src = element.src;
        img.alt = element.alt;
        img.className = 'lightbox-content';
        container.appendChild(img);
      }
      lightbox.classList.add('active');
    }
    function closeLightbox() {
      const lightbox = document.getElementById('lightbox');
      const container = document.getElementById('lightbox-container');
      container.innerHTML = '';
      lightbox.classList.remove('active');
    }
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.media-item').forEach(el => {
        el.addEventListener('click', () => openLightbox(el));
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  </script>
</body>
</html>`;
}

export function downloadFile(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
