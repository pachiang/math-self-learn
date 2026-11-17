---
name: proofs-chapter
description: 規畫、實作或修改「證明與數學思維」課（src/app/features/proofs，路由 /learn/proofs）的一章或一幕時使用。內容是做一章的工作順序、這門課的程式接點，以及 build 與實機驗證時的坑。教學與文案規範不在這裡，以 AGENTS.md、docs/LEARNING_DESIGN.md、docs/PROOFS_THINKING_PLAN.md 為準。
---

# 做一章證明課

這份 skill 只管做事的順序和容易踩的坑。教什麼、怎麼教、文案怎麼寫，一律以下面三份文件為準；如果這裡和它們衝突，照文件做，再回頭改這份 skill。

- `AGENTS.md`：工作方式與技術輪廓。
- `docs/LEARNING_DESIGN.md`：最高內容規範。動手前完整讀過，常回頭查的是 §3（一幕一個 insight）、§7（例子偏差、evidence 強度、低解析度但為真）、§8（繁中文案）、§12（交付模板）、§13（完成定義）。
- `docs/PROOFS_THINKING_PLAN.md`：本課規畫。開頭是進度表；接著是全課共用元件（狀態板、步法卡、對手、小世界、骨架卡、證據標籤）、練習的產出優先護欄、各章章級規畫，以及已完成章節的詳細 storyboard。

## 最容易犯的錯：照抄上一章的結構

第 6–8 章都長成「狀態板、五六幕、帶走一句、骨架卡」，是因為那幾章教的是步法。幕數、主要視覺模型、要不要用狀態板，都該由這一章的 insight 決定，不由上一章決定。後面的章節很可能需要自己的模型；先讀規畫文件裡該章怎麼寫，再想什麼畫面能讓操作承擔推理。

能共用的是底層工具和視覺語法：`proofs-kit.scss`、`proofs-shell.scss` 裡的 `pf-*` 樣式、印章、證據標籤、狀態板引擎、骨架卡複習。畫面的敘事每一幕自己寫。

## 工作順序

做新的一章就照順序走。只修一幕的小改動，跳過用不到的步驟，但第 5、6 步照做。

1. **讀前後文。** 讀本章的章級規畫、上一章最後一幕的程式和 storyboard，以及下一章的章級規畫。章級規畫寫得不好就直接改，不必保護既有寫法。
2. **先寫 storyboard，再碰程式。** 在規畫文件「## 章數與範圍決策」之前加「## ChN 詳細 storyboard · 章名」，格式照已完成的章節：
   - 全章設計句：逐項回答 LEARNING_DESIGN §12 的模板。
   - 每幕一段：具體問題、學習者操作什麼、預測 → 回饋 → 壓縮。
   - 畫面與實作約束、完成驗收。

   §12 有答不出來的項目，先不要寫 UI。寫完後把章級規畫同步成實際的幕數。
3. **用到狀態板時，先改模型和 self-test，再做畫面。** 新句型、新卡、新的矛盾規則都寫進 `board/board-model.ts`，它是純函數。每加一項就在 `board/board-model.selftest.ts` 補測試，也要測會被拒絕的錯步。在 repo 根目錄跑：

   ```bash
   npx esbuild src/app/features/proofs/board/board-model.selftest.ts --bundle --platform=node --log-level=warning | node
   ```

   全過之後，才改 `board/proof-board.component.ts` 的卡片列、錯卡提示和成功說明。
4. **一幕一個 component，放在 `chN/`，選擇器用 `app-pf-*`。** 要接上的地方：
   - `proofs-course-data.ts`：本章的幕名。
   - `proofs-chapter.component.ts`：import 與 `@case`。
   - 上一章最後一幕的「下一章」連結，改指 `/learn/proofs/chN/1`。
   - `src/app/features/learn/learn.component.ts` 裡「第 1–N 章已開放」的字樣。
   - 每幕的完成條件呼叫 `LearnProgressService.markCompleted('proofs-chN', '<幕>')`。
   - 骨架卡的章首複習和章末新卡，照規畫文件〈E. 骨架卡〉的排程（不只是下一章，三章後也要再出現）。卡片內容在 `board/skeletons.ts`，複習元件是 `app-pf-skeleton-review`。
5. **文案寫完唸一遍。** 對照 LEARNING_DESIGN §8 逐句檢查，最常漏的是一句超過一個冒號，以及回饋沒有先回應學習者做了什麼。不是證明的證據都要掛證據標籤，例如「例子」「有限檢查」。借來用、但還沒證的事實要說清楚是欠著的，並說在哪一章補。
6. **build 和實機驗證**，見下兩節。
7. **自我批評。** 交付前寫下這章最弱的一幕和原因，例如仍是選擇題、文字過多。能修就修；修不了的寫進回報，不要藏起來。
8. **更新進度表，然後 commit。** 進度表照實寫驗證了什麼、沒驗證什麼，例如「reduced-motion 僅程式邏輯檢查」。commit 訊息沿用 `feat(proofs): build chapter N "<英文章名>"`。

## 程式上的坑

- **樣式預算。** `angular.json` 規定單一 component 的樣式超過 4 kB 會警告，超過 8 kB 會讓 build 失敗。一章的共用樣式放一個小檔（例如 `chN/chN.scss`），各幕自己的樣式另外拆檔，在 `styleUrls` 疊上去。拆之前先刪掉沒用到的規則。
- **舊提示要清掉。** 錯卡提示通常存在幕裡的 signal。記得在 `app-pf-board` 綁 `(changed)="hint.set(null)"`，不然學習者已經走了下一步，舊提示還掛著。
- **數字快捷鍵只有 10 個。** 卡片的數字鍵依 `ALL_CARDS` 的順序和該幕的 deck 編號，第 11 張以後沒有數字鍵。在 `ALL_CARDS` 插入新卡時，要確認舊章節各幕的快捷鍵仍然合理。

## 驗證時的坑

驗收項目以 AGENTS.md 第 6 點和 LEARNING_DESIGN §13 為準。以下是這門課實際操作時會遇到的事：

- 用 `.claude/launch.json` 的 `math-self-learn-dev` 啟動 dev server（port 4200），不要用 shell 常駐 `ng serve`。
- chapter 的 lazy chunk 很大。每次切到一幕，都要等 `.proofs-lesson` 出現才操作或截圖；只看到頂部 app shell 不算載入完成。
- 改檔案後 HMR 常把該幕狀態清回初始畫面。改完從頭再走一次流程，不要誤以為互動壞了。
- 瀏覽器窗格在背景時，截圖常截到 `pf-rise` 淡入動畫的一半。等一下再截，不要憑那張圖判斷版面。
- 幕的完成狀態和骨架卡複習都存在 localStorage（`math-self-learn-progress`）。要重看第一次進來的畫面，得先清掉該章的進度。
- 主題也存在 localStorage（`math-self-learn-theme`）。驗證時切過淺色或深色，結束前切回原本的設定。
- reduced motion：`proofs-shell.scss` 的 `.pf-root` 規則會關掉 CSS animation 和 transition。新的動畫如果不是靠 CSS（例如 `requestAnimationFrame`），要自己判斷 `prefers-reduced-motion`。
- 本機專用的截圖或 DevTools Protocol 操作細節，記在不進版控的 `CLAUDE.local.md`（如果有的話）。
- 結束時停掉 dev server，確認 4200 沒有程式在聽。

## 維護這份 skill

- 只記流程和坑。教學原則、文案規範、課程決定寫回那三份文件。
- 某個坑已經在程式裡修掉，例如提示改成由板子自己清，就刪掉那一條。
- 寫在這裡的檔名或指令不再成立時，當場改掉。
