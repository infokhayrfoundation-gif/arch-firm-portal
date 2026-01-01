import React, { useRef, useState } from 'react';
import { ProjectStatus } from '../types';

// --- Architectural Components ---

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl p-6 ${className}`}>
    {children}
  </div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-2xl font-light tracking-tight text-stone-800 mb-6 ${className}`}>
    {children}
  </h2>
);

export const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <label className={`block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2 ${className}`}>
    {children}
  </label>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'danger' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-black shadow-lg shadow-zinc-900/10",
    secondary: "bg-stone-200 text-stone-800 hover:bg-stone-300",
    outline: "border border-zinc-300 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 bg-transparent",
    gold: "bg-amber-700 text-white hover:bg-amber-800 shadow-lg shadow-amber-900/10",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-6 group">
    <Label>{label}</Label>
    <input 
      className={`w-full bg-white/50 border-b border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:border-zinc-800 focus:bg-white transition-all duration-300 rounded-t-lg ${className}`} 
      {...props} 
    />
  </div>
);

export const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  let color = "bg-stone-100 text-stone-600 border-stone-200";
  
  if (['Completed', 'Paid', 'Concept Approved'].includes(status)) color = "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (['Appointment Needed', 'Payment Pending', 'Initial Form'].includes(status)) color = "bg-amber-50 text-amber-700 border-amber-100";
  if (['Construction', 'Inspection', 'Proposal Sent', 'Concept Shared'].includes(status)) color = "bg-blue-50 text-blue-700 border-blue-100";

  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${color}`}>
      {status}
    </span>
  );
};

export const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="w-full bg-stone-200 rounded-full h-1 mt-2 overflow-hidden">
    <div 
      className="bg-amber-700 h-1 rounded-full transition-all duration-1000 ease-out" 
      style={{ width: `${percentage}%` }}
    ></div>
  </div>
);

export const FileUpload: React.FC<{ label: string; onUpload: (file: string) => void }> = ({ label, onUpload }) => {
    const hiddenFileInput = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
    const handleClick = () => {
      hiddenFileInput.current?.click();
    };
  
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileUploaded = event.target.files?.[0];
      if (fileUploaded) {
          setSelectedFile(fileUploaded.name);
          
          // Read file as Data URL if it's an image to allow immediate preview
          if (fileUploaded.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (e) => {
                  if (e.target?.result) {
                      onUpload(e.target.result as string);
                  }
              };
              reader.readAsDataURL(fileUploaded);
          } else {
              // For non-images (PDFs, etc), just pass the name
              onUpload(fileUploaded.name); 
          }
      }
      if (event.target) {
        event.target.value = '';
      }
    };
  
    return (
      <>
        <div 
          className={`border border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${selectedFile ? 'border-amber-500 bg-amber-50/30' : 'border-stone-300 hover:border-zinc-500 hover:bg-white/50'}`}
          onClick={handleClick}
        >
          {selectedFile ? (
             <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mb-2">✓</div>
                <p className="text-zinc-800 font-medium">{selectedFile}</p>
                <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">Click to replace</p>
             </div>
          ) : (
             <div className="flex flex-col items-center">
                <span className="text-2xl mb-2 text-stone-400 group-hover:text-zinc-600 transition-colors">+</span>
                <p className="text-stone-600 font-medium">{label}</p>
                <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest">Drag & Drop or Click</p>
             </div>
          )}
        </div>
        <input
          type="file"
          ref={hiddenFileInput}
          onChange={handleChange}
          style={{display: 'none'}} 
        />
      </>
    );
};