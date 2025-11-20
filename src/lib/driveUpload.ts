export async function uploadToDrive(
  file: File,
  uid: string,
  onProgress?: (p: number) => void
) {
  const url = import.meta.env.VITE_UPLOAD_URL || "/api/upload/profile";
  const fd = new FormData();
  fd.append("file", file);
  fd.append("uid", uid);

  const resp = await fetch(url, {
    method: "POST",
    body: fd,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || "Upload failed");
  }

  const json = await resp.json();
  return json; // { link, fileId }
}
