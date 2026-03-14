// Fetch images from Google Drive folder
export const fetchDriveFiles = async (folderId, apiKey) => {
  try {
    const q = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink)&pageSize=1000`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const message = errBody?.error?.message || response.statusText || `HTTP ${response.status}`;
      throw new Error(`Google Drive API Error (${response.status}): ${message}`);
    }
    
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Failed to fetch Google Drive files:", error);
    throw error;
  }
};

// Download image as blob and create an object URL
export const fetchImageBlob = async (fileId, apiKey) => {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image blob: ${response.statusText}`);
    }
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("Failed to load image blob:", error);
    return null;
  }
};
