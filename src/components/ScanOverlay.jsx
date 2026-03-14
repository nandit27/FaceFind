import React from 'react';
import { BackgroundBeams } from './ui/background-beams';

export const ScanOverlay = ({ imageSrc, logs, children }) => {
  const currentLogs = logs.slice(-3); // Show last 3 messages

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden">
      <BackgroundBeams />
      
      <div className="relative z-10 w-64 h-64 md:w-96 md:h-96 rounded-2xl overflow-hidden border-2 border-cyan-500/30 group">
        <div className="absolute inset-0 bg-cyan-500/10 z-10"></div>
        
        {/* Scanning Line Animation */}
        <div className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_#00f0ff] z-20 animate-[scan_2s_ease-in-out_infinite]" />
        
        {imageSrc ? (
          <img src={imageSrc} alt="Reference face" className="w-full h-full object-cover filter grayscale sepia-[0.2] hue-rotate-[180deg]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-cyan-500">
            PROCESSING
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMDA4AFvAHzcOAAAAASUVORK5CYII=')] opacity-20 z-10"></div>
      </div>

      <div className="mt-12 max-w-xl w-full px-6 font-mono text-sm z-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-cyan-400 font-bold uppercase tracking-widest">System Active</span>
        </div>
        
        <div className="w-full bg-neutral-900/80 border border-neutral-800 rounded-lg p-4 font-mono text-xs text-green-400 h-32 overflow-y-auto">
          {currentLogs.map((log, i) => (
            <div key={i} className="mb-1 opacity-80">{"> "}{log}</div>
          ))}
          <div className="animate-pulse">{"> "}...</div>
        </div>
      </div>
      
      {children && (
        <div className="relative z-20 mt-8 w-full max-w-2xl text-center">
          {children}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
};
