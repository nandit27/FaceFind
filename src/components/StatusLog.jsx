import React, { useEffect, useRef } from 'react';

export const StatusLog = ({ logs, isActive }) => {
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isActive && logs.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto my-8 border border-neutral-800 bg-black/50 backdrop-blur-md text-green-400 font-mono text-xs rounded-xl overflow-hidden shadow-xl relative z-20">
      <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-neutral-400 text-xs">Terminal Output</span>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
      </div>
      <div 
        ref={logContainerRef}
        className="p-4 h-40 overflow-y-auto w-full flex flex-col gap-1"
      >
        {logs.map((log, idx) => (
          <div key={idx} className="opacity-90 break-words tracking-wide">
            {log}
          </div>
        ))}
        {isActive && (
          <div className="opacity-70 animate-pulse mt-1">
            <span className="text-cyan-500">_</span>
          </div>
        )}
      </div>
    </div>
  );
};
