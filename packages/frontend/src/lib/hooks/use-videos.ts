import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type Video,videosApi } from '@/lib/api/videos';

export const VIDEOS_QUERY_KEY = ['videos'];

export function useVideos() {
  return useQuery({
    queryKey: VIDEOS_QUERY_KEY,
    queryFn: () => videosApi.list(),
  });
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: [...VIDEOS_QUERY_KEY, id],
    queryFn: () => videosApi.get(id),
    enabled: !!id,
  });
}

export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => videosApi.upload(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEOS_QUERY_KEY });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => videosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEOS_QUERY_KEY });
    },
  });
}
