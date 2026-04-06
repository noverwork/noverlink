# VideoHub - 影片上傳服務

## ✅ 完成狀態

- ✅ ui-shared 已完全刪除
- ✅ shadcn/ui 直接安裝在 frontend
- ✅ 前端成功啟動運行
- ✅ 純前端實作，無後端依賴

## 🚀 啟動方式

```bash
npx nx dev @truley-interview/frontend
```

訪問：http://localhost:4200

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

- Next.js 15.2.8
- React 19.0.0
- TypeScript 5.9.2
- Tailwind CSS 4.1.0
- shadcn/ui (本地)
- React Query
- Map + localStorage (純前端)

## ⚠️ 注意事項

- 純前端實作
- 記憶體暫存
- 重新整理資料消失
- 適合面試題目
