import React, { useState, useRef } from 'react';
import { PortfolioData, Project } from '../types';
import { Reorder } from 'motion/react';
import { GripVertical, Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '../utils';

interface DashboardProps {
  data: PortfolioData;
  setData: (data: PortfolioData) => void;
}

export default function Dashboard({ data, setData }: DashboardProps) {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const handleUpdateProfile = (field: keyof PortfolioData, value: string) => {
    setData({ ...data, [field]: value });
  };

  const handleReorder = (newProjects: Project[]) => {
    setData({ ...data, projects: newProjects });
  };

  const addProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: 'New Project',
      description: 'Describe your project here...',
      images: [],
      tags: ['React']
    };
    setData({ ...data, projects: [newProject, ...data.projects] });
    setEditingProjectId(newProject.id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setData({
      ...data,
      projects: data.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  };

  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setData({
        ...data,
        projects: data.projects.filter(p => p.id !== id)
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <div className="space-y-6">
        <h2 className="text-[12px] uppercase tracking-[2px] font-bold border-b border-[#1A1A1A] dark:border-[#F5F5F3] pb-4">Profile Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border border-[#1A1A1A] dark:border-[#F5F5F3] p-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[1px] font-bold block mb-2">Name</label>
            <input 
              type="text" 
              value={data.name} 
              onChange={e => handleUpdateProfile('name', e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#1A1A1A] dark:border-[#F5F5F3] bg-transparent focus:bg-[#EAEAEA] dark:focus:bg-[#2A2A2A] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[1px] font-bold block mb-2">Email</label>
            <input 
              type="email" 
              value={data.email} 
              onChange={e => handleUpdateProfile('email', e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#1A1A1A] dark:border-[#F5F5F3] bg-transparent focus:bg-[#EAEAEA] dark:focus:bg-[#2A2A2A] outline-none transition-all"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] uppercase tracking-[1px] font-bold block mb-2">Bio</label>
            <textarea 
              value={data.bio} 
              onChange={e => handleUpdateProfile('bio', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-none border border-[#1A1A1A] dark:border-[#F5F5F3] bg-transparent focus:bg-[#EAEAEA] dark:focus:bg-[#2A2A2A] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[1px] font-bold block mb-2">GitHub URL</label>
            <input 
              type="url" 
              value={data.github} 
              onChange={e => handleUpdateProfile('github', e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#1A1A1A] dark:border-[#F5F5F3] bg-transparent focus:bg-[#EAEAEA] dark:focus:bg-[#2A2A2A] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[1px] font-bold block mb-2">LinkedIn URL</label>
            <input 
              type="url" 
              value={data.linkedin} 
              onChange={e => handleUpdateProfile('linkedin', e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-[#1A1A1A] dark:border-[#F5F5F3] bg-transparent focus:bg-[#EAEAEA] dark:focus:bg-[#2A2A2A] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[1px] font-bold block mb-2">CV / Resume File Path</label>
            <input 
              type="text" 
              value={data.cv || ''} 
              onChange={e => handleUpdateProfile('cv', e.target.value)}
              placeholder="./nathan_pesch_cv_2026.pdf"
              className="w-full px-4 py-3 rounded-none border border-[#1A1A1A] dark:border-[#F5F5F3] bg-transparent focus:bg-[#EAEAEA] dark:focus:bg-[#2A2A2A] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] dark:border-[#F5F5F3] pb-4">
          <h2 className="text-[12px] uppercase tracking-[2px] font-bold">Projects</h2>
          <button 
            onClick={addProject}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-[#F5F5F3] dark:bg-[#F5F5F3] dark:text-[#1A1A1A] text-[10px] uppercase tracking-[2px] font-bold hover:opacity-80 transition-opacity"
          >
            <Plus className="w-3 h-3" />
            Add Project
          </button>
        </div>

        <Reorder.Group 
          axis="y" 
          values={data.projects} 
          onReorder={handleReorder}
          className="space-y-4"
        >
          {data.projects.map((project) => (
            <ProjectEditor 
              key={project.id} 
              project={project} 
              isEditing={editingProjectId === project.id}
              onToggleEdit={() => setEditingProjectId(editingProjectId === project.id ? null : project.id)}
              onUpdate={(updates) => updateProject(project.id, updates)}
              onDelete={() => deleteProject(project.id)}
            />
          ))}
        </Reorder.Group>
        
        {data.projects.length === 0 && (
          <div className="text-center py-12 border border-dashed border-[#1A1A1A] dark:border-[#F5F5F3]">
            <p className="text-[12px] uppercase tracking-[1px] opacity-60">No projects yet. Click "Add Project" to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectEditor({ project, isEditing, onToggleEdit, onUpdate, onDelete }: {
  project: Project,
  isEditing: boolean,
  onToggleEdit: () => void,
  onUpdate: (updates: Partial<Project>) => void,
  onDelete: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!project.tags.includes(newTag)) {
        onUpdate({ tags: [...project.tags, newTag] });
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate({ tags: project.tags.filter(t => t !== tagToRemove) });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("Files must be under 50MB.");
        return;
      }
      
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          onUpdate({ images: [...project.images, result.url] });
        } else {
          alert("Failed to upload file");
        }
      } catch (error) {
        console.error("Upload error", error);
        alert("Upload error");
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...project.images];
    newImages.splice(index, 1);
    onUpdate({ images: newImages });
  };

  return (
    <Reorder.Item 
      value={project}
      className={cn(
        "rounded-none border overflow-hidden transition-all",
        isEditing ? "border-[#1A1A1A] dark:border-[#F5F5F3] bg-[#EAEAEA] dark:bg-[#2A2A2A]" : "border-[#1A1A1A] dark:border-[#F5F5F3]"
      )}
    >
      {/* Drag handle and header row */}
      <div className="flex items-center justify-between p-4 border-b border-[#1A1A1A] dark:border-[#F5F5F3] bg-transparent">
        <div className="flex items-center gap-4">
          <button className="cursor-grab active:cursor-grabbing hover:opacity-70 transition-opacity">
            <GripVertical className="w-4 h-4" />
          </button>
          <button onClick={onToggleEdit} className="text-[14px] uppercase tracking-[1px] font-bold text-left">
            {project.title || 'UNTITLED PROJECT'}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleEdit}
            className="text-[10px] uppercase tracking-[2px] font-bold hover:underline"
          >
            {isEditing ? 'Close' : 'Edit'}
          </button>
          <button 
            onClick={onDelete}
            className="p-1 hover:opacity-50 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="p-8 space-y-8 bg-transparent">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[1px] font-bold block mb-2">Title</label>
            <input 
              type="text" 
              value={project.title} 
              onChange={e => onUpdate({ title: e.target.value })}
              className="w-full px-4 py-3 rounded-none border border-[#1A1A1A] dark:border-[#F5F5F3] bg-transparent focus:bg-[#EAEAEA] dark:focus:bg-[#2A2A2A] outline-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[1px] font-bold block mb-2">Description</label>
            <textarea 
              value={project.description} 
              onChange={e => onUpdate({ description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-none border border-[#1A1A1A] dark:border-[#F5F5F3] bg-transparent focus:bg-[#EAEAEA] dark:focus:bg-[#2A2A2A] outline-none resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[1px] font-bold block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {project.tags.map(tag => (
                <span key={tag} className="flex items-center gap-2 px-2.5 py-1 border border-[#1A1A1A] dark:border-[#F5F5F3] text-[10px] uppercase tracking-[1px]">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:opacity-50">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="TYPE A TAG AND PRESS ENTER"
              onKeyDown={handleTagAdd}
              className="w-full px-4 py-3 rounded-none border border-[#1A1A1A] dark:border-[#F5F5F3] bg-transparent focus:bg-[#EAEAEA] dark:focus:bg-[#2A2A2A] outline-none placeholder:text-[10px] placeholder:tracking-[1px] placeholder:uppercase"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[1px] font-bold block mb-2">Media</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {project.images.map((img, i) => (
                <div key={i} className="group relative aspect-video border border-[#1A1A1A] dark:border-[#F5F5F3] bg-[#E0E0DE] dark:bg-[#2A2A2A] overflow-hidden">
                  {img.startsWith('data:video/') || img.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <video src={img} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  )}
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1.5 bg-[#1A1A1A] text-[#F5F5F3] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 aspect-video border border-dashed border-[#1A1A1A] dark:border-[#F5F5F3] hover:opacity-70 transition-opacity"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-[1px] font-bold">Add Media</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*,video/*" 
                className="hidden" 
              />
            </div>
          </div>
        </div>
      )}
    </Reorder.Item>
  );
}
