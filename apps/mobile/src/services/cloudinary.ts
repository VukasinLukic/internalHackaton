/**
 * Cloudinary Image Upload Service
 * Direct upload from React Native to Cloudinary
 */

const CLOUDINARY_CLOUD_NAME = 'dzxhhdsc5';
// IMPORTANT: This preset must exist in Cloudinary dashboard with "Unsigned" signing mode
// Go to: Settings -> Upload -> Upload presets -> Add upload preset
// Name: zzzimeri_unsigned, Signing Mode: Unsigned
const CLOUDINARY_UPLOAD_PRESET = 'zzzimeri_unsigned';

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload image directly to Cloudinary from React Native
 * @param imageUri - Local file URI from ImagePicker
 * @returns Cloudinary hosted URL
 */
export async function uploadToCloudinary(
  imageUri: string
): Promise<CloudinaryUploadResult> {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();

    // Extract filename and determine mime type
    const filename = imageUri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append image file
    formData.append('file', {
      uri: imageUri,
      type,
      name: filename,
    } as any);

    // Append upload preset (unsigned upload)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || 'Upload failed',
      };
    }

    // Return secure URL
    return {
      success: true,
      url: data.secure_url,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param imageUris - Array of local file URIs
 * @returns Array of Cloudinary URLs
 */
export async function uploadMultipleToCloudinary(
  imageUris: string[]
): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
  const results = await Promise.all(imageUris.map(uploadToCloudinary));

  const urls: string[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.success && result.url) {
      urls.push(result.url);
    } else {
      errors.push(result.error || `Upload ${index + 1} failed`);
    }
  });

  return {
    success: errors.length === 0,
    urls,
    errors,
  };
}
