/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Filestack Integration for Image Uploads
 * Handles profile picture uploads with automatic resizing and optimization
 */

const FILESTACK_API_KEY =
  import.meta.env.VITE_FILESTACK_API_KEY || "AVcRfQz9YSQuF6JtXlFsQz";
const FILESTACK_CDN = "https://cdn.filestackcontent.com";

export interface FilestackResponse {
  handle: string;
  url: string;
  size: number;
  type: string;
  filename: string;
  uploadId: string;
  mimetype: string;
}

/**
 * Get optimized image URL with transformations
 * Resizes to 400x400, compresses
 */
export function getOptimizedImageUrl(
  handle: string,
  size: number = 400
): string {
  if (!handle) return "";

  // Format: resize to size, compress
  // Removed crop_faces as it can cause issues - simple resize and compress is more reliable
  return `${FILESTACK_CDN}/resize=w:${size},h:${size},fit:crop/compress/${handle}`;
}

/**
 * Get thumbnail URL (small size for listings)
 */
export function getThumbnailUrl(handle: string): string {
  return getOptimizedImageUrl(handle, 200);
}

/**
 * Get profile picture URL (medium size)
 */
export function getProfilePictureUrl(handle: string): string {
  return getOptimizedImageUrl(handle, 400);
}

/**
 * Open Filestack picker for image upload
 */
export async function uploadProfilePicture(): Promise<FilestackResponse | null> {
  try {
    // Check if SDK is already loaded
    if ((window as any).filestack) {
      return openFilestackPicker();
    }

    // Load SDK dynamically
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://static.filestackapi.com/filestack-js/3.27.0/filestack.min.js";
      script.async = true;

      script.onload = () => {
        openFilestackPicker().then(resolve).catch(reject);
      };

      script.onerror = () => {
        reject(new Error("Failed to load Filestack SDK"));
      };

      document.head.appendChild(script);
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}

/**
 * Helper to open the picker
 */
function openFilestackPicker(): Promise<FilestackResponse | null> {
  return new Promise((resolve, reject) => {
    try {
      const filestack = (window as any).filestack;
      if (!filestack) {
        reject(new Error("Filestack SDK not available"));
        return;
      }

      const client = filestack.init(FILESTACK_API_KEY);

      const pickerOptions = {
        accept: ["image/*"],
        maxSize: 5242880, // 5MB
        maxFiles: 1,
        disableTransformer: false,
        fromSources: ["local_file_system"],
        // Use the newer callback format
        onUploadDone: (result: any) => {
          console.log("Upload done result:", result);

          if (
            result &&
            result.filesUploaded &&
            result.filesUploaded.length > 0
          ) {
            const file = result.filesUploaded[0];
            const response: FilestackResponse = {
              handle: file.handle,
              url: file.url,
              size: file.size,
              type: file.mimetype || file.type,
              filename: file.filename,
              uploadId: file.uploadId,
              mimetype: file.mimetype,
            };
            console.log("Resolving with:", response);
            resolve(response);
          } else if (
            result &&
            result.filesFailed &&
            result.filesFailed.length > 0
          ) {
            const error = result.filesFailed[0];
            reject(new Error(`Upload failed: ${error.name}`));
          } else {
            reject(new Error("No file uploaded"));
          }
        },
        onCancel: () => {
          console.log("Picker cancelled");
          resolve(null); // User cancelled, return null
        },
        onError: (error: any) => {
          console.error("Picker error:", error);
          reject(
            new Error(`Picker error: ${error.message || JSON.stringify(error)}`)
          );
        },
      };

      console.log("Opening picker with options:", pickerOptions);
      const picker = client.picker(pickerOptions);
      picker.open();
    } catch (error) {
      console.error("Error in openFilestackPicker:", error);
      reject(error);
    }
  });
}

/**
 * Get optimized URL for social sharing
 */
export function getSocialShareUrl(handle: string): string {
  // Resize to 1200x630 for optimal social media sizing
  return `${FILESTACK_CDN}/resize=w:1200,h:630,fit:crop/compress/${handle}`;
}

/**
 * Get URL for PDF embedding (profile picture in CV)
 */
export function getPDFImageUrl(handle: string): string {
  return `${FILESTACK_CDN}/resize=w:300,h:300,fit:crop/compress/${handle}`;
}

/**
 * Convert handle to download URL
 */
export function getDownloadUrl(
  handle: string,
  filename: string = "image"
): string {
  return `${FILESTACK_CDN}/download=filename:${filename}/${handle}`;
}

/**
 * Get raw file URL (no transformations)
 */
export function getRawUrl(handle: string): string {
  return `${FILESTACK_CDN}/${handle}`;
}
