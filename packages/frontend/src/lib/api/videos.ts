
export interface Video {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress?: number;
}

const videosStore: Map<string, Video> = new Map();

export async function uploadVideo(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<Video> {
  const videoId = `video-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const video: Video = {
    id: videoId,
    filename: file.name,
    size: file.size,
    mimeType: file.type,
    uploadedAt: new Date().toISOString(),
    url: URL.createObjectURL(file),
    status: 'uploading',
    progress: 0,
  };

  videosStore.set(videoId, video);

  for (let i = 0; i <= 100; i += 10) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    video.progress = i;
    onProgress?.(i);
  }

  video.status = 'ready';
  video.progress = 100;
  videosStore.set(videoId, video);

  return video;
}

export async function getVideos(): Promise<Video[]> {
  return Array.from(videosStore.values());
}

export async function getVideo(id: string): Promise<Video | null> {
  return videosStore.get(id) || null;
}

export async function deleteVideo(id: string): Promise<void> {
  const video = videosStore.get(id);
  if (video) {
    URL.revokeObjectURL(video.url);
    videosStore.delete(id);
  }
}

export const videosApi = {
  async upload(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<Video> {
    return uploadVideo(file, onProgress);
  },

  async list(): Promise<Video[]> {
    return getVideos();
  },

  async get(id: string): Promise<Video | null> {
    return getVideo(id);
  },

  async delete(id: string): Promise<void> {
    return deleteVideo(id);
  },
};
