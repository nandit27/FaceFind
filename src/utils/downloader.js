import JSZip from "jszip";
import { saveAs } from "file-saver";

export const downloadImagesAsZip = async (images, progressCallback) => {
  const zip = new JSZip();
  const folder = zip.folder("FaceFind_Results");

  images.forEach((img, index) => {
    // Determine extension from mimeType if available, else default to jpg
    let ext = "jpg";
    if (img.mimeType) {
      if (img.mimeType === "image/png") ext = "png";
      else if (img.mimeType === "image/webp") ext = "webp";
      else if (img.mimeType === "image/jpeg") ext = "jpg";
    }
    const filename = `${img.file?.name || `match_${index + 1}`}.${ext}`;
    if (img.blob) {
      folder.file(filename, img.blob);
    }
  });

  const content = await zip.generateAsync({
    type: "blob",
    compression: "STORE",
  }, (metadata) => {
    if (progressCallback) {
      progressCallback(metadata.percent);
    }
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  saveAs(content, `FaceFind_Results_${timestamp}.zip`);
};
