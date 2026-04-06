import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui';
import { useDeleteVideo, useVideo } from '@/lib/hooks';

export default function VideoDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const videoId = params.id ?? '';

  const { data: video, isLoading } = useVideo(videoId);
  const deleteMutation = useDeleteVideo();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClassName = (status: string): string => {
    if (status === 'ready') {
      return 'bg-green-500/20 text-green-400';
    }

    if (status === 'uploading') {
      return 'bg-blue-500/20 text-blue-400';
    }

    if (status === 'error') {
      return 'bg-red-500/20 text-red-400';
    }

    return 'bg-yellow-500/20 text-yellow-400';
  };

  const getStatusLabel = (status: string): string => {
    if (status === 'ready') {
      return '就緒';
    }

    if (status === 'uploading') {
      return '上傳中';
    }

    if (status === 'error') {
      return '錯誤';
    }

    return '處理中';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <p className="text-white/60">載入中...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <p className="text-white/80 font-medium mb-4">影片不存在</p>
          <Button onClick={() => navigate('/videos')}>返回影片列表</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/videos')}>
          ← 返回影片列表
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {video.filename}
          </h1>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span>{formatFileSize(video.size)}</span>
            <span>•</span>
            <span>{formatDate(video.uploadedAt)}</span>
          </div>
        </div>

        <div className="aspect-video bg-black/50 rounded-lg overflow-hidden mb-6">
          <video
            src={video.url}
            className="w-full h-full"
            controls
            autoPlay
            aria-label={video.filename}
          >
            <track kind="captions" />
          </video>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span
              className={`text-xs px-3 py-1 rounded-full ${getStatusClassName(video.status)}`}
            >
              {getStatusLabel(video.status)}
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                deleteMutation.mutate(video.id, {
                  onSuccess: () => navigate('/videos'),
                });
              }}
              disabled={deleteMutation.isPending}
            >
              刪除
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
