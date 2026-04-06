# VideoHub - 影片上傳服務

## ✅ 完成狀態

- ✅ 已改為 React + Vite
- ✅ ui-shared 已完全刪除
- ✅ shadcn/ui 直接安裝在 frontend
- ✅ 前端成功啟動運行

## 🚀 啟動方式

```bash
npm run frontend:dev
```

訪問：http://localhost:4200

開發時請先設定 `packages/frontend/.env`：

```env
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:4200
```

## 📁 頁面結構

```
/                    # 首頁
/login               # 登入
/videos              # 影片列表
/videos/upload       # 上傳頁面
/videos/[id]         # 影片詳情
```

## 🎯 核心功能

1. **會員登入** - localStorage 認證
2. **瀏覽影片** - 卡片式佈局
3. **上傳影片** - 拖放 + 進度顯示

## 🔧 技術棧

- React 19.0.0
- React Router 7
- Vite 7
- TypeScript 5.9.2
- Tailwind CSS 4.1.0
- shadcn/ui (本地)
- React Query
- localStorage + 模擬影片資料

## ⚠️ 注意事項

- 登入流程目前以 localStorage 模擬
- 影片資料使用記憶體暫存，重新整理後會消失
- auth API client 已保留，若接回後端需提供 `VITE_API_URL`
