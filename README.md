# 黃名帝國議會｜Wongming Parliament

以原本 Cinema Seat Preview 專案的互動式 3D 座位體驗作為設計起點，改造成黃名帝國議會議事廳。

## 功能
- Three.js 3D 半圓形議場、主席台、議員桌椅與 48 個議席
- 可旋轉、縮放的議場視角；點選座位查看及編輯資料
- 議員姓名、黨團及席次管理
- 出席點名
- 議程切換
- 贊成、反對、棄權表決與即時統計
- 匯出 JSON 議事紀錄

## 執行
這是純靜態網站，使用 jsDelivr 載入 Three.js ES Module。可直接以 GitHub Pages 或 Vercel 部署；本機可執行 `npx serve .`。

## 資料說明
目前是前端互動原型。席次、點名和投票資料存在本次頁面執行期間的記憶體中，不使用 localStorage；重新整理會重置。可使用「匯出紀錄」下載 JSON 備份。正式議事資料若要跨裝置保存，下一階段需接雲端資料庫及使用者權限。

## Source inspiration
Original project: [Cinema Seat Preview](https://github.com/annynn1990/cinema), originally based on the Codrops / Three.js cinema-seat experience. This repository is a separate parliament adaptation; the cinema repository is not modified.
