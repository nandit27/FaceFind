import * as faceapi from "face-api.js";

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return true;
  try {
    const MODEL_URL = "/models";
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error("Error loading face-api models:", error);
    return false;
  }
};

export const extractFaceDescriptor = async (imageElement) => {
  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options())
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  return detection ? detection.descriptor : null;
};

export const extractAllFaceDescriptors = async (imageElement) => {
  const detections = await faceapi
    .detectAllFaces(imageElement, new faceapi.SsdMobilenetv1Options())
    .withFaceLandmarks()
    .withFaceDescriptors();
    
  return detections.map(d => d.descriptor);
};

export const createFaceMatcher = (referenceDescriptor, matchThreshold = 0.5) => {
  const labeledDescriptor = new faceapi.LabeledFaceDescriptors("Reference", [referenceDescriptor]);
  return new faceapi.FaceMatcher([labeledDescriptor], matchThreshold);
};

export const drawDetection = (canvas, imageElement, descriptor) => {
  if (!canvas || !imageElement) return;
  // This helper will just do a re-detection for bounding box drawing if requested,
  // or simple manual drawing if box is stored.
  // For uploaded photo preview bounding box:
  faceapi.matchDimensions(canvas, imageElement);
  faceapi.detectSingleFace(imageElement).then(detection => {
    if(detection) {
      const resized = faceapi.resizeResults(detection, imageElement);
      faceapi.draw.drawDetections(canvas, resized);
    }
  });
};
