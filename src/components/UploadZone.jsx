import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/moving-border';
import { UploadCloud, Camera } from 'lucide-react';

export const UploadZone = ({ onUpload, statusMessage, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const imgEl = new Image();
    imgEl.src = url;
    imgEl.onload = () => {
      onUpload(imgEl, url);
    };
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-4 relative z-20">
      <div 
        className={`w-full relative group border-2 border-dashed rounded-3xl p-12 text-center transition-all ${dragActive ? 'border-cyan-400 bg-cyan-900/10' : 'border-neutral-700 bg-black/40 hover:border-cyan-500/50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-950/50 flex items-center justify-center">
            <UploadCloud className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="font-space text-2xl text-white">Upload Reference Photo</h3>
          <p className="font-mono text-neutral-400 text-sm">Drag and drop your photo here, or click to browse</p>
          
          <Button
            borderRadius="1rem"
            className="bg-black text-white px-8 h-12 mt-4"
            containerClassName="w-48 h-12"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Image
          </Button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>
      
      {statusMessage && (
        <div className="mt-6 text-cyan-400 font-mono text-sm animate-pulse">
          {statusMessage}
        </div>
      )}
      
      {error && (
        <div className="mt-6 text-red-400 font-mono text-sm bg-red-950/20 px-4 py-2 rounded-md border border-red-900/50">
          {error}
        </div>
      )}
    </div>
  );
};
