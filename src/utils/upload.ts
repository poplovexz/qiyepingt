import type { UploadRequestOptions } from 'element-plus';
import request from './request';

export const uploadImage = async (options: UploadRequestOptions) => {
  const { file, onProgress, onSuccess, onError } = options;
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await request.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress?.({ percent });
        }
      }
    });
    
    onSuccess?.(response.data);
  } catch (error) {
    onError?.(error as Error);
  }
};