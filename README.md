# Agent System with Harness Engineering

內部分享簡報，用 [open-slide](https://github.com/1weiho/open-slide) 製作。

## 檔案

| 路徑 | 說明 |
|---|---|
| `agent-harness-deck.html` | 單一檔案，瀏覽器直接打開就能播放 |
| `slides/agent-harness-engineering/index.tsx` | open-slide 原始碼，含所有頁面與講者備註（`notes`） |
| `tools/` | 重新產生播放用 HTML 的腳本 |

## 播放（agent-harness-deck.html）

| 按鍵 | 功能 |
|---|---|
| → / Space / PageDown | 下一頁（主線） |
| ← / PageUp | 上一頁；在附錄頁時回到它的主頁 |
| F / F5 | 全螢幕，Esc 離開 |
| L | 雷射筆 |
| N | 講者備註 |
| R | 重播動畫 |

附錄頁只能從主線頁右下角的「細節」連結進入，不會被上一頁／下一頁翻到。

## 編輯

- 用 open-slide：把 `slides/agent-harness-engineering/` 放進 open-slide 專案的 `slides/` 底下，照 open-slide 的說明啟動即可在瀏覽器編輯。
- 重新產生 HTML：在 repo 根目錄 `npm i -D esbuild react react-dom`，然後執行 `tools/build.sh`。
