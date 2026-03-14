import React, { useEffect, useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { UploadZone } from './components/UploadZone';
import { ScanOverlay } from './components/ScanOverlay';
import { ResultsGrid } from './components/ResultsGrid';
import { DownloadBar } from './components/DownloadBar';
import { StatusLog } from './components/StatusLog';
import { useFaceSearch } from './hooks/useFaceSearch';
import { Button } from './components/ui/moving-border';

function App() {
  const {
    step,
    logs,
    error,
    referenceImage,
    matchedResults,
    totalFiles,
    processedCount,
    initialize,
    processReferencePhoto,
    startSearch,
    toggleSelection,
    toggleSelectAll,
    reset,
  } = useFaceSearch();

  const [isLoadingModels, setIsLoadingModels] = useState(true);

  useEffect(() => {
    initialize().then((success) => {
      if(success) {
        setIsLoadingModels(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = (imgEl, url) => {
    processReferencePhoto(imgEl, url);
  };

  if (isLoadingModels) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono text-cyan-500 flex-col gap-4">
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        <p>Loading Deep Learning Models...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500/30 relative">
      
      {/* Dynamic Render based on Step */}
      {step === "IDLE" && (
        <>
          <HeroSection />
          <UploadZone onUpload={handleUpload} error={error} />
        </>
      )}

      {(step === "SCANNING" || step === "READY_TO_SEARCH" || step === "SEARCHING") && (
        <ScanOverlay 
          imageSrc={referenceImage} 
          logs={logs} 
        >
          {step === "READY_TO_SEARCH" && (
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
              <h3 className="text-2xl font-space mb-4 text-center">Reference Face Acquired</h3>
              <Button 
                onClick={startSearch}
                className="bg-cyan-950 border-cyan-500 text-cyan-50 text-base"
                containerClassName="w-56 h-14 sm:w-64"
              >
                Start Drive Scan
              </Button>
              {error && <p className="text-red-400 mt-4 text-sm font-mono text-center">{error}</p>}
            </div>
          )}
          
          {step === "SEARCHING" && (
            <div className="w-full max-w-xl mx-auto space-y-4">
              <StatusLog logs={logs} isActive={true} />
              <div className="flex justify-between text-xs font-mono text-neutral-400">
                <span>Scanning files...</span>
                <span>{processedCount} / {totalFiles}</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_10px_#00f0ff]" 
                  style={{ width: `${totalFiles > 0 ? (processedCount / totalFiles) * 100 : 0}%`}}
                />
              </div>
            </div>
          )}
        </ScanOverlay>
      )}

      {step === "RESULTS" && (
        <div className="pt-10 pb-40 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 mb-8 flex justify-between items-center relative z-20">
            <div>
              <h1 className="text-3xl font-space font-bold border-b-2 border-cyan-500 pb-2 inline-block">Analysis Complete</h1>
            </div>
            <button 
              onClick={reset}
              className="text-sm border border-neutral-700 hover:border-cyan-500 px-4 py-2 rounded-lg font-mono transition-colors"
            >
              Start New Search
            </button>
          </div>
          
          {matchedResults.length > 0 ? (
            <>
              <ResultsGrid 
                results={matchedResults} 
                onToggleSelect={toggleSelection} 
              />
              <DownloadBar 
                results={matchedResults} 
                onSelectAll={toggleSelectAll} 
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-md mx-auto relative z-20">
              <div className="w-24 h-24 rounded-full bg-neutral-900 flex items-center justify-center mb-6">
                 {/* Empty state illustration */}
                 <svg className="w-12 h-12 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <h3 className="text-xl font-space mb-2">No Matches Found</h3>
              <p className="text-neutral-400 font-mono text-sm mb-6">We couldn't find any photos matching the reference face in the connected Drive folder.</p>
              <Button onClick={reset} className="w-48 bg-neutral-900 border-neutral-700 text-white">
                Try Another Photo
              </Button>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto px-4">
            <StatusLog logs={logs} isActive={false} />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
