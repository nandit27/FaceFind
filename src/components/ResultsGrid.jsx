import React from 'react';
import { HoverEffect } from './ui/card-hover-effect';

export const ResultsGrid = ({ results, onToggleSelect }) => {
  if (!results || results.length === 0) return null;

  const items = results.map((result, index) => {
    return {
      id: result.file.id,
      content: (
        <div className="flex flex-col h-full bg-neutral-950 rounded-xl overflow-hidden relative group">
          <div className="h-48 w-full overflow-hidden bg-neutral-900 flex items-center justify-center relative">
            <img 
              src={result.thumbnailUrl} 
              alt={result.file.name} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
              loading="lazy"
            />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur pb-[2px] px-2 rounded-full border border-cyan-800 text-xs font-mono text-cyan-400">
              {result.confidenceScore}% Match
            </div>
            
            <div className="absolute top-2 left-2 z-30">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={result.selected} 
                  onChange={() => onToggleSelect(index)}
                  className="w-5 h-5 accent-cyan-500 rounded border-gray-700 bg-gray-900 cursor-pointer transition-all hover:scale-110"
                />
              </label>
            </div>
          </div>
          <div className="p-3 border-t border-neutral-800">
            <h4 className="text-sm font-space text-neutral-300 truncate" title={result.file.name}>
              {result.file.name}
            </h4>
          </div>
        </div>
      )
    };
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-8">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-2xl font-space text-white">
          Found <span className="text-cyan-400 font-bold">{results.length}</span> images
        </h2>
      </div>
      <HoverEffect items={items} />
    </div>
  );
};
