import { Link } from 'react-router-dom';

import { Button, Card } from '@/components/ui';
import { useDeleteVideo, useVideos } from '@/lib/hooks';

export default function VideosPage() {
  const { data: videos, isLoading } = useVideos();
  const deleteMutation = useDeleteVideo();
  const isEmpty = !videos || videos.length === 0;

  const getStatusClassName = (status: string): string => {
    if (status === 'ready') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }

    if (status === 'uploading') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }

    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getStatusLabel = (status: string): string => {
    if (status === 'ready') {
      return '就緒';
    }

    if (status === 'uploading') {
      return '上傳中';
    }

    return '處理中';
  };

  const formatFileSize = (bytes: number): string => {
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
    });
  };

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  } else if (isEmpty) {
    content = (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">還沒有影片</h3>
        <p className="text-muted-foreground mb-4">上傳您的第一部影片</p>
        <Button asChild>
          <Link to="/videos/upload">開始上傳</Link>
        </Button>
      </Card>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <Link to={`/videos/${video.id}`}>
              <div className="aspect-video bg-muted relative group">
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  aria-label={video.filename}
                >
                  <track kind="captions" />
                </video>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold truncate">{video.filename}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatFileSize(video.size)} • {formatDate(video.uploadedAt)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusClassName(video.status)}`}
                >
                  {getStatusLabel(video.status)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="刪除影片"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteMutation.mutate(video.id);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">我的影片</h1>
          <p className="text-muted-foreground">管理您的所有影片</p>
        </div>
        <Button asChild>
          <Link to="/videos/upload">
            <svg
              className="w-4 h-4 mr-2"
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            上傳影片
          </Link>
        </Button>
      </div>

      {content}
    </div>
  );
}
