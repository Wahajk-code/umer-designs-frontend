interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

interface CloudinaryUploadResult {
  public_id: string;
  resource_type: string;
  format: string;
}

/**
 * Uploads a file directly from the browser to Cloudinary using a short-lived
 * signature minted by the backend (via the BFF). The file's bytes never
 * transit our own server — only the resulting public_id does.
 */
export async function uploadToCloudinary(
  file: File,
  signature: UploadSignature,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);
  formData.append('folder', signature.folder);
  formData.append('type', 'authenticated');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? 'Upload to Cloudinary failed.');
  }

  return response.json();
}
