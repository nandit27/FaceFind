import React, { useState } from 'react';
import { Button } from './ui/moving-border';
import { DownloadCloud, CheckSquare, Square } from 'lucide-react';
import { downloadImagesAsZip } from '../utils/downloader';

export const DownloadBar = ({ results, onSelectAll }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectedCount = results.filter(r => r.selected).length;
  const allSelected = selectedCount === results.length && results.length > 0;

  const handleDownload = async () => {
    const selectedImages = results.filter(r => r.selected);
    if (selectedImages.length === 0) return;

    setIsDownloading(true);
    setProgress(0);
    try {
      await downloadImagesAsZip(selectedImages, (percent) => {
        setProgress(percent);
      });
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to create zip file. Try downloading fewer images.");
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  if (!results || results.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-black/80 backdrop-blur-xl border border-cyan-900/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto transform transition-transform duration-500 translate-y-0 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => onSelectAll(!allSelected)}
            className="flex items-center gap-2 text-sm font-space text-neutral-300 hover:text-cyan-400 transition-colors"
          >
            {allSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          
          <div className="h-6 w-px bg-neutral-800 hidden md:block" />
          
          <span className="text-sm font-mono text-cyan-400">
            {selectedCount} selected
          </span>
        </div>

        <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-3">
           {isDownloading && (
              <div className="w-full md:w-48 bg-neutral-900 rounded-full h-2 mb-2 md:mb-0 mr-4 overflow-hidden">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
           )}

          <Button
            containerClassName="w-full md:w-48 h-12"
            className="w-full bg-cyan-950/40 border-cyan-800 text-cyan-50 flex items-center justify-center gap-2 hover:bg-cyan-900/60"
            onClick={handleDownload}
            disabled={selectedCount === 0 || isDownloading}
          >
            {isDownloading ? (
              <span className="font-mono">{Math.round(progress)}% Zipping</span>
            ) : (
              <>
                <DownloadCloud className="w-5 h-5" />
                <span>Download ({selectedCount})</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
