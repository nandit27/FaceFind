const sleep = (ms) => new Promise(r => setTimeout(r, ms));
// ✅ Direct call — Drive API v3 listing has no CORS issues
export const fetchDriveFiles = async (folderId, apiKey) => {
  try {
    const q = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
    const targetUrl = new URL('https://www.googleapis.com/drive/v3/files');
    targetUrl.searchParams.set('q', q);
    targetUrl.searchParams.set('key', apiKey);
    targetUrl.searchParams.set('fields', 'files(id,name,mimeType,thumbnailLink)');
    targetUrl.searchParams.set('pageSize', '1000');

    const response = await fetch(targetUrl.toString());
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

// ✅ Proxy only the thumbnail image — needs CORS bypass
export const loadImageElementForDetection = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.thumbnailLink) {
      return reject(new Error('No thumbnail available'));
    }

    // Bump thumbnail to 1024px for much better face detection accuracy
    const thumbnailUrl = file.thumbnailLink.replace(/=s\d+.*$/, '=s1024');

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Important for face-api canvas scanning

    const timeout = setTimeout(() => {
      img.src = '';
      reject(new Error('Timeout'));
    }, 20000);

    img.onload = () => {
      clearTimeout(timeout);
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        reject(new Error('Image loaded but has 0 dimensions (possibly broken or HTML error page)'));
      } else {
        resolve(img);
      }
    };
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Image load failed (CORS or network error)'));
    };

    img.src = thumbnailUrl; // No proxy! `googleusercontent.com` provides native * CORS headers
  });
};

// ✅ Full-res via thumbnailLink bypass (s0 = original size)
export const fetchImageBlob = async (fileObj) => {
  try {
    if (!fileObj.thumbnailLink) throw new Error("No thumbnail link");
    
    // =s0 forces Google Drive to serve the original full-quality media byte blob
    // It works perfectly from the browser with no auth needed
    const targetUrl = fileObj.thumbnailLink.replace(/=s\d+.*$/, '=s0');
    
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    return await response.blob();
  } catch (error) {
    console.error("Failed to load image blob:", error);
    return null;
  }
};