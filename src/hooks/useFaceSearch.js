import { useState, useCallback, useRef } from 'react';
import { loadModels, extractFaceDescriptor, extractAllFaceDescriptors, createFaceMatcher } from '../utils/faceRecognition';
import { fetchDriveFiles, fetchImageBlob } from '../utils/driveApi';

export const useFaceSearch = () => {
  const [step, setStep] = useState("IDLE"); // IDLE, UPLOADING, SCANNING, SEARCHING, RESULTS
  const [logs, setLogs] = useState([]);
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceDescriptor, setReferenceDescriptor] = useState(null);
  const [matchedResults, setMatchedResults] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [error, setError] = useState(null);

  const addLog = useCallback((message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  const initialize = async () => {
    addLog("Initializing FaceFind...");
    await loadModels();
    addLog("Face-api.js models loaded successfully.");
    return true;
  };

  const processReferencePhoto = async (imageElement, imageUrl) => {
    try {
      setStep("SCANNING");
      addLog("Analyzing reference photo...");
      setReferenceImage(imageUrl);
      
      const descriptor = await extractFaceDescriptor(imageElement);
      if (!descriptor) {
        throw new Error("No face detected in the reference photo. Please upload a clear photo.");
      }
      
      setReferenceDescriptor(descriptor);
      addLog("Reference face descriptor extracted.");
      setStep("READY_TO_SEARCH");
    } catch (err) {
      setError(err.message);
      setStep("IDLE");
    }
  };

  const startSearch = async () => {
    if (!referenceDescriptor) return;
    
    setStep("SEARCHING");
    setError(null);
    setMatchedResults([]);
    setProcessedCount(0);
    
    const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID?.trim();
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY?.trim();
    
    if (!FOLDER_ID || !API_KEY || FOLDER_ID === "your_folder_id_here") {
      setError("Google Drive connection not configured. Please set the VITE_ variables in .env.");
      setStep("READY_TO_SEARCH");
      return;
    }
    
    try {
      addLog("Fetching file list from Google Drive...");
      const files = await fetchDriveFiles(FOLDER_ID, API_KEY);
      setTotalFiles(files.length);
      addLog(`Found ${files.length} images in Drive folder.`);
      
      if (files.length === 0) {
        setStep("RESULTS");
        return;
      }

      const faceMatcher = createFaceMatcher(referenceDescriptor, 0.45); // Stricter threshold
      const matches = [];
      
      // Process in batches
      const BATCH_SIZE = 5;
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (file) => {
          try {
            const blob = await fetchImageBlob(file.id, API_KEY);
            if (!blob) return;
            
            const imgElement = document.createElement("img");
            imgElement.src = URL.createObjectURL(blob);
            await new Promise((resolve) => {
              imgElement.onload = resolve;
              imgElement.onerror = resolve; // Skip on error
            });
            
            const fileDescriptors = await extractAllFaceDescriptors(imgElement);
            
            let bestMatchObj = null;
            let highestConfidence = 0;

            for (const desc of fileDescriptors) {
              const match = faceMatcher.findBestMatch(desc);
              if (match.label === "Reference") {
                const confidence = 1 - match.distance; // Rough percentage
                if (confidence > highestConfidence) {
                  highestConfidence = confidence;
                  bestMatchObj = match;
                }
              }
            }
            
            if (bestMatchObj && highestConfidence > 0.55) { // Stricter check
              matches.push({
                file,
                blob,
                thumbnailUrl: imgElement.src, // Re-use blob url
                confidenceR: highestConfidence,
                confidenceScore: Math.round(highestConfidence * 100),
                selected: true
              });
              addLog(`Match found: ${file.name} (${Math.round(highestConfidence * 100)}%)`);
            }
          } catch (fileErr) {
            console.warn("Error processing file", file, fileErr);
          } finally {
            setProcessedCount(prev => prev + 1);
          }
        }));
      }
      
      setMatchedResults(matches);
      addLog(`Search completed. Found ${matches.length} matches.`);
      setStep("RESULTS");
      
    } catch (err) {
      setError(err.message || "Failed during search process.");
      setStep("READY_TO_SEARCH");
    }
  };

  const toggleSelection = (index) => {
    setMatchedResults(prev => prev.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };
  
  const toggleSelectAll = (select) => {
    setMatchedResults(prev => prev.map(item => ({ ...item, selected: select })));
  };

  const reset = () => {
    setStep("IDLE");
    setReferenceImage(null);
    setReferenceDescriptor(null);
    setMatchedResults([]);
    setError(null);
    setProcessedCount(0);
    setTotalFiles(0);
    setLogs([]);
  };

  return {
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
  };
};
