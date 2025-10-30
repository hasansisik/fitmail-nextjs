const CLOUD_NAME = 'da2qwsrbv';
const API_KEY = '712369776222516';
const API_SECRET = '3uw0opJfkdYDp-XQsXclVIcbbKQ';

// Browser-compatible SHA1 hash function
async function generateSignature(timestamp: number): Promise<string> {
  const str = `timestamp=${timestamp}${API_SECRET}`;
  
  // Use Web Crypto API (works in browser and mobile)
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

interface UploadResult {
  info: {
    public_id: string;
    secure_url: string;
  };
}

export const uploadFileToCloudinary = async (file: File): Promise<string> => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(timestamp);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    // Dosya türüne göre upload endpoint'i belirle
    const fileType = file.type;
    let uploadEndpoint = 'image/upload';
    
    if (fileType.startsWith('image/')) {
      uploadEndpoint = 'image/upload';
    } else if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
      uploadEndpoint = 'raw/upload';
    } else if (fileType.startsWith('video/')) {
      uploadEndpoint = 'video/upload';
    } else if (fileType.startsWith('audio/')) {
      uploadEndpoint = 'video/upload'; // Cloudinary uses video endpoint for audio
    } else {
      // Diğer dosyalar için raw upload kullan
      uploadEndpoint = 'raw/upload';
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${uploadEndpoint}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.error) {
      console.error('Cloudinary error:', data.error);
      throw new Error(data.error.message);
    }

    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};