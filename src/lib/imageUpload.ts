/**
 * Image Upload Utility
 * Handles profile image compression and conversion to base64 for storage in Firestore
 * Reduces file size and quality to optimize storage
 */

interface ImageUploadResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Compress image using Canvas API
 * Reduces file size and quality (max 400x400, 70% quality)
 */
const compressImage = (
  canvas: HTMLCanvasElement,
  quality: number = 0.7,
  maxWidth: number = 400,
  maxHeight: number = 400
): Promise<Blob> => {
  return new Promise((resolve) => {
    if (canvas.width > maxWidth || canvas.height > maxHeight) {
      const ratio = Math.min(
        maxWidth / canvas.width,
        maxHeight / canvas.height
      );
      const newWidth = canvas.width * ratio;
      const newHeight = canvas.height * ratio;

      const resizedCanvas = document.createElement("canvas");
      resizedCanvas.width = newWidth;
      resizedCanvas.height = newHeight;

      const resizedCtx = resizedCanvas.getContext("2d");
      if (resizedCtx) {
        resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
        resizedCanvas.toBlob(resolve, "image/jpeg", quality);
      }
    } else {
      canvas.toBlob(resolve, "image/jpeg", quality);
    }
  });
};

/**
 * Convert blob to base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Upload and compress profile image
 * Returns base64 encoded image data for storage in Firestore
 * Max size: 400x400px, 70% JPEG quality
 */
export const uploadProfileImage = (file: File): Promise<ImageUploadResult> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve({
        success: false,
        error: "Please select an image file",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      resolve({
        success: false,
        error: "Image must be smaller than 5MB",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve({
              success: false,
              error: "Failed to process image",
            });
            return;
          }

          ctx.drawImage(img, 0, 0);

          try {
            const compressedBlob = await compressImage(canvas, 0.7, 400, 400);
            const base64Data = await blobToBase64(compressedBlob);

            resolve({
              success: true,
              data: base64Data,
            });
          } catch (error) {
            resolve({
              success: false,
              error:
                error instanceof Error ? error.message : "Compression failed",
            });
          }
        };

        img.onerror = () => {
          resolve({
            success: false,
            error: "Failed to load image",
          });
        };

        img.src = e.target?.result as string;
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: "Failed to read file",
      });
    };

    reader.readAsDataURL(file);
  });
};
