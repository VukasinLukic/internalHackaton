import { v2 as cloudinary } from 'cloudinary';

class ImageUploadService {
  private static instance: ImageUploadService;

  private constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService();
    }
    return ImageUploadService.instance;
  }

  async uploadImage(
    fileBuffer: Buffer,
    folder: string = 'zzzimeri'
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id
            });
          }
        }
      ).end(fileBuffer);
    });
  }

  async uploadFromUrl(
    imageUrl: string,
    folder: string = 'zzzimeri'
  ): Promise<{ url: string; publicId: string }> {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  }

  async deleteImage(publicId: string): Promise<boolean> {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  }

  getThumbnailUrl(url: string, width: number = 400): string {
    return url.replace('/upload/', `/upload/w_${width},c_fill/`);
  }
}

export const imageUploadService = ImageUploadService.getInstance();
