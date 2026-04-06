import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Card, Progress } from '@/components/ui';
import { useUploadVideo } from '@/lib/hooks';

export default function UploadVideoPage() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadVideo();

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('請上傳影片檔案');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      alert('檔案大小不能超過 100MB');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(
      {
        file: selectedFile,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      },
      {
        onSuccess: () => {
          setUploadProgress(0);
          navigate('/videos');
        },
      },
    );
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const formatFileSize = (bytes: number): string => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">上傳影片</h1>
          <p className="text-muted-foreground">
            支援 MP4, WebM, MOV (最大 100MB)
          </p>
        </div>

        <Card>
          <div className="border-2 border-dashed rounded-lg p-12 text-center border-border">
            <input
              ref={inputRef}
              id="video-file"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />

            {!selectedFile ? (
              <label
                htmlFor="video-file"
                className={`block space-y-6 cursor-pointer rounded-md transition-colors ${
                  dragActive ? 'bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium mb-1">拖放影片到這裡，或點擊選擇</p>
                  <p className="text-sm text-muted-foreground">
                    MP4, WebM, MOV (最大 100MB)
                  </p>
                </div>
                <Button onClick={() => inputRef.current?.click()}>
                  選擇影片
                </Button>
              </label>
            ) : (
              <div className="space-y-6">
                {previewUrl && (
                  <video
                    src={previewUrl}
                    className="max-h-64 mx-auto rounded-lg bg-muted"
                    controls
                    aria-label="影片預覽"
                  >
                    <track kind="captions" />
                  </video>
                )}
                <div className="bg-muted rounded-lg p-4 text-left">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {uploadMutation.isPending && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground text-center">
                      上傳中... {uploadProgress}%
                    </p>
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    disabled={uploadMutation.isPending}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? '上傳中...' : '開始上傳'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
