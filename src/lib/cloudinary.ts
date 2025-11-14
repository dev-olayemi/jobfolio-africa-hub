export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET"
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);

  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch (e) {
      /* ignore */
    }
    throw new Error(
      `Cloudinary upload failed: ${res.status} ${JSON.stringify(body)}`
    );
  }

  const data = await res.json();
  // secure_url is preferred; fallback to url
  return data.secure_url || data.url;
}
