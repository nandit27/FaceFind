import { useState, useCallback } from 'react';
import { loadModels, extractFaceDescriptor, extractAllFaceDescriptors, createFaceMatcher } from '../utils/faceRecognition';
import { fetchDriveFiles, loadImageElementForDetection, fetchImageBlob } from '../utils/driveApi';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const useFaceSearch = () => {
  const [step, setStep] = useState("IDLE");
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
      setError("Google Drive connection not configured.");
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

      // 0.6 is a standard lenient threshold for face-api.js
      const faceMatcher = createFaceMatcher(referenceDescriptor, 0.6);
      const matches = [];

      // ✅ Fully serial — one image at a time, no parallel requests
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let retries = 3;

        while (retries > 0) {
          try {
            const img = await loadImageElementForDetection(file);
            const fileDescriptors = await extractAllFaceDescriptors(img);
            
            // ✅ CRITICAL MEMORY CLEANUP: Free the image element/memory immediately so the browser doesn't crash/reload mid-process
            img.src = "";
            img.remove();

            let highestConfidence = 0;
            let matched = false;

            for (const desc of fileDescriptors) {
              const match = faceMatcher.findBestMatch(desc);
              if (match.label === "Reference") {
                const confidence = 1 - match.distance;
                if (confidence > highestConfidence) {
                  highestConfidence = confidence;
                  matched = true;
                }
              }
            }

            if (matched && highestConfidence > 0.5) {
              matches.push({
                file,
                thumbnailUrl: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+.*$/, '=s800') : `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`,
                confidenceScore: Math.round(highestConfidence * 100),
                selected: true,
              });
              addLog(`✓ Match: ${file.name} (${Math.round(highestConfidence * 100)}%)`);
            }

            break; // success — exit retry loop

          } catch (err) {
            retries--;
            if (retries > 0) {
              console.warn(`Retry ${3 - retries} for ${file.name}`);
              await sleep(1500); // wait before retry
            } else {
              console.warn(`Skipped ${file.name}: ${err.message}`);
              addLog(`⚠️ Skipped ${file.name} - Could not load image`);
            }
          }
        }

        setProcessedCount(i + 1);

        // ✅ 200ms between every image — prevents 429 entirely
        await sleep(200);
      }

      setMatchedResults(matches);
      addLog(`Search complete. Found ${matches.length} match${matches.length !== 1 ? 'es' : ''}.`);
      setStep("RESULTS");

    } catch (err) {
      setError(err.message || "Failed during search process.");
      setStep("READY_TO_SEARCH");
    }
  };

  const getFullResBlob = async (fileObj) => {
    return fetchImageBlob(fileObj);
  };

  const toggleSelection = (index) => {
    setMatchedResults(prev =>
      prev.map((item, i) => i === index ? { ...item, selected: !item.selected } : item)
    );
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
    step, logs, error, referenceImage, matchedResults,
    totalFiles, processedCount, initialize, processReferencePhoto,
    startSearch, getFullResBlob, toggleSelection, toggleSelectAll, reset,
  };
};