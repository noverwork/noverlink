import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/app/layout';
import LoginPage from '@/app/login/page';
import HomePage from '@/app/page';
import RegisterPage from '@/app/register/page';
import VideoDetailPage from '@/app/videos/[id]/page';
import VideosPage from '@/app/videos/page';
import UploadVideoPage from '@/app/videos/upload/page';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/videos/upload" element={<UploadVideoPage />} />
        <Route path="/videos/:id" element={<VideoDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
