# Rings & Ideals — 課程規畫

## 課程定位

這是 Group Theory Foundations（Ch1–32）之後的獨立課程，不接續原課章號。

本課不把 ring 當成「再多背一組公理的 group」，也不急著把 fields、polynomial techniques 和 Galois theory 一起教完。核心問題是：

> 當 addition 與 multiplication 同住一個世界，哪些差異可以安全地視為零？

整門課的 north star：

> Ring 讓我們同時相加與相乘；ideal 是能承受整個 ambient ring 乘法作用的差異；quotient ring 則把這些差異壓成零，而且不破壞兩種 operations。

依 2026-08-13 對 Ch11–15 重寫版的重新審核，建議全課收束為 **18 章**，每章約 3–6 個單一-insight screens。章數不是完成度指標；若一個畫面必須同時解釋兩個新機制就拆節，若後段只是在補名詞則刪章，不為湊滿 20 章犧牲主線。

## 本課採用的 conventions

主線先使用 **commutative rings with identity**，ring homomorphism 預設 preserve identity。這些假設要在 UI 中持續可見，不藏在註腳。

- Matrices 會用來顯示 noncommutative ring 的存在，但 left／right ideals 放在選修深挖。
- Ideal 不要求包含 ambient ring 的 `1`；若包含 `1`，它就是整個 ring。
- Polynomial rings 會作為 recurring examples，但 polynomial techniques 與 field construction 留到下一門課。

這個選擇不是宣稱所有教材都採同一 convention，而是避免學習者在尚未建立 ideal 直覺前，同時負擔 identity-preserving、non-unital、left/right ideal 等分歧。

## 全課概念主線

```text
兩種 operations
      ↓ distributivity 使兩者相容
multiplication 不一定可逆，也可能抹去資訊
      ↓
maps 的 collision differences 會吸收 ambient multipliers
      ↓
ideal
      ↓ 把 ideal 中的差異視為零
quotient ring
      ↓ universal property 與 kernel–image factorization
quotient correspondence / two-stage quotient
      ↓ paired quotient views
intersection、sum 與 CRT coordinates
      ↓ 反看 quotient 中的乘法行為
field ↔ maximal ideal；domain ↔ prime ideal
      ↓
diagnostic capstone
```

`Ideal` 不以定義卡開場。學習者會先在 kernel 的「看不見差異」中發現 absorption，再替它命名；之後 quotient ring 會回答這個條件為何恰好必要。

---

## Part I · 兩套 operations 如何共存

### Ch1 · 一個世界，兩種合成方式

**唯一核心 insight：** addition 與 multiplication 在同一批 objects 上扮演不同角色；ring 研究的是兩者如何共同運作。

- 先用 integers、clock arithmetic、functions 的同物件雙操作切換。
- 不列完整 axioms，不介紹 ideals、domains、fields。
- 觀念圖卡：**不是兩個互不相干的 machines，而是同一世界的兩種組合方式。**

### Ch2 · Distributivity 是同步齒輪

**唯一核心 insight：** multiplication 作用在一個 sum 上，必須和分別作用後再相加得到同一結果。

- 主要互動：在 `a(b+c)` 與 `ab+ac` 兩條路徑間同步拖動同一批 objects。
- `a(b+c)=ab+ac` 在兩邊 visual outcome 重合後才出現。
- Associativity、identity 等條件不在本章順帶巡禮。

### Ch3 · 什麼條件才撐得住這個世界？

**唯一核心 insight：** ring contract 是為了讓 addition 能撤銷、multiplication 能連續組合，且兩者由 distributivity 相容。

- 用 ring detector 逐項測試，而不是先展示公理牆。
- Identity 與 commutativity 以可切換 badges 顯示哪些是本課 convention、哪些不是所有定義都要求。
- Examples 只負責測 detector，不在此建立 domains／fields taxonomy。

### Ch4 · 有些乘法可以 undo

**唯一核心 insight：** unit 是「針對某個 element 可逆」，不是整個 ring 都像 field。

- 互動：為 element 尋找 multiplier，使 product 回到 `1`。
- 比較 `ℤ` 與 `ℤ/nℤ` 中 units 的分布。
- 不同時正式教 zero divisors；先讓「可逆是局部性質」站穩。

### Ch5 · 非零也可能把資訊乘沒

**唯一核心 insight：** zero divisor 讓 multiplication 出現 collision，因此 cancellation 可能失效。

- 先讓學習者預測 `ab=ac` 是否能推出 `b=c`，再在 modular ring 中製造反例。
- 同步顯示 multiplication map 的兩個 inputs 落到同一 output。
- Nilpotent 作為「反覆相乘最後落到零」的選修深挖，不在主流程再開一條 taxonomy。

## Ch1 詳細 storyboard · 一個世界，兩種合成方式

### 全章設計句

```text
核心 insight：
Ring 不是兩個對稱的 groups 疊在一起；addition 提供可撤銷的底層座標，multiplication 是住在同一批 objects 上、但不保證可撤銷的第二種 composition。

學習者原本可能怎麼誤解：
1. Ring 只是「可以做加減乘除的數」。
2. Addition 與 multiplication 地位完全對稱，所以每個非零 element 都應該能除回去。
3. `+`、`×` 的字形本身就是 operation，而不是由 world 指定的 pair-to-output rule。

第一個具體問題：
同一對 residues 4、4 留在同一個六格 clock world 中，只切換 operation，為什麼會分別抵達 2 與 4？

全章主要視覺模型：
同一組 object nodes 永遠留在中央；ADD 與 MULTIPLY 是疊在這組 nodes 上的兩層 wiring。切換 operation 只換 wiring，不換 world。

全章保持不變的東西：
objects、ambient world 與 input pair 不變；改變的是用哪一條 binary-operation rule 合成它們。

正式內容放在哪個展開層：
只預告 `(R,+,·)` 與 binary operation `R×R→R`。完整 ring axioms、identity convention 與 commutativity 到 Ch3 才正式整理。

最後如何檢查能否遷移：
把 objects 換成 functions 後，能否仍辨認「同一個 set、兩種 operations」，而不把 function values 誤認為 ring elements？
```

### 1.1 · 同一對 objects，可以走兩條不同 routes

**本節設計句：** 學完後，學習者應能直覺看見 operation 是「從一對 inputs 決定一個 output 的規則」；world 不變，切換規則就可能改變終點。

```text
預測：
在 ℤ/6ℤ clock 上固定 inputs 4、4。先不顯示 wiring，讓學習者分別指出 ADD 與 MULTIPLY 會抵達哪個 node。

操作變數：
- input a、b：點擊或鍵盤選擇 0–5
- operation layer：ADD / MULTIPLY
- reveal / reset

主要視覺：
中央只畫一個六節點 clock。兩張半透明 wiring layers 共用同一組 nodes：
- ADD：solid parallel tracks，標記 `a+b`
- MULTIPLY：double-line branching tracks，標記 `a·b`
顏色之外，同時用線型、operation icon 與文字 label 區分。

因果：
切換 operation 時 inputs 不移動；只有 active wiring 改變，output marker 沿新 route 抵達另一 node。

Invariant：
ambient set 始終是同一個 ℤ/6ℤ，兩種 outputs 都沒有逃離 world。

動態 readout：
顯示目前的完整敘述，例如「同一對 inputs (4,4)：ADD 抵達 2；MULTIPLY 抵達 4」，不是只顯示兩條算式。

觀念圖卡：
Operation 不是符號外觀；它是這個 world 指定的 pair → output rule。

遷移檢查：
改成 inputs 5、5，先預測兩條 routes 是否仍會抵達同一 node。

正式展開：
二元運算（binary operation）是 map `R×R→R`；本節只說 closure meaning，不列 ring contract。
```

**擁擠檢查：** 本節不解釋 modular arithmetic 的完整理論；clock arithmetic 已是前課可回顧素材。本節也不談 distributivity 或 inverses。

### 1.2 · Addition 與 multiplication 並不承諾同樣的 undo

**本節設計句：** 學完後，學習者應能預測：在 integers 中，固定加上一個數只是平移整條 lattice；固定乘上一個數可能留下 gaps，因此未必能在原 world 內撤銷。

```text
預測：
在 integer lattice 上，對所有 x 執行「+2」或「×2」。哪一台 machine 能讓每個 integer output 都找到 integer input？

操作變數：
- machine：`x↦x+2` / `x↦2x`
- forward / undo overlay

主要視覺：
同一條帶有 fading edges 與 ellipses 的 integer rail，上下疊兩層 mapping arrows：
- addition layer 把整格 lattice 平移，output sockets 全被填滿
- multiplication layer 把 lattice 間距拉成兩倍；odd output sockets 留白

因果：
切換 machine 後，所有 input arrows 同步更新。按下 undo overlay 時，畫面嘗試把 outputs 拉回 inputs；`+2` 可用 `−2` 全部還原，`×2` 面對 odd target 時則顯示所需 input 不在 `ℤ`。

Invariant：
兩台 machines 都把 integer inputs 送到 integers；差別是 global undo 是否由 ring contract 保證。

動態 readout：
即時指出目前 target 是否有 integer preimage，以及 proposed undo 是否始終留在 `ℤ`；有限 viewport 只作顯示，文字明示 integer rail 向兩端延伸。

觀念圖卡：
Addition 的 undo 是底層承諾；multiplication 的 undo 是額外成就，不是 ring 的入場券。

遷移檢查：
用一個短判斷題檢查：「multiplication 不保證可逆」是否等於「multiplication 永遠不可逆」；以 `x↦1x` 作立即反例，不再開第二組 exploration controls。

正式展開：
Additive inverse 的正式語句；unit 與 zero divisor 只標為 Ch4／Ch5 將回答的問題，不在本節定義。
```

**擁擠檢查：** 本節只建立兩套 operations 的不對稱性。刻意不提供 multiplier slider，也不展示 `×0` 的 collision；surjective、injective、unit、zero divisor 等名稱不進主流程。

### 1.3 · Ring elements 不一定是單一數字

**本節設計句：** 學完後，學習者應能把一整個 function 視為一個 element，並看見 addition 與 multiplication 都能在同一個 function world 中逐點運作。

```text
預測：
給兩張 function strips f、g，各自在 A、B、C 三個 inputs 上有 integer values。問 `f+g` 的一個 element 是「某個高度」還是「整張新 function strip」？

操作變數：
- 拖動 f(A..C)、g(A..C) 的小範圍 integer values
- operation layer：pointwise ADD / pointwise MULTIPLY
- highlight one input / show all inputs

主要視覺：
左右是完整的 f、g function cards，中間 operation port，右側生成一張完整 output function card。三個 vertical lanes 同步運算，但外框把整張 card 標成一個 element。

因果：
只拖動 f(B) 時，output 的 B lane 立即更新；A、C lanes 保持不變。切換 operation 後，同一對 function cards 產生另一張 output card。

Invariant：
inputs 與 output 始終都是 `{A,B,C}→ℤ` 的 functions；operation 改變，不會把 object type 變成單一數字。

動態 readout：
同步顯示 `h(B)=f(B)+g(B)` 或 `h(B)=f(B)g(B)`，並標記「h 整張 card 才是一個 ring element」。

觀念圖卡：
Ring 描述 operations 的結構，不限定 elements 必須長得像 numbers。

遷移檢查：
給第三張 output card，要求判斷它來自 pointwise ADD 還是 MULTIPLY，並指出一個可驗證的 lane。

正式展開：
Function ring 的 pointwise operations；完整 proof that axioms hold 放 Ch3 的 optional example audit。
```

**擁擠檢查：** 只使用離散三點 functions，避免同時引入 continuous graphs、composition 或 polynomial convolution。

### 1.4 · 兩條 closed rules 還不自動成為 ring

**本節設計句：** 學完後，學習者應能指出：確認兩種 operations 都留在同一 world 只是起點，尚未回答它們是否彼此相容。

```text
預測：
若某個 finite world 上的 ADD 與 MULTIPLY 都能對每對 inputs 產生 world 內 output，這樣就足以稱為 ring 嗎？

操作變數：
- 把「same objects」「two pair-to-output rules」「both closed」「compatible?」四張 evidence cards 拖入 ring candidate board
- 選擇 verdict：足夠 / 還缺一條連接兩層的證據

主要視覺：
本章累積的同一組 nodes 與雙 wiring layer縮成一張 model。兩層各自亮起後，中間仍留一個未接上的 gear socket；不是在此揭示公式，而是讓 missing relationship 可見。

因果：
放入前三張 evidence cards，只會點亮兩個 operation layers；只有「compatible?」位置仍保持 open。選擇「足夠」時，feedback 指出目前只知道兩台 machines 各自輸出，尚未測過混合路徑。

Invariant：
本章已確認的內容不被推翻：同一 world、兩種 operations、不同 roles。未知的只有兩層如何同步。

觀念圖卡：
Ring 不是兩張 operation tables 的堆疊；兩層之間還需要一條 compatibility law。

遷移檢查：
讓學習者用一句話選出下一章真正要比較的東西：「兩條只用 ADD 的路」或「一條先 ADD 再 MULTIPLY、另一條先 MULTIPLY 再 ADD」。

正式展開：
只預告 distributivity（分配律，distributivity）的英文名稱；公式與 two-route derivation 留到 Ch2。
```

**擁擠檢查：** 本節是 tension 與壓縮，不偷教 Ch2。沒有 operation-table 公理測驗，也不提前列完整 ring definition。

### Ch1 畫面與實作約束

- **建議 4 screens，不合併。** 1.1 建 operation rule、1.2 建不對稱性、1.3 打破 number-only 誤解、1.4 留下 compatibility question；任何兩節合併都會同時承擔兩個 misconception。
- 主桌面採約 `60/40` stage + explanation layout；互動 stage 優先占寬，不把四張等寬文字卡塞進首屏。
- 全章沿用同一 ADD／MULTIPLY semantic styling；ADD 使用 solid parallel line，MULTIPLY 使用 double／branched line，不能只靠藍橘配色。
- 動畫只表達 output routing、lattice transform 與 function-lane update；提供 reset，並在 `prefers-reduced-motion` 下改為 instant state transition。
- 所有 controls 可用鍵盤完成；SVG 提供會隨 state 更新的 accessible label；動態 verdict 使用 `aria-live`，但 slider 拖動不逐 frame 洗版。
- 本章不需要 3D。2D 疊層能同時保留 shared objects 與兩套 wiring，使用 3D 反而會增加遮擋。

### Ch1 完成驗收

在不打開任何正式展開內容時，學習者應能回答：

1. 為什麼同一對 objects 切換 operation 後會有不同 output？
2. 為什麼 ring 不保證 multiplication 像 addition 一樣處處可逆？
3. 為什麼 functions 也能成為 ring elements？
4. 為什麼「兩種 operations 都 closed」還不足以完成 ring 的概念？

若任何答案只能靠背 `R×R→R` 或 ring axioms，而不能指回本章的可操作模型，本章就還不算完成。

## Ch2 詳細 storyboard · Distributivity 是同步齒輪

### 全章設計句

```text
核心 insight：
固定一個 multiplier 時，multiplication 必須尊重 addition 組好的結構；「先合再作用」與「先作用再合」不能走到不同 output。

學習者原本可能怎麼誤解：
1. Distributivity 只是小學展開括號的計算口訣。
2. 只要 ADD 與 MULTIPLY 各自 closed，它們自然就會 distribute。
3. `a(b+c)=ab+ac` 只因 multiplication 是 repeated addition，換成 functions 等抽象 objects 就失去意義。

第一個具體問題：
同一塊 `a × (b+c)` tile board，先切開再複製與先複製再拼接，是否會留下完全相同的 cells？

全章主要視覺模型：
兩條同步 routes 共用相同 inputs 與 final output：上路先 ADD 再由固定 multiplier 作用；下路先分別作用，再 ADD。路徑中間 states 不同，但 endpoint 必須重合。

全章保持不變的東西：
ambient world、inputs `a,b,c` 與 fixed multiplier `a` 不變；只改變 operations 的執行順序。

正式內容放在哪個展開層：
Left／right distributive laws、三個 universal quantifiers，以及 commutative rings 中兩側如何對應。完整 ring definition 仍留到 Ch3。

最後如何檢查能否遷移：
把 number tiles 換成 function cards 後，能否在每條 input lane 預測兩條 routes 仍會重合，並說明這不是幾何面積的巧合？
```

### 2.1 · 一整塊作用，和切開後分別作用，沒有多出或漏掉 cells

**本節設計句：** 學完後，學習者應能從同一批 cells 看見 `a(b+c)` 與 `ab+ac` 是同一塊 rectangle 的兩種分組，而不是兩次互不相關的算術。

```text
預測：
先顯示寬度分成 b、c 的一列 tiles。把整列複製 a 次之前，讓學習者預測：先把 b、c 合起來再複製，和兩段各自複製再拼回，會不會有不同 cell count？

操作變數：
- a：rows 1–5
- b、c：兩段 widths 1–6
- route：WHOLE FIRST / SPLIT FIRST
- step / replay / reset

主要視覺：
同一個 tile board，不畫兩張彼此獨立的答案圖：
- WHOLE FIRST 先將 b、c bracket 成一條長 strip，再複製 a 層
- SPLIT FIRST 先把兩種紋理的 strips 各複製 a 層，再沿 seam snap together
每顆 cell 保留 identity mark，最後以一對一 overlay 對齊。

因果：
切換 route 只改變 grouping sequence；cell identities、兩段寬度與總 board footprint 不變。

Invariant：
左紋理始終有 `ab` cells，右紋理始終有 `ac` cells，總 cell set 沒有增加或消失。

動態 readout：
不是只顯示 `a(b+c)=ab+ac`，而是同步列出「whole route 使用哪些 cells」「split route 如何把同一批 cells 分包」。

觀念圖卡：
Distribute 不是把括號擦掉；它是把同一個作用送進 sum 的每個分支。

遷移檢查：
只改 seam 位置、保持 `b+c` 不變，先預測 total area 與兩側 subareas 哪些會變。

正式展開：
在 visual overlay 完成後，才把 cell conservation 壓縮成 `a(b+c)=ab+ac`。
```

**擁擠檢查：** 本節只用正整數 tiles 建立第一個 mechanism，不處理 negatives、modular wraparound、right distributivity 或 ring axioms。

### 2.2 · Distributivity 真正比較的是兩條 mixed-operation routes

**本節設計句：** 學完後，學習者應能在沒有 rectangle 的情況下，沿兩條 operation routes 計算中間 states，並以 endpoint 是否相同判斷 distributivity。

```text
預測：
在 `ℤ/6ℤ` 固定 a=4、b=2、c=3。先讓學習者各自預測：上路 `b+c → a·(b+c)` 與下路 `a·b, a·c → ab+ac` 最後會停在哪個 residue。

操作變數：
- residues a、b、c
- active route：WHOLE / SPLIT / BOTH
- step forward / reset

主要視覺：
延續 Ch1 的同一六節點 clock，但這次上方是一條 ADD→MULTIPLY pipeline，下方是一條 parallel MULTIPLY→ADD pipeline。兩條 routes 共用 start cards，final sockets 疊在同一 clock node 上。

因果：
每按一步只點亮一個 operation；中間 outputs 沿 wiring 成為下一步 inputs。選 BOTH 時同步播放，最後才出現 SAME ENDPOINT stamp。

Invariant：
兩條 routes 使用完全相同的 a、b、c；不同的只是先 combine 哪一層。

動態 readout：
完整顯示兩條 histories，例如 `2+3→5→4·5→2` 與 `4·2→2, 4·3→0, 2+0→2`，避免相同 endpoint 掩蓋不同 path。

觀念圖卡：
Distributivity 是 route equality：中間可以不同，endpoint 不可分岔。

遷移檢查：
提供一組只看 final outputs 的紀錄，要求學習者補出其中一條缺失的 middle state，確認不是只會比較答案。

正式展開：
`m_a(x)=ax` 的記法可放 secondary layer，將公式讀成 `m_a(b+c)=m_a(b)+m_a(c)`；暫不命名 additive homomorphism。
```

**擁擠檢查：** 本節只回答「如何看兩條 routes」。不列所有 ring axioms，也不掃描所有 triples；universal promise 留到 2.3。

### 2.3 · 兩種 operations 都 closed，仍可能接壞中央齒輪

**本節設計句：** 學完後，學習者應能用一個分岔 witness 推翻 distributivity，並理解 closure 與 compatibility 是兩項獨立檢查。

```text
預測：
在三元素 world 中，ADD 與 MULTIPLY 原本使用 modulo-3 tables。現在只把 multiplication table 的 `(0,0)` output 從 0 改接成 1；所有 outputs 仍是 0、1、2。問「兩條都 closed」是否足以保證 distribute。

操作變數：
- wiring：CORRECT / MISWIRE `(0,0): 0→1`
- TEST CLOSURE / TEST MIXED ROUTES
- reset

主要視覺：
左側顯示 3×3 multiplication table，唯一被改動的 cell 有 old／new output 標記。右側沿用 2.2 two-route machine，固定 witness `a=b=c=0`；correct wiring endpoints 對齊，miswire 則分成兩個有文字標記的 output sockets。

因果：
切換那一格 wiring 不改 objects、ADD table 或 closure badge；只有使用到 `(0,0)` 的 mixed route 被改寫，endpoint 因而分岔。

Invariant：
兩條 operations 始終 closed。這讓失敗只能歸因於 inter-operation compatibility，而不是 output 逃出 world。

動態 readout：
Closure test 顯示 9/9 table cells 仍在 world；mixed-route test 顯示 witness 的兩條完整 histories。展開層可提供 27 triples scan，但主流程不再堆 scanner controls。

觀念圖卡：
Closure 管每台 machine 的邊界；distributivity 管兩台 machines 交錯時是否一致。

遷移檢查：
問「證明 distribute 與推翻 distribute 各需要什麼 evidence？」答案是 universal reason／完整 finite scan，對上一個 mismatch witness。

正式展開：
列出 miswired table 的一個 algebraic mismatch；明說這個反例不是 ring，只用來隔離 distributivity 的必要性。
```

**擁擠檢查：** 本節不引入新的 operation formula，也不檢查 associativity、identity 或 inverses。它只改動一個 closed output，隔離 compatibility failure。

### 2.4 · 換成 functions，固定 multiplier 仍要尊重每一條 addition lane

**本節設計句：** 學完後，學習者應能把 distributivity 從 number tiles 遷移到 function elements，並在逐點 lanes 中指出兩條 routes 為何同步。

```text
預測：
沿用 Ch1 的三點 function cards f、g，加入固定 multiplier h。先問：`h(f+g)` 與 `hf+hg` 是只需某一個 input lane 相同，還是整張 output function 都必須相同？

操作變數：
- focus lane A／B／C
- 調整目前 lane 的 `f(x)` 值
- route：WHOLE / SPLIT / overlay

主要視覺：
上、下兩條 function-card pipelines 共用三張 input cards。每條 lane 各自跑 Ch2 的 two-route pattern；右端兩張 output cards 可 overlay。任何一條 lane 不同，整張 card 顯示 NOT SAME FUNCTION。

因果：
調整目前 lane 的 `f(x)` 只更新該 lane 的兩條 routes；其餘 lanes 不動，而且兩端仍同步。這使「pointwise」與「整張 function 才是一個 element」同時可見。

Invariant：
兩條 routes 使用相同 f、g、h；每個 input x 都比較 `h(x)(f(x)+g(x))` 與 `h(x)f(x)+h(x)g(x)`。

動態 readout：
聚焦 lane 顯示完整 numeric route；whole-card verdict 另外顯示 3/3 lanes aligned，避免把一個 lane sample 說成 functions 相等。

觀念圖卡：
Distributivity 不是 rectangle 的特權；它要求 multiplication action 保留 addition structure。

遷移檢查：
切到另一條 lane，要求先預測兩條 routes 的 numeric endpoint，再 overlay 整張 output card，回扣 Ch1 的「整張 card 才是一個 element」。

正式展開：
Pointwise derivation 放展開層。Right distributivity 與 noncommutative rings 的左右差異另放第二個 details，不進主流程。
```

**擁擠檢查：** 本節不介紹 polynomial multiplication、matrix multiplication 或 homomorphism 術語。只使用 Ch1 已建立的 function cards完成一次真正遷移。

### Ch2 畫面與實作約束

- **維持 4 screens。** 2.1 建 concrete cell conservation；2.2 抽象成 two-route equality；2.3 隔離 compatibility failure；2.4 證明模型能離開 numbers。合併任兩節都會把 mechanism、boundary 或 transfer 混在同一畫面。
- Two-route visual 必須跨 2.2–2.4 保持相同 reading direction：WHOLE route 在上、SPLIT route 在下，final sockets 在右側對齊。
- 2.1 的 tile identity 不能只靠顏色；使用紋理、seam、row／column coordinates。2.2–2.3 的 SAME／SPLIT 必須有 endpoint labels 與實線／分岔形狀。
- 動畫提供 step、replay、reset；reduced motion 下直接切換離散 states，不用 moving particles 代替 reasoning。
- `SCAN ALL 27` 是有限 model 的 exhaustive evidence；UI 必須明示它不是一般 ring 的 proof 方法。
- 本章不需要 3D。核心是兩條 route 的同步與 overlay，2D 能提供更低的追蹤成本。

### Ch2 完成驗收

在不打開 formal layer 時，學習者應能回答：

1. 為什麼 distributivity 不是單純「去括號」？
2. 兩條 routes 的哪些資料相同、哪些中間 states 可以不同？
3. 為什麼兩種 operations 都 closed 仍不足以保證 distributivity？
4. 為什麼 function elements 也能談 distributivity？

若學習者只能背 `a(b+c)=ab+ac`，卻無法畫出 WHOLE／SPLIT routes、找出 mismatch witness 或遷移到 function lanes，本章就還不算完成。

## Ch3 詳細 storyboard · 什麼條件才撐得住 ring world？

### 全章設計句

```text
核心 insight：
Ring contract 是不對稱的三層結構：addition 是可交換、可撤銷的底層 group；multiplication 能穩定合成但不保證 undo；distributivity 把兩層鎖成同一個世界。

學習者原本可能怎麼誤解：
1. Ring 就是兩個 groups 疊在一起，所以非零 elements 應該都有 multiplicative inverse。
2. Ring axioms 是一張彼此無關的條件清單。
3. Multiplication 的 commutativity 與 identity 在所有教材中都有同一 convention。
4. `a·0=0` 是額外背下來的 multiplication rule。

第一個具體問題：
如果 addition 與 multiplication 共用同一批 objects，哪些 undo 能力是整個 world 必須保證的，哪些只能由個別 element 額外擁有？

全章主要視覺模型：
一張三層 ring blueprint：最下層是可雙向移動的 ADD rail；上層是可連接、可重新分組的 MULTIPLY chain；中間是 Ch2 建立的 distributive gearbox。不同 promises 不畫成等價卡片，而放在真正承擔它們的 layer。

全章保持不變的東西：
同一批 elements 同時住在兩層 operations 中；每次只檢查某一層提供的能力，或兩層之間的 compatibility。

正式內容放在哪個展開層：
本課採用的 unital ring definition、完整 quantifiers、left／right distributivity，以及其他教材可能不要求 `1` 的 convention 差異。

最後如何檢查能否遷移：
面對 `ℤ`、`ℕ` 與 `M₂(ℤ)`，能否指出它們在哪一層通過或失敗，並分開「是不是 ring」與「是否落在本課預設的 commutative lane」？
```

### 3.1 · Addition 是整個 ring 的可撤銷座標底盤

**本節設計句：** 學完後，學習者應能看見 ring 的 addition 已經是一個完整 abelian group，因此任意 additive difference 都能在同一 world 內表達與撤銷。

```text
預測：
在 integer rail 上任取 start a 與 target b，要求找出唯一 shift x 使 `a+x=b`。問這個 solver 是否應對每對 a、b 都有 in-world answer。

操作變數：
- start a、target b
- SOLVE DIFFERENCE / APPLY / UNDO
- swap inputs

主要視覺：
一條向左右延伸的 ADD rail。a 到 b 的 directed displacement 被包成一張 element card `x=b−a`；按 undo 時，同一張 card 翻向 `−x`，整條 route 回到 a。

因果：
拖動 target 時，difference card 即時更新；不論 direction，solver 都在 `ℤ` 中找到 element。Swap a、b 會讓方向反轉但不破壞 reachability。

Invariant：
ADD route 始終能停在 0、合成 shifts、反轉任意 shift，且先後相加不改總 displacement。

動態 readout：
同步顯示 `a+x=b`、`x=b−a` 與 return route `b+(−x)=a`，但主文不重新逐條教授 group axioms。

觀念圖卡：
Addition 不只「可以算」；它讓 ring 裡的 differences 永遠可以被表示與撤銷。

遷移檢查：
把 world 暫時裁成 nonnegative integers，選 a>b，讓 solver 顯示 missing difference；問缺少的是 closure、zero 還是 additive inverse。

正式展開：
回扣 Group Theory Foundations：`(R,+)` 必須是 abelian group。Associativity、0、additive inverse、commutativity 的完整語句放 details。
```

**擁擠檢查：** 本節把 group axioms 視為已學能力，不做五張定義卡巡禮。`ℕ` 只作一次 failure transfer，不引入 semiring taxonomy。

### 3.2 · Multiplication 能穩定串接，但 ring 不保證每一步都能倒帶

**本節設計句：** 學完後，學習者應能預測 multiplication 必須容許穩定 composition 與 identity `1`，卻不需要替每個 nonzero element 提供 inverse。

```text
預測：
給 multiplication promises「output 留在 world」「括號不改結果」「有 do-nothing element 1」「每個 nonzero 都能 undo」，要求選出哪些是本課 ring contract、哪張是額外能力。

操作變數：
- multiplication chain factors 2、3、4 的順序固定
- grouping：`(2·3)·4` / `2·(3·4)`
- insert / remove identity 1
- TRY UNDO ×2

主要視覺：
一條 MULTIPLY tape，不使用與 ADD rail 相同的雙向箭頭：factors 是串接 blocks，括號只改 compiler frame；identity block 透明通過。TRY UNDO ×2 時，integer socket 顯示需要 `1/2`，位於 world boundary 外。

因果：
切換 grouping 不更換 factor order，endpoint保持 24；插入 1 不改 endpoint；嘗試 undo ×2 則只顯示「contract 未承諾」，不把整台 machine 判成故障。

Invariant：
Multiplication output 留在 ring、ordered chain 可重新分組、1 不改 element；不存在 universal inverse promise。

動態 readout：
Contract panel 只亮起 closure／associativity／identity；inverse socket 使用 `OPTIONAL ELEMENT ABILITY` 標籤，而不是紅色 failure。

觀念圖卡：
Multiplication 的 undo 是某些 elements 的能力，不是所有 ring elements 的基本權利。

遷移檢查：
比較 ×1、×(−1)、×2：前兩者可在 integers 中 undo，後者不行；判斷「不保證」與「永遠沒有」的差別。

正式展開：
本課把 multiplicative identity `1` 納入 ring convention。Unit 的正式定義延到 Ch4；zero divisor 延到 Ch5。
```

**擁擠檢查：** 不在本節介紹 units 的分類、cancellation 或 fields。Commutativity 也不和 chain behavior 混講，留到 3.3 的 scope badge。

### 3.3 · Ring blueprint 不是 axiom wall：三個 modules 各有工作

**本節設計句：** 學完後，學習者應能把每項 ring promise 放回 ADD backbone、MULTIPLY chain 或 DISTRIBUTIVE gearbox，而不是背一列沒有因果的公理。

```text
預測：
將「additive inverse」「multiplicative associativity」「distributivity」三張 capability chips 放進 blueprint 前，先選擇它們各自應接到哪一層。

操作變數：
- 依序裝入 ADD BACKBONE / MULTIPLY CHAIN / DISTRIBUTIVE GEARBOX
- temporarily disconnect one module
- scope badge：COMMUTATIVE MAIN LANE on/off（只改課程 scope，不改 core detector）

主要視覺：
桌面寬版三層 blueprint：
- 下層 ADD rail：abelian group capabilities 以一個已封裝 module 呈現
- 上層 MULTIPLY tape：closed、associative、identity
- 中層 DISTRIBUTIVE gearbox：直接沿用 Ch2 WHOLE／SPLIT icon
不是九張同尺寸文字卡，而是一台有明確資料流的 machine。

因果：
斷開 ADD module 時 differences 無法完整表示；斷開 MULTIPLY module 時 products 不穩定；斷開 gearbox 時兩層可各自運作，但 mixed routes 可能分岔。

Invariant：
每個 module 只承擔自己的 promises；inverse 不會被錯接到 MULTIPLY，distributivity 也不會被誤當單層 closure。

動態 readout：
每次 disconnect 只顯示喪失的推理能力，例如「無法保證 representative difference 可撤銷」，而不是只報 axiom name。

觀念圖卡：
Ring = additive abelian group + stable multiplication + distributive coupling。

遷移檢查：
給一個 system「兩層都 closed，但 mixed routes 分岔」，要求指出只需檢修哪個 module。

正式展開：
本課正式採用：unital rings，homomorphisms preserve `1`；主線 examples 預設 commutative。其他教材可能省略 `1`，noncommutative rings 仍是 rings，這些 convention 必須明示。
```

**擁擠檢查：** 這一節只做前兩章的結構壓縮，不能再加入 examples carousel。Commutativity 是 persistent scope badge，不展開 domain／field taxonomy。

### 3.4 · `a·0=0` 不是新公理：兩層 contract 已經把它逼出來

**本節設計句：** 學完後，學習者應能直覺看見 distributivity 把 `a·0` 複製成兩份，而 additive cancellation 迫使它只能是 0。

```text
預測：
先把 `z=a·0` 當成未知 output。因 `0+0=0`，比較 `a(0+0)` 的 WHOLE 與 SPLIT routes；問 z 必須滿足哪個 equation。

操作變數：
- candidate z（integer presets −2…2）
- WHOLE / SPLIT / CANCEL ONE COPY
- replay / reset

主要視覺：
沿用 Ch2 two-route machine，但 endpoints 改成可移動的 additive tokens：WHOLE route 留下一顆 z；SPLIT route 留下兩顆 z。Distributivity 將兩邊鎖成 `z=z+z`，接著從兩側同步移除一顆 z，右側只剩 z，左側剩 additive zero。

因果：
選 nonzero z 時 duplication equation visibly unbalanced；按 CANCEL ONE COPY 不是偷偷除法，而是同時加上 additive inverse `−z`。

Invariant：
Whole／split 使用同一個 `z=a·0`；cancellation 兩側執行完全相同的 additive action。

動態 readout：
依序顯示 `z=a(0+0)=a0+a0=z+z`，再顯示 `0=z`。公式跟著 token manipulation 出場。

觀念圖卡：
Zero 會吸收 multiplication，因為 multiplication 必須尊重 additive zero。

遷移檢查：
將 zero 放到左側，判斷 `0·a=0` 需要 right distributivity，或在 commutative main lane 中如何立即得到。

正式展開：
完整 algebraic proof 與 left／right zero versions 放 details。明說 absorption 是 theorem，不列入 ring definition。
```

**擁擠檢查：** 本節只推導 zero absorption，不順帶介紹 zero divisors、nilpotents 或 ideals；「absorb」一詞只描述 0 的結果，ideal absorption 到 Ch8 再正式建立。

### 3.5 · Detector 要分開「ring contract」與「本課預設 lane」

**本節設計句：** 學完後，學習者應能對候選 world 找出決定性 pass／failure witness，並理解 noncommutative 不等於不是 ring。

```text
預測：
先展示 integer matrices 的 `AB≠BA` witness，問這是否足以宣判 matrices 完全不是 rings。

操作變數：
- candidate：`ℤ` / `ℕ` / `M₂(ℤ)`
- RUN DECISIVE TEST
- detector lens：CORE CONTRACT / COMMUTATIVE MAIN LANE

主要視覺：
固定使用 Ch3 三層 blueprint，不做 examples card carousel。切換 candidate 時，只把決定性 witness 送進相關 module：
- `ℤ`：三層通過，commutative badge on
- `ℕ`：ADD solver 遇到 `2+x=1`，缺少 in-world inverse
- `M₂(ℤ)`：core modules 通過，但 `AB`、`BA` 沿 order swap 得不同 matrices，commutative badge off

因果：
切換 detector lens 不改 candidate 的 operations；只改問題是「滿足本課 unital ring contract嗎」或「也符合主線預設的 commutative scope嗎」。

Invariant：
同一個 witness 只影響對應 promise。Matrices 的 order mismatch 不會把 additive backbone、identity 或 distributivity 一起標成失敗。

動態 readout：
Verdict 使用兩行：`RING CONTRACT: PASS/FAIL` 與 `COMMUTATIVE MAIN LANE: IN/OUT`，避免把 scope 與 definition 混成一個紅叉。

觀念圖卡：
先問哪條 promise 失敗，再替結構命名；不要從 object 外觀猜它是不是 ring。

遷移檢查：
給 function world `{A,B,C}→ℤ`，要求選擇真正需要檢查的 operations，而不是因 elements 看起來不像 numbers 就否決。

正式展開：
`ℕ` 可在其他課程被稱為 semiring；此處不展開 taxonomy。矩陣 distributivity 與 identity 的正式 audit 可選讀。
```

**擁擠檢查：** 主流程只使用三個 candidates、每個一個 decisive witness。不新增 integral domain、division ring、field、semiring 的比較表。

### Ch3 畫面與實作約束

- **建議 5 screens，不合併。** 3.1 與 3.2 分別建立兩層不對稱 promises；3.3 才組裝 blueprint；3.4 是第一個由 contract 推出的重要 consequence；3.5 負責 boundary transfer。
- 三層 blueprint 從 3.1 逐步長出，不能到 3.3 才突然換一套視覺。ADD rail 使用雙向 arrows，MULTIPLY tape 使用 ordered blocks，DISTRIBUTIVE gearbox 沿用 Ch2 上下 routes。
- Contract status 除顏色外，使用 connected／open socket、PASS／MISSING、實線／虛線。Noncommutative matrix 只關閉 commutative scope badge，不將整張 blueprint 染成 failure。
- 3.4 cancellation 必須可逐步執行與倒帶；reduced motion 下使用離散 before／after token states。
- 3.5 只執行 decisive witness，不製造看似 exhaustive、實際只是抽樣的 axiom scanner。
- 不使用 3D。Blueprint hierarchy、route coupling 與 token cancellation 都需要正面同步比較，2D 更容易追蹤。

### Ch3 完成驗收

在不打開 formal layer 時，學習者應能回答：

1. 為什麼 addition 與 multiplication 在 ring contract 中不對稱？
2. 哪些 multiplication abilities 是保證，哪個 inverse ability不是？
3. Distributivity 在整份 blueprint 中連接哪兩層？
4. 為什麼 `a·0=0` 不必另列成公理？
5. 為什麼 noncommutative matrices 仍能是 rings，只是不在本課預設的 commutative lane？

若學習者只能背一列 axioms，卻無法把 promise 放回正確 module、解釋 zero absorption，或對近似案例給出 decisive witness，本章就還不算完成。

## Ch4 詳細 storyboard · 有些 multiplication 可以 undo

### 全章設計句

```text
核心 insight：
Unit 不是「比較厲害的數」，而是能找到 multiplicative inverse、使固定乘法成為全世界可撤銷 transformation 的 element。

學習者原本可能怎麼誤解：
1. Ring 裡只要 element 非零，就應該可以除回去。
2. `ab=1` 只是一題局部算式，和 multiplication map 的全域資訊保存無關。
3. Modulo world 中數字越大或越接近 1，越可能是 unit。
4. Units 只是散落的一份清單，彼此之間沒有結構。

第一個具體問題：
在 `ℤ/10ℤ` 中固定 element a，能否找到 partner b，使兩者相乘精確回到 multiplicative identity 1？

全章主要視覺模型：
沿用 Ch3 MULTIPLY tape，增加一個一般化 inverse dock `a·?=1_R`。Concrete residue cards只是 dock 的一種 instance；dock 成功接上後，不只顯示 `ab=1`，整張 multiplication wiring 會同時獲得一條由 b 控制的 reverse overlay，顯示每個 input 都能無損回來。

全章保持不變的東西：
Ambient ring 與 multiplication rule 不變；切換的是目前選到哪個 multiplier，以及它是否具有一張 in-world inverse card。

正式內容放在哪個展開層：
可逆元（unit）、multiplicative inverse 的正式定義、inverse uniqueness、`Rˣ` notation、`ℤ/nℤ` 中的 gcd criterion 與 Bézout proof。

最後如何檢查能否遷移：
把單一 residue 換成一整張 function card 後，能否預測 pointwise unit 必須在每條 lane 都有 inverse，而不是只看其中一個 output？
```

### 4.1 · Unit 是能和某個 partner 一起回到 1 的 element

**本節設計句：** 學完後，學習者應能在 ring world 中尋找 multiplicative inverse，並分開 additive opposite `−a` 與 multiplicative inverse `a⁻¹`。

```text
預測：
在 `ℤ/10ℤ` 中選 a=9，讓學習者先猜 partner 是 additive opposite `−9≡1`，還是另一個 residue；再實際把 partner 接進 identity dock。

操作變數：
- multiplier a：residues 0–9
- partner b：從 residue deck 選擇 0–9
- TEST PRODUCT / reset

主要視覺：
中央先保留一般 dock label `a·?=1_R`；下方的 `ℤ/10ℤ` instance以左右兩列 residue cards選 a 與 partner b，沿 MULTIPLY double-line route 餵入 product machine。按 TEST 後，product card滑向 identity dock；只有 `ab mod 10=1` 時 dock 關閉並顯示 reversible pair。Cards 的位置只代表選擇，不使用角度暗示假的 multiplication geometry。

因果：
切換 b 只改 partner；central product 同步更新。若 product 不是 1，dock 顯示目前抵達的 residue，不用泛稱「錯誤」。

Invariant：
Identity target 始終是 1；inverse question 不是「能否得到某個 output」，而是能否回到 multiplication 的 do-nothing element。

動態 readout：
顯示 `a·b mod 10`、是否 docked，以及 additive opposite `−a` 的另一條 ADD readout，讓兩種 inverse 不因同叫「反元素」而混在一起。

觀念圖卡：
Unit 的 inverse 是回到 1；additive inverse 是回到 0。兩種 undo 不可混用。

遷移檢查：
切到 a=3，看 inverse 變成另一張 card 7；再切到 a=2，看「找不到」是否代表 ring 壞掉。

正式展開：
在 commutative unital ring 中，若存在 b 使 `ab=1`，a 稱為可逆元（unit），b 是 multiplicative inverse。一般 noncommutative ring 要求 two-sided inverse。
```

**擁擠檢查：** 本節只建立 inverse dock 與 0／1 的差異。不解釋為何某些 residues 沒 partner，也不引入 gcd、zero divisor 或 unit group。

### 4.2 · 同一個 element 換了 ambient ring，inverse card 可能進得來或進不來

**本節設計句：** 學完後，學習者應能預測 unit status 取決於 inverse 是否屬於目前的 ring；它不是只看 element 外觀的永久標籤。

```text
預測：
固定 element 2 與 equation `2·b=1`。問同一個 2 在 integers `ℤ` 與 rationals `ℚ` 中，unit verdict 是否必須相同。

操作變數：
- ambient world：`ℤ` / `ℚ`
- element presets：2 / −1 / 0
- REVEAL REQUIRED PARTNER / TEST MEMBERSHIP

主要視覺：
使用 nested world boundary：`ℤ` nodes 在內層，`ℚ` 以更大的 coordinate field包住它。Element card a 固定不動；inverse machine先算出 required partner，再檢查 partner card落在哪一層。對 a=2，`1/2` 位於 `ℚ` 區域但在 `ℤ` boundary外。

因果：
切換 world不改 a、multiplication equation或 required partner；只改哪些 cards被允許接進 dock。切到 `ℚ` 時 `1/2` card不是憑空生成，而是從 outside boundary變成 inside。

Invariant：
Inverse target始終是 1，且 required partner始終滿足同一 equation。改變的是 ambient membership。

動態 readout：
分開顯示 `required partner`、`partner ∈ R?` 與 `unit in current R?`。例如 `2∉ℤˣ`、`2∈ℚˣ`；對 −1 兩邊都成功，對 0 兩邊都沒有 partner。

觀念圖卡：
Unit 是「在這個 ring 裡可逆」；inverse 必須住在同一個 world。

遷移檢查：
問把 world 擴大是否可能讓原本的 unit失去 inverse，以及是否可能讓原本的 nonunit獲得 inverse。

正式展開：
若 unital subring `R⊆S` 共用 identity，`R` 中的 unit仍是 `S` 中的 unit；反向不成立，因 inverse可能只住在較大的 S。Localization 與 fraction field只作未來課程預告，不在此定義。
```

**擁擠檢查：** 本節只建立 ambient-relative reversibility。不介紹 field definition、fraction construction、localization 或 subring unit classification。

### 4.3 · 一張 inverse card 能撤銷整個 multiplication map

**本節設計句：** 學完後，學習者應能從 `ab=1` 預測：先固定乘 a、再固定乘 b，會讓每個 ring element 回到原位。

```text
預測：
在 `ℤ/10ℤ` 固定 a=3、inverse b=7。問只驗證 `3·7=1`，為何足以保證任意 x 經 `×3` 再 `×7` 都回到 x？

操作變數：
- multiplier presets：3（inverse 7）/ 9（self-inverse）/ 4（no inverse dock）
- selected input x 或 SHOW ALL INPUTS
- FORWARD / REVERSE / round trip

主要視覺：
左右兩排 0–9 sockets。Forward wiring 表示 `mₐ(x)=ax`；inverse card 接上後，第二層 reverse wiring 使用 `m_b`。選單一 x 時追蹤一條 round trip，SHOW ALL 時顯示整張 wiring 是否回到 identity arrangement。Forward 使用 double solid lines，reverse 使用帶 UNDO labels 的 dashed arrows。

因果：
`x → ax → b(ax)=(ba)x=x` 的兩段 path 保留完整 middle state。切到 a=4 時 reverse card 消失，部分 output sockets無法指定唯一回程；原因延到 Ch5。

Invariant：
同一張 b card 對所有 x 使用，不是每個 input 臨時找不同 undo recipe。

動態 readout：
單點模式顯示完整 round trip；全域模式顯示 `10/10 returned` 或 `GLOBAL UNDO UNAVAILABLE`，但不把 nonunit 描述成 ring failure。

觀念圖卡：
Unit 的力量是全域的：一個 inverse partner 撤銷固定乘 a 對所有 inputs 的作用。

遷移檢查：
給一張只在某些 inputs 回得來的 wiring，判斷是否足以宣稱 a 是 unit。

正式展開：
由 associativity 與 `ba=1`：`b(ax)=(ba)x=x`。反方向同理。Inverse uniqueness proof 放 details。
```

**擁擠檢查：** 本節只說明 inverse pair 如何升級成 whole-world undo。Wiring 的合流與資訊 collapse 不在此命名，留給 Ch5。

### 4.4 · 在 `ℤ/nℤ`，unit 取決於是否和 n 共用步長

**本節設計句：** 學完後，學習者應能用 `gcd(a,n)` 預測 multiplier a 是否覆蓋全部 residue sockets，並因此判斷 inverse 是否存在。

```text
預測：
在 `ℤ/10ℤ` 比較 a=3 與 a=4。問哪個 multiplier map 能覆蓋所有 residues，而不是問哪個數字「比較接近 1」。

操作變數：
- modulus presets n=8、10、12、15
- multiplier a=1…n−1
- STEP THROUGH MULTIPLES / COMPLETE COVERAGE / reset

主要視覺：
畫面固定標示 `CASE STUDY · ℤ/nℤ ONLY`。使用兩個同步視圖，避免把 `x↦ax` 誤讀成反覆乘 a：左側 input ruler 依序選 `x=0,1,…,n−1`，右側 residue wheel 把 output `ax mod n` 放入 socket。`gcd(a,n)=1` 時 outputs 巡過所有 sockets；共享 factor 時只停在部分等距 sockets。主畫面只保留 visited／unvisited 的形狀與文字狀態，不同 gcd lanes 的完整分解留到展開層。

因果：
每按 STEP，左側 input x 前進一格，右側只新增對應的 `ax mod n` marker。切換 a 或 n 時 coverage 與 inverse dock重設；只有 coverage 達 n/n 時，某個 input x 送到 residue 1，產生 inverse witness。

Invariant：
Ambient clock 有 n 個 sockets；每個 marker 始終有可追溯的 input label x，multiplier map固定是 `x↦ax mod n`。改變的是 a 和 n 共享多少步長結構。

動態 readout：
主 readout 只顯示 `gcd(a,n)`、coverage `visited/n` 與 inverse witness 或 no-dock verdict。`n/gcd(a,n)` 的 distinct-output formula 放 secondary layer，不和核心 criterion競爭。

觀念圖卡：
這是 modular world 的專用 detector：在 `ℤ/nℤ` 中，a 是 unit 當且僅當它和 n coprime。一般 ring 的 unit definition仍是 inverse dock `ab=1`。

遷移檢查：
固定 n=15，先不展開 wheel，要求預測 2、3、5、7 哪些會有 inverse，再用 coverage 驗證。

正式展開：
`a` 是 unit iff `gcd(a,n)=1`。Bézout proof：`ax+ny=1` 在 mod n 中給 `ax≡1`；反向由 common divisor 必須整除 1 得到。`n/gcd(a,n)` 的 coverage count derivation也放 secondary layer。
```

**擁擠檢查：** Gcd 是本節唯一 detector。不介紹 Euler φ、reduced residue system 或 CRT；distinct-output failure 的 mechanism 留給 Ch5。

### 4.5 · 所有 reversible multipliers 自己組成一個 group

**本節設計句：** 學完後，學習者應能預測兩個 units 相乘仍是 unit，因為兩台 reversible multiplication machines 的 composition 仍可倒帶。

```text
預測：
在 `ℤ/10ℤ` 選 unit cards 3 與 9。先問 composite multiplier `3·9≡7` 是否可能突然失去 inverse。

操作變數：
- first unit card、second unit card：從 `{1,3,7,9}` 選擇
- COMPOSE / SHOW INVERSE TAPE / reset

主要視覺：
上層先使用一般 cards `u∈Rˣ`、`v∈Rˣ` 展示 reversible transformations 的 composition；下層 `ℤ/10ℤ` 只提供具體 readout。不是先畫 Cayley table，而是把兩張已具 reverse wiring 的 multiplier cards串成 tape。Forward tape `×u → ×v` 可壓成一張 `×uv` card；按 SHOW INVERSE 時，composite card 翻面顯示它的 inverse，整條 tape回到 identity wiring。

因果：
換任一 unit card時，composite 與 inverse card同步更新。所有 composites 都落回 unit deck；非unit card放在 deck 外作對照，不能進入 reversible tape。

Invariant：
每張 card 本來都有全域 undo；composition 不丟失這份 reversibility。Identity card ×1 與 inverse card仍留在 deck。

動態 readout：
顯示 `u·v mod 10`、composite inverse，以及目前 unit deck仍是 `{1,3,7,9}`。不再加 selected-input control；whole-world reversibility 已在 4.3 建立。

觀念圖卡：
Reversible multiplication machines 對 composition 封閉，因此 units 自己形成 group。

遷移檢查：
把沒有 inverse wiring 的 card 2 放在 deck 外，要求說明它為什麼不能只是「暫時沒有找到 partner」卻仍算 unit。

正式展開：
Unit group（可逆元群）記為 `Rˣ` 或 `U(R)`。Closure、identity、inverse 與 associativity 從 ring multiplication 繼承；一般 rings 的 unit group不必 abelian，inverse tape反序的細節放在此處。
```

**擁擠檢查：** 本節借用已學 group language，不重教 group axioms，也不加入 Euler totient 計數。Cayley table 只可放展開層作核對。

### 4.6 · Function 是 unit，代表每一條 pointwise lane 都能 undo

**本節設計句：** 學完後，學習者應能把 unit criterion 遷移到 function ring：整張 function card 可逆，當且僅當每個 output value 都在 base ring 中可逆。

```text
預測：
在 function ring `{A,B,C}→ℤ/10ℤ` 中，一張 card h 的 A、B lanes 是 units，但 C lane 是 2。問整張 h 是否仍能擁有 pointwise inverse。

操作變數：
- h(A)、h(B)、h(C)：residues 0–9；預設 `[3,9,2]`
- focus lane
- BUILD INVERSE CARD / TEST ALL LANES

主要視覺：
上方先顯示一般 function ring `S^X` 與 criterion「每個 h(x) 都必須落在 `Sˣ`」；下方再用 `S=ℤ/10ℤ` 實例化。延續 Ch1 function cards，每條 lane都有一個 mini inverse dock：values 1、3、7、9 能接上 partner，其他值留下 open socket。右側 inverse function card只有在三條 lanes 全部成功時才完整成形；3↔7 與 9↔9 讓兩種 inverse patterns同時可見。

因果：
改動單一 lane只更新該 lane dock；任一 open socket會使整張 inverse card保持 incomplete。全部完成後，pointwise product card同步變成 constant-1 function。

Invariant：
Function element 是整張 card；inverse 也必須是同 domain 的完整 function，不可只在部分 inputs 定義。

動態 readout：
逐 lane 顯示 `h(x)k(x) mod 10`，whole-card verdict 顯示 `3/3 inverse docks` 或第一個 blocking lane。

觀念圖卡：
Pointwise world 的全域可逆，等於每一條 local lane 都可逆。

遷移檢查：
給兩張只差一條 lane 的 functions，要求在不逐一搜尋 partner 前先判斷哪張是 unit。

正式展開：
對 function ring `S^X`，units 正是所有取值都落在 `Sˣ` 的 functions，因此 `(S^X)ˣ=(Sˣ)^X`。Polynomial 與 matrix units 延到後續課程或 optional notes。
```

**擁擠檢查：** 本節只做一個 function-ring transfer。不引入 polynomial degree、determinant 或 localization。

### Ch4 畫面與實作約束

- **建議 6 screens。** 4.1 建立 inverse dock；4.2 明示 unit 相對於 ambient ring；4.3 揭示 local equation 的 global transformation meaning；4.4 才進入 modular detector；4.5 把一般 units 組成 group；4.6 完成非 number-object 遷移。
- Inverse dock、forward wiring 與 reverse overlay 要跨全章保持同一語法。Forward 用 MULTIPLY double line；reverse 加 arrow direction與 `UNDO` label，不能只換色。4.1 不使用角度或距離暗示 multiplication rule。
- 4.2 nested boundary只能改 membership，不得讓 element 2 或 equation `2b=1` 隨 world切換而改變，否則無法隔離 ambient effect。
- 4.3 預設只追一條 selected-input round trip，避免十條 wires 一開始就形成 spaghetti；SHOW ALL 是學習者主動切換的全域驗證。切到 nonunit 時只顯示 reverse unavailable，不以紅叉暗示 ring contract失敗。合流／collision 可看見但不命名，Ch5 再放大其 mechanism。
- 4.4 必須同步顯示 input ruler x 與 output wheel ax，且每個 output marker保留 x label；coverage animation可 step、complete、reset。Modulus 使用少量 presets，避免動態生成過密 clock labels，並持續顯示 `ℤ/nℤ ONLY`，防止 gcd criterion被錯誤泛化。
- 4.5 主流程先以一般 reversible transformation cards解釋 closure，再用 `ℤ/10ℤ` readout驗證；一般 inverse tape必須反序的細節放 formal layer。
- 4.6 以完整 function-card border顯示 whole-element status；不能只讓三個 lane badges各自亮起，卻沒有整張 card verdict。`S^X` criterion要先出現，`ℤ/10ℤ` 只是可操作 instance。
- 所有 card decks、presets、step controls 與 lane selectors都必須能用鍵盤操作；動態 wiring提供 state-based accessible label。Reduced motion 下使用 endpoint snap與離散 reveal，不依賴移動軌跡本身傳遞答案。
- 本章不需要 3D。Nested boundaries、wiring bijection、coverage wheel、composition tape與function lanes都需要正面可追蹤的 2D 對應。

### Ch4 完成驗收

在不打開 formal layer 時，學習者應能回答：

1. Unit inverse 與 additive inverse 分別回到哪個 identity？
2. 為什麼同一個 2 在 `ℤ` 與 `ℚ` 中可能有不同 unit status？
3. 為什麼 `ab=1` 能撤銷固定乘 a 對所有 elements 的作用？
4. 為什麼 gcd criterion只能直接用在 `ℤ/nℤ`，而不是 unit 的一般定義？
5. 為什麼 units 對 multiplication 自己形成 group？
6. 為什麼 pointwise function 只要一條 lane不可逆，整張 function就不是 unit？

若學習者只能搜尋 `ab=1` 的答案，卻不能把 inverse 解讀為 whole-world undo、預測 modular coverage，或遷移到 function card，本章就還不算完成。

## Ch5 詳細 storyboard · 非零也可能把資訊乘沒

### 全章設計句

```text
核心 insight：
Zero divisor（零因子）不是「乘起來表現古怪的數」，而是會讓固定乘法 map 把不同 inputs 壓成同一 output、因此破壞 cancellation 的 element。

學習者原本可能怎麼誤解：
1. 只要 a≠0，從 ab=ac 就一定可以把 a 約掉。
2. Nonunit 與 zero divisor 是同一件事；不能倒帶就一定曾經壓掉資訊。
3. ab=0 且 a、b 都非零只是 modular arithmetic 的特殊算術巧合。
4. Zero divisor 是 element 單獨攜帶的數值標籤，和 multiplication map 的整體行為無關。

第一個具體問題：
在 ℤ/10ℤ 中，為什麼 4·1 與 4·6 都抵達 4，而「兩邊同除以 4」會把兩個不同 inputs 錯認成相同？

一般機制如何表述：
固定 a，觀察 multiplication map mₐ:x↦ax。若 mₐ 把 b≠c 送到同一 output，則非零 difference d=b−c 被 a 送到 0；反過來，若存在 d≠0 且 ad=0，x 與 x+d 就會 collision。於是 zero-product witness、collision 與 cancellation failure 是同一份資訊的三種表示。

主例子的 accidental properties：
- 在 finite commutative ring 中，每個非零 nonunit 都是 zero divisor；這不是任意 ring 的一般事實。
- ℤ/10ℤ 的 collisions 會形成規則等大的 fibers；一般 ring 不必有同樣整齊的有限排列。
- Commutativity 讓左右 multiplication 與左右 cancellation 看起來相同；本課主線採 commutative convention，但不能把這當成所有 rings 的定義。
- Residue labels 的圓周位置沒有乘法距離或角度意義，因此本章不用 clock geometry 表達 collision。

哪個 non-degenerate state 讓角色真正分開：
固定 element 2，只切換 ambient ring：在 ℤ 中 ×2 是 injective 但不是 surjective，所以 2 是 nonunit、卻不是 zero divisor；在 ℤ/10ℤ 中 ×2 會 collision，所以 2 同時是 nonunit 與 zero divisor。

主要視覺模型：
延續 Ch4 的 multiplication wiring，但把焦點從 reverse overlay 改成 labeled fibers：每個 input card 沿實線進入 output socket；不同 labels 一旦進入同一 socket，socket會展開來源清單。接著把其中一個input重建成`b=c+d`，讓非零difference packet d沿Ch2的distributive two-route進入同一台×a machine；若加入d前後output不變，畫面便直接顯示額外資訊d被送入0 dock。

視覺可能造成的假暗示：
- Wires 合流只表示相同 output，不代表 inputs 在 ring 中真的變成同一 element。
- Input 間的畫面距離不代表 algebraic difference；d 必須由 operation readout 明確計算。
- 缺少 output sockets表示 not surjective；只有來源 collision 才表示 not injective。兩種 failure 不能共用同一個紅色狀態。
- Finite scan 只證明目前有限 instance；一般 equivalence 需要 symbolic argument。

學習者能操作的變數：
- focused case與transfer challenge，不提供無目的的全參數面板
- COLLISION → REBUILD INPUT AS c+d → DISTRIBUTE ×a → ISOLATE ad 的離散步進
- side-by-side ambient worlds：ℤ與ℤ/10ℤ（固定 multiplier 2），只切換inspection lens
- function support witness：先固定f、只建造g；成功後才解鎖f presets
- chapter synthesis 的candidate world與witness起始表示

操作時保持不變的東西：
同一節內 multiplication rule、ambient ring 與 labeled input identities保持不變；5.3兩欄只讓ambient boundary不同，element 2、`x↦2x`與source labels全部對齊。

預測 → 回饋 → 壓縮：
先判斷能否 cancellation；讓兩個不同 labels visibly collision；把兩者差異封裝成非零packet並看見它對output沒有貢獻；最後壓成「zero divisor = multiplication 壓掉非零 difference」。

目前 evidence 屬於哪一種：
5.1 是 WITNESS；5.2 的 symbolic difference route 是 GENERAL ARGUMENT；5.3 的兩個 worlds 是受控 EXAMPLE，ℤ 的一般判斷放 formal argument；5.4 是 transferable WITNESS；5.5 的 synchronized witness translator 是 GENERAL ARGUMENT。

特例 detector 與 course convention 如何持續標示 scope：
凡使用 residue scan均顯示 `INSTANCE · ℤ/10ℤ`。`finite nonzero nonunit ⇔ zero divisor` 只放在 `FINITE COMMUTATIVE RING ONLY` 展開層。全章一般敘述持續顯示 `COURSE SCOPE · COMMUTATIVE UNITAL RINGS`；noncommutative 的 left/right 版本放 formal layer。

正式內容放在哪個展開層：
Zero divisor、injective／surjective multiplication maps、cancellation law 的量詞；collision 與 zero-product witness 的雙向證明；finite ring 中非零 nonunit 與 zero divisor 等價；nilpotent element（冪零元）作為 optional pattern。

最後如何檢查能否遷移：
把 residues 換成 functions X→ℤ，讓兩張都非零但 supports 不重疊的 function cards pointwise 相乘。學習者若能預測 product 是 zero function，便已抓到「不同資訊被 multiplication 壓掉」而非只記 modular 口訣。
```

### 5.1 · 相同 output 不一定代表相同 input

**本節設計句：** 學完後，學習者應能看見固定乘法可能讓不同 inputs collision，因此 `ab=ac` 不能只因 `a≠0` 就直接 cancellation。

```text
預測：
在 ℤ/10ℤ 中已知 4·1=4·6。問是否能把兩側的4約掉，得到1=6。

操作變數：
- focused witness：a=4、inputs 1與6
- COMPARE ×3：固定同一對inputs，顯示unit multiplier不會讓它們合流
- FIND ×5 COLLISION：只在遷移階段開放input pair selectors
- REVEAL OUTPUTS / TRY CANCELLATION / RESET

主要視覺：
沿用 Ch4 的 horizontal multiplication wiring。左右兩張保留原 label 的 input cards 經過同一張 ×a card，抵達兩個 output sockets。若 outputs相同，兩條實線進入同一個加寬 socket，socket內仍列出 `from b`、`from c`，避免把來源抹掉。

因果：
預設a=4且inputs為1、6，兩路合流；TRY CANCELLATION停在「one output, two possible inputs」，而不是執行符號刪除。COMPARE ×3只改multiplier，兩個source labels重新分離。直到遷移題才開放尋找×5的collision pair，避免主探索退化成數值亂試。

Invariant：
Ambient ring始終是ℤ/10ℤ；input cards即使抵達同一output，仍是不同 elements。

動態 readout：
完整顯示 `m₄(1)=4=m₄(6)`，並明寫 `1≠6`。不以單獨紅叉代替 failure reason。

Evidence：
`WITNESS · one collision disproves universal cancellation`。本節不宣稱掃完所有 inputs。

觀念圖卡：
Cancellation 不是符號擦除；它需要 multiplication 沒有忘記 input 是誰。

遷移檢查：
進入FIND ×5 COLLISION，要求學習者自行找一對collision inputs，再說明為何共同prefix 5不能約掉。

正式展開：
消去律（cancellation law）的左右版本與本課 commutative scope。Injective 一詞只作預告，不在此建立完整 map taxonomy。
```

**擁擠檢查：** 本節只讓 cancellation failure 可見。不定義 zero divisor、不抽 difference，也不比較 nonunit；原因留到5.2。

### 5.2 · Collision 藏著一個被乘成零的非零 difference

**本節設計句：** 學完後，學習者應能把兩個inputs的差異封裝成`d=b−c`，並看見collision正代表額外加入的非零packet d被multiplier送成0。

```text
預測：
延續 a=4、b=1、c=6。問兩個 inputs 的 difference 是否可能是0，以及把這張difference card送進×4後會去哪裡。

操作變數：
- COLLISION / REBUILD `b=c+d` / DISTRIBUTE `×a` / ISOLATE `ad` 四段 stepper
- swap b、c（只改difference方向，不改是否被送到0）
- direction-check preset：a=5、b=1、c=3
- concrete readout / symbolic overlay

主要視覺：
第一幕保留5.1的兩條合流水線；第二幕不把cards畫成空間距離，而用ADD module將`c`與一張獨立difference packet `d=b−c=5`重建成`b=c+d`。第三幕沿用Ch2的WHOLE／SPLIT routes：
- WHOLE：`a(c+d)=ab`
- SPLIT：`ac+ad`
兩條route與原本`ab=ac`的collision endpoint對齊後，只有額外contribution `ad`必須停在明確標成additive identity的`0 DOCK`。上方symbolic cards逐步顯示`b=c+d`、`ab=ac+ad`、`ab=ac`，最後才壓成`ad=0`。

因果：
按步進時不刪除共同factor，也不先展示完成公式；學習者先看見`c`多帶一張非零d仍抵達相同output，再由distributivity隔離d的contribution。Primary case中swap後d從5變成−5≡5只是本例巧合；direction-check preset改用`5·1=5·3`，difference會在8與2之間反向，明示self-opposite不是一般現象。

Invariant：
a固定；b≠c，因此difference card d≠0；最後只有product ad成為0，d本身沒有消失。

動態 readout：
依序顯示`d=1−6=5≠0`、`1=6+d`、`4(6+d)=4·6+4d`、`4·1=4·6`，最後才顯示`4d=0`。Symbolic route與concrete packets一一對齊。

Evidence：
`GENERAL ARGUMENT` 用 symbolic cards展示雙向mechanism；concrete values只作instance readout。

觀念圖卡：
Zero divisor（零因子）會把某個非零 difference 送進 0；collision 是這次資訊遺失的外觀。

遷移檢查：
反向給一張 witness `2·5=0`，要求建立一對不同 inputs，使×2把它們送到同一output。

正式展開：
本課 convention：a≠0且存在d≠0使ad=0時，a是zero divisor。完整雙向證明與noncommutative left/right zero divisors放details。Nilpotent element只在另一個optional details說明：若aᵏ=0且a≠0，反覆self-multiplication也會產生zero-divisor witness；不進主流程taxonomy。
```

**擁擠檢查：** 本節只統一 collision、nonzero difference與zero product。`ann(a)`、nilradical、reduced ring與ideal language全部不出現。

### 5.3 · Nonunit 可能只是漏掉 outputs，不一定壓掉 inputs

**本節設計句：** 學完後，學習者應能在同一眼比較中區分「沒有global undo」與「真的發生collision」；nonunit不必然是zero divisor。

```text
預測：
固定machine ×2。它在ℤ與ℤ/10ℤ中都不是unit；問兩個world裡是否都必然有input collision。

操作變數：
- inspection lens：INPUT DISTINCTION / OUTPUT COVERAGE
- integer viewport平移，只為查看其他labels，不改倍率或machine
- 兩個ambient worlds始終並排，不用toggle隱藏其中一邊

主要視覺：
兩個同時可見、source rows垂直對齊的socket boards：
- ℤ：labeled integer inputs各自抵達不同even outputs；odd sockets是gaps，rail兩端以ellipses明示無限延伸。
- ℤ/10ℤ：inputs x與x+5成對進入同一output；同時也留下gaps。
兩欄下方各自固定兩顆獨立指示器：`DISTINCT INPUTS PRESERVED?`與`EVERY OUTPUT REACHED?`，不用單一PASS/FAIL混合兩個問題。Inspection lens只控制本輪加粗collision sources或empty outputs，另一類證據仍保留低對比輪廓。

因果：
兩欄始終固定element 2與rule x↦2x；唯一差異是ambient boundary與modular identification。切換inspection lens只改注意焦點，不改任何mapping data，因此比較不受memory負擔干擾。

Invariant：
兩邊的2都沒有in-world inverse；差別是ℤ中的×2只not surjective，ℤ/10ℤ中的×2同時not injective。

動態 readout：
使用兩行獨立判斷：
`UNIT? no in both worlds`
`ZERO DIVISOR? no in ℤ / yes in ℤ/10ℤ`

Evidence：
主視覺標 `CONTROLLED EXAMPLE`。有限modular board可complete scan；無限integer rail不冒充exhaustion，`2b=2c⇒b=c`的general argument放展開層。

觀念圖卡：
Unit 要求沒有collision而且沒有gaps；zero divisor只偵測collision。Nonunit只代表至少一項沒做到。

遷移檢查：
問ℤ中的3是否unit、是否zero divisor，並要求分別用missing outputs與input distinction解釋，而不是用「3非零」猜測。

正式展開：
單射（injective）、滿射（surjective）、雙射（bijective）首次中英標註。證明finite commutative ring中injective⇔surjective，因此非零nonunit⇔zero divisor，但persistent label標明 `FINITE COMMUTATIVE RING ONLY`。
```

**擁擠檢查：** 本節只拆開map的兩種failure。不介紹 infinite cardinality tricks、localization或fraction fields；也不把field拿來做第三種分類。

### 5.4 · 換成 functions，資訊仍可能因 pointwise multiplication 被壓掉

**本節設計句：** 學完後，學習者應能預測兩張非零function cards若在每條lane至少有一方為0，pointwise product會成為zero function。

```text
預測：
在function ring ℤ^X、X={A,B,C,D} 中，先給一張support在A、B的nonzero function f。問能否建造另一張nonzero function g，使f·g整張為0。

操作變數：
- 預設固定f的support為{A,B}；學習者只點擊lanes建造nonzero g，product card即時更新
- 成功建立disjoint-support witness後，才解鎖ONE OVERLAP與FULL-SUPPORT f transfer presets
- TEST WITNESS / RESET

主要視覺：
左右是完整function cards f、g，中間是沿用Ch1／Ch4的pointwise multiplication ports，右側是product card。每條lane保留A–D label；非零lane以實心token加文字`1`表示，zero lane以空socket加`0`表示。整張card外框另有`NONZERO FUNCTION`或`ZERO FUNCTION` verdict。

因果：
學習者不能提交zero function作為g；至少打開一條lane後才可TEST。g的support避開固定f時，每條lane都有一個zero factor，product card四條lanes全為0。成功後才解鎖transfer presets：打開任一overlap，對應product lane立刻變1；切到FULL-SUPPORT f後，介面要求學習者解釋為何任何nonzero g都必定留下至少一條nonzero product lane。

Invariant：
Ambient ring始終是ℤ^X，operation始終pointwise multiplication；「function是否為0」由整張card所有lanes共同決定。

動態 readout：
顯示supports與其intersection，例如 `supp(f)∩supp(g)=∅ → fg=0 function`。Support只作自然語言label，不在本節建立完整support theory。

Evidence：
`WITNESS · two nonzero function elements with zero product`。此例證明ℤ^X在|X|≥2時有zero divisors，但不宣稱分類所有function zero divisors。

觀念圖卡：
Zero divisor描述multiplication如何讓兩份非零資訊彼此錯開並全部落成0；它不要求elements長得像numbers。

遷移檢查：
給f每條lane都為1、g任意非零，要求預測product能否是zero function，並指出是哪條lane阻止它。

正式展開：
以characteristic-function style cards寫出一般finite X witness。完整product-ring zero-divisor分類不在本課主線。
```

**擁擠檢查：** Binary values只是把support interaction變乾淨，不暗示function rings只能有0/1-valued functions。Polynomial、matrix determinant與direct product notation不加入本節。

### 5.5 · 同一份 witness，可以翻譯成 zero product、collision 或 cancellation failure

**本節設計句：** 學完後，學習者應能在三個同步視圖中追蹤同一份witness，並把「沒有非零zero product」「nonzero multiplication map保存input distinction」「nonzero factors可cancellation」辨認為同一個structural promise。

```text
預測：
先只啟用ZERO PRODUCT欄，給`ad=0, a,d≠0`。問另外兩欄應出現哪些inputs與equality，才能描述完全相同的資訊遺失。

操作變數：
- primary candidate固定為ℤ/10ℤ；完成一次translation後才解鎖ℤ與function ring transfer
- witness entry point：ZERO PRODUCT / MAP COLLISION / CANCELLATION
- TRANSLATE NEXT / TRANSLATE BACK / REVEAL ALL / RESET

主要視覺：
桌面寬版三欄synchronized witness translator，不使用triangle或空間距離暗示邏輯強弱：
1. `ZERO PRODUCT`：`ad=0, a,d≠0`
2. `MAP FIBER`：`mₐ(0)=mₐ(d)`，同一socket保留sources 0與d
3. `CANCELLATION TEST`：`a·0=a·d but 0≠d`
頂端只有一張共享witness packet `(a,d)`。TRANSLATE NEXT不搬動或變形packet，只逐欄揭示它在不同語言下的readout，避免動畫暗示witness本身被改造。Candidate只替共享packet提供decisive values；三欄一般模板先於例子存在。

因果：
在ℤ/10ℤ選witness2·5=0，逐欄會生成0與5的collision，再生成不能cancel 2的equality。若從CANCELLATION欄進入，translator則反向抽出difference d。切到ℤ時介面不偽造failure packet，而改顯示一般promise cards；function ring沿用5.4的disjoint-support packet。

Invariant：
三欄沒有新增三種無關properties；共享witness id、a與d始終不變。General translator template與candidate evidence分層顯示。

動態 readout：
先顯示具體witness，再顯示一般句：`for every a≠0, mₐ preserves distinct inputs`。Integral domain名稱最後才附著到已完成對齊的三欄。

Evidence：
Translator的雙向規則標`GENERAL ARGUMENT`；candidate packets分別標`GENERAL ARGUMENT`或`WITNESS`，不可用同一綠燈暗示證據等強。

觀念圖卡：
Integral domain 是 multiplication 不會由非零 multiplier 壓掉 differences 的 commutative ring。

遷移檢查：
只給一個collision `mₐ(b)=mₐ(c), b≠c`，要求不做數值計算，從CANCELLATION entry point反向建造nonzero difference d與zero-product witness。

正式展開：
Integral domain的正式條件（本課scope下commutative、unital、1≠0、無zero divisors）與三項等價證明。Field、PID、UFD不放comparison table；它們留在後續課程。
```

**擁擠檢查：** 本節是整章表示壓縮，不新增第四個detector。Integral domain是唯一新名稱；prime ideals與quotient domains仍留到Ch15。

### Ch5 畫面與實作約束

- **建議5 screens，不合併。** 5.1先讓cancellation failure成為可見衝突；5.2才抽出difference並命名zero divisor；5.3專門阻止finite-example泛化；5.4完成non-number transfer；5.5才壓縮成integral-domain promise。
- Multiplication wiring沿用Ch4：forward paths仍用MULTIPLY double-line語法。Ch5新增的collision socket必須保留所有source labels；不得用粒子合併或card融化暗示ring elements本身變成同一個。
- 5.1預設只看focused pair，只有比較按鈕與遷移challenge才改inputs。完整finite scan不是必要主控制，避免再次變成Ch4 coverage wheel；本章看的是fiber內有多個來源，不是總coverage比例。
- 5.2的difference extractor必須保留四個可見狀態：同output、以`c+d`重建input、沿distributive routes拆開contribution、將`ad`隔離到0。不能直接從`ab=ac`動畫跳到`a(b−c)=0`而隱藏difference與distributivity。
- 5.3兩個worlds固定並排，兩種status固定分開：input distinction與output coverage。Collision、gap除顏色外分別用stacked source labels／empty dashed socket表示。
- Integer rail只能顯示有ellipses的viewport，並標 `INFINITE WORLD · VIEWPORT ONLY`；不得用畫面中的有限sample宣稱×2在ℤ上injective。
- 5.4完整function-card border承擔whole-element verdict，lane只呈現pointwise cause。互動是「建造一張合法nonzero witness」，不得允許zero function混成成功答案。Binary support tokens是interaction simplification，需持續標示`VALUES SHOWN: 0/1`。
- 5.5使用三欄synchronized translator，不使用triangle。三欄順序只服務閱讀，不代表因果先後；entry point可從任一欄開始，TRANSLATE必須可正反向逐步、重設，reduced motion使用離散state reveal。
- **主流程概念預算：** 5.1不命名zero divisor；5.2只新增zero divisor；5.3只新增injective／surjective兩種map問題；5.4不新增taxonomy；5.5只新增integral domain名稱。任何一頁若需要同時解釋下一頁的新詞，就視為擁擠並退回重切。
- 本章不使用3D。核心關係是labeled fibers、同步difference extraction與pointwise lanes，2D能保留精確對應且避免遮擋。

### Ch5 完成驗收

在不打開formal layer時，學習者應能回答：

1. 為什麼`a≠0`本身不足以從`ab=ac`推出`b=c`？
2. 一個multiplication collision如何產生nonzero zero-product witness，反過來又如何？
3. 為什麼2在ℤ中是nonunit但不是zero divisor，在ℤ/10ℤ中卻是zero divisor？
4. 為什麼兩張nonzero functions可能pointwise相乘成zero function？
5. Cancellation、nonzero multiplication map保存input distinction與沒有zero divisors為什麼是同一個promise？
6. `finite nonzero nonunit ⇔ zero divisor`為什麼不能不加scope地推廣到所有rings？

若學習者只會搜尋一對`ab=0`數字，卻不能由collision抽出difference、分開collision與coverage gaps，或把mechanism遷移到functions，本章就還不算完成。

---

## Part II · 子世界、maps 與 ideal 的誕生

## Ch6 詳細 storyboard · Subring 不是圈出來，而是能在邊界內自給自足

### 全章設計句

```text
核心 insight：
Subring（子環）不是任意圈選一批elements，也不是替subset重新發明operations；它沿用ambient ring的原始operations，並能在自己的boundary內完成ring生活所需的一切。

學習者原本可能怎麼誤解：
1. 只要subset看起來整齊、對稱或包含0，就很可能是subring。
2. 測幾組addition與multiplication沒有逃逸，就算證明closure。
3. 檢查subring必須把所有ring axioms從頭重驗一次。
4. Subset裡只要有「自己的identity」即可，不必理會ambient identity。
5. Generated subring是任意挑一個看起來夠大的closed set，而不是被seed與contract強迫出的最小世界。

第一個具體問題：
在兩點function ring `R=(ℤ/4ℤ)^{A,B}` 中，把每張function card壓縮寫成value pair `(h(A),h(B))`。圈出constant functions `D={(0,0),(1,1),(2,2),(3,3)}` 後，選兩張cards相加、相減或相乘時，能否完全沿用ambient pointwise machine，又永遠留在D？

一般機制如何表述：
給定unital ring R與subset S，subring不更改R的operations。因ambient laws已對R中所有elements成立，S不必重證associativity與distributivity；它真正需要證明的是自身能取得ambient identity，且difference與product不會逃出S。也就是在本課convention下：`1_R∈S`，並且對所有s,t∈S都有`s−t∈S`、`st∈S`。

主例子的 accidental properties：
- Diagonal constraint `x=y`只是subring的一個特例，不代表subrings一般都具有幾何對角形狀。
- `(ℤ/4ℤ)^{A,B}`是finite且commutative，允許complete scan；一般infinite subset不能靠畫面抽樣證明。
- Pointwise operations使constraint特別容易逐lane檢查；一般subring未必呈現為function-value pairs。
- Constant-function subset D剛好和ℤ/4ℤ有相同card數與operation pattern；主流程不提前引入isomorphism語言。
- Generated example若使用`(ℤ/2ℤ)^{A,B}`，`x+x=0`是characteristic 2的偶然性，不可被誤認為一般closure rule。

哪個 non-degenerate state 讓角色真正分開：
- `D={(r,r)}`真正通過subring contract。
- `C=D∪{(1,0)}`包含ambient 0與1，也有多組成功operations，卻被difference witness `(1,0)−(3,3)=(2,1)∉C`立即推翻。
- A-supported subset `E={(r,0)}`對difference與product closed，甚至有自己的multiplicative identity `(1,0)`，但不含ambient identity `(1,1)`；在本課convention下仍不是subring。

主要視覺模型：
一張function-card board代表ambient R；每張完整two-lane function card可壓縮標成value pair `(h(A),h(B))`，並可隨時展開A／B lanes。Candidate boundary只圈住允許的cards；ADD、DIFFERENCE與MULTIPLY仍使用Ch1–Ch3既有pointwise machines，沒有subset專用版本。Output若越界，card保留完整lane values穿過boundary；若成功，則停在boundary內的既有slot。後半章把boundary改成由seed逐步撐開的forced frontier，每張新card都附加入理由。

視覺可能造成的假暗示：
- Grid上的鄰近距離不代表ring distance；只有A／B lane values與membership有語意。
- Boundary面積不代表subset大小或結構強弱；每張card label才是membership證據。
- Output逃逸表示candidate不closed，不表示ambient operation故障。
- 幾組綠色operations只是examples；只有finite complete audit或general argument能證明universal claim。
- Generated boundary擴張不是時間演化，也不是選擇偏好；每一步都必須由identity、difference或product強迫。

學習者能操作的變數：
- operation layer：ADD / DIFFERENCE / MULTIPLY
- selected pair，主探索先focused、audit challenge才開放
- candidate boundary：D / almost-diagonal C
- inspection task：inherited law / boundary obligation
- identity candidate：ambient `(1,1)` / internal-only `(1,0)`
- generated-subring seed與NEXT FORCED CARD；transfer完成後才切base ring

操作時保持不變的東西：
Ambient function cards與pointwise operations跨6.1–6.4保持不變；candidate只改membership boundary。6.4只比較identity membership，不改difference與product結果。6.5中seed、ambient ring與course convention固定，boundary只能依contract擴張。

預測 → 回饋 → 壓縮：
先問subset能否使用原machine而不逃逸；用一個反例拆掉抽樣信心；再把完整ring axioms壓縮成「ambient已保證的laws」與「boundary仍須證明的三個ports」；最後讓seed在這三個ports下長成最小自足世界。

目前 evidence 屬於哪一種：
6.1是EXAMPLE；6.2先以WITNESS推翻candidate，再允許FINITE EXHAUSTION驗證finite D；6.3是GENERAL ARGUMENT；6.4是COURSE CONVENTION下的decisive membership check；6.5是FORCED CONSTRUCTION，完成finite closure後才標FINITE EXHAUSTION。

特例 detector 與 course convention 如何持續標示 scope：
Function-card screens持續標`INSTANCE · R=(ℤ/4ℤ)^{A,B}`，並讓pair shorthand可展開回完整function lanes。6.4與所有subring verdict持續顯示`COURSE CONVENTION · MUST CONTAIN AMBIENT 1_R`。Complete audit只標`FINITE EXHAUSTION · THIS CANDIDATE`。Generated example標示其base ring，不把finite frontier算法冒充一般termination theorem。

正式內容放在哪個展開層：
Subring的完整定義；`1_R∈S`、subtraction closure與multiplication closure構成subring test的證明；為何universal identities由ambient ring繼承；不同教材對non-unital subring或different identity的conventions；generated subring作為所有包含seed之subrings的intersection。

最後如何檢查能否遷移：
從pair cards換成function ring `(ℤ/2ℤ)^X`：constant functions形成subring；加入一張nonconstant seed後，學習者能否只依identity／difference／product的forced outputs預測generated subring，而不是依function外觀猜boundary？
```

### 6.1 · Subring 沿用 ambient operations，不另裝一套 machine

**本節設計句：** 學完後，學習者應能預測：判斷subring時，subset boundary只能限制哪些cards可用，不能更改它們原本的sum、difference或product。

```text
預測：
在`R=(ℤ/4ℤ)^{A,B}`中選兩張constant-function cards `(1,1)`與`(3,3)`。如果它們的ambient pointwise sum是`(0,0)`，能否為了讓subset保持漂亮而另定一個subset sum？

操作變數：
- operation：ADD / DIFFERENCE / MULTIPLY
- focused input presets；完成預測後才開放四張diagonal cards
- SHOW AMBIENT ROUTE / CHECK BOUNDARY / RESET

主要視覺：
4×4 function-card board，每張slot預設顯示pair shorthand `(h(A),h(B))`，focus時展開兩條lanes。Constant-functions boundary D串起四張`(r,r)` cards，但operation machine位在boundary外，輸入與輸出都指向ambient board上的原slots。切換operation只換route line grammar，不改cards或boundary。

因果：
選兩張D中的cards後，SHOW AMBIENT ROUTE先在整張R board算output；CHECK BOUNDARY才詢問output slot是否屬於D。介面不存在「修改output」或「subset-specific operation」控制。

Invariant：
R、pair coordinates與operation tables始終不變；D只是membership constraint。

動態 readout：
先完整顯示ambient statement，例如`(1,1)+(3,3)=(0,0) in R`，再補`output ∈ D`。Membership verdict不取代operation readout。

Evidence：
`EXAMPLE · demonstrates inheritance, not universal closure`。

觀念圖卡：
Subring 是 inherited operations 下的自足subset，不是縮小後重寫規則。

遷移檢查：
選(1,1)與(2,2)，切換DIFFERENCE及MULTIPLY，先預測output coordinate，再判斷membership。

正式展開：
Restriction of operations的正式語句；不在本節列subring test。
```

**擁擠檢查：** 本節只建立「operation inherited」。不宣稱抽樣已證明D closed，不介紹universal quantifier、identity convention或generated subring。

### 6.2 · Closure 是所有 pairs 都不逃逸，不是幾次成功紀錄

**本節設計句：** 學完後，學習者應能區分sample與universal claim，並知道一個escape witness足以否決subring candidate。

```text
預測：
Candidate C=D∪{(1,0)}已通過兩次測試：`(1,0)−(0,0)`與`(1,1)(1,0)`都留在C。問這些綠色紀錄是否已足以證明closure。

操作變數：
- candidate：almost-diagonal C / diagonal D（D在challenge後解鎖）
- operation audit：DIFFERENCE / MULTIPLY；ADD只作直覺route並由difference+identity在6.3壓縮
- pair selectors / TRY SUGGESTED PAIR / COMPLETE FINITE AUDIT / RESET

主要視覺：
左側仍是ambient function-card board與candidate boundary；右側是input-pair audit matrix。每個cell保留`untested`、`stays inside`或`ESCAPES to (x,y)`的文字與線型。預設只點亮兩個成功samples，不用滿版綠燈製造已證明錯覺。

因果：
TRY SUGGESTED PAIR選`(1,0)−(0,0)`時仍成功，接著要求學習者自行測`(1,0)−(3,3)=(2,1)`或另一個decisive pair；一旦output不在C，audit立即停止並保留escape route。切到D後可執行COMPLETE FINITE AUDIT，逐cell填滿而不是只播放裝飾動畫。

Invariant：
Candidate、operation與先前test history保持可見；failure witness不會把已成功的cells改紅。

動態 readout：
明示`2 successful examples ≠ universal proof`；失敗時顯示`WITNESS: inputs in C, output outside C`。完整掃描D後才顯示`FINITE EXHAUSTION · THIS CANDIDATE`。

Evidence：
成功抽樣標`EXAMPLE`；逃逸標`WITNESS`；完整有限掃描標`FINITE EXHAUSTION`。

觀念圖卡：
Closure 是 no-escape 的「對所有inputs」承諾；一個escape就足以推翻它。

遷移檢查：
不跑complete audit，只給一個新candidate與三組紀錄，要求判斷目前能說「已證明」「已否決」或「仍未知」。

正式展開：
Closure的quantifiers與counterexample logic。Infinite candidates為何不能由有限scan證明放details。
```

**擁擠檢查：** 本節只教evidence strength與universal no-escape。不在主流程同時教授完整subring shortcut；audit使用兩種operations但只追同一個closure insight。

### 6.3 · Ambient laws 已經通過；boundary 只需證明三個 autonomy ports

**本節設計句：** 學完後，學習者應能解釋為何associativity與distributivity由ambient ring自動繼承，真正新增的工作只有ambient identity、difference closure與product closure。

```text
預測：
若s,t,u都在S，而且intermediate outputs確定仍在S，是否還需要重新證明`(st)u=s(tu)`在S中成立？

操作變數：
- inspection lens：INHERITED LAWS / BOUNDARY OBLIGATIONS
- 三個ports：IDENTITY 1_R / DIFFERENCE s−t / PRODUCT st
- candidate D；完成後給一個單port failure challenge

主要視覺：
Ambient R machine上方已有sealed law rails：additive associativity、commutativity、multiplicative associativity、distributivity。Candidate boundary不複製這些rails，而只接三個入口ports：1_R能否入場、任兩cards的difference是否留內、product是否留內。Lens只改當下高亮，兩層始終同時可見。

因果：
點INHERITED LAW時，同一批S cards沿ambient equality routes抵達相同endpoint；因operations沒改，law seal直接穿過boundary。點三個ports時才真正觸發membership tests。若某個port開路，verdict指出失去哪種內部生活能力。

Invariant：
Law equalities不因candidate改變；只有outputs是否仍屬於S需要新證據。

動態 readout：
使用兩欄而非axiom wall：`ALREADY TRUE IN R`與`STILL MUST STAY IN S`。Difference port旁同步解碼為addition與additive inverse的compact test，但推導留到details。

Evidence：
`GENERAL ARGUMENT · universal identities restrict to closed subsets`。

觀念圖卡：
Subring test不是重考整份ring公理；它只檢查subset能否留在原規則裡自給自足。

遷移檢查：
給candidate已知closed underdifference與product，但未說明1_R；要求指出唯一仍欠缺的port，不得重新勾選associativity。

正式展開：
證明nonempty、subtraction closure推出0、addition與additive inverses；加入1_R與multiplication closure後得到本課unital subring test。完整quantifiers收在details。
```

**擁擠檢查：** 本節是前兩節的結構壓縮，不新增example carousel。主流程只保留三個ports；完整axioms與shortcut proof不展開就不佔閱讀負擔。

### 6.4 · 「有自己的 identity」不等於「包含 ambient identity」

**本節設計句：** 學完後，學習者應能辨認本課的subring convention要求同一張`1_R` card，並把definition choice與closure failure分開。

```text
預測：
在`R=(ℤ/4ℤ)^{A,B}`中，functions supported only at A所成的subset `E={(r,0)}` 對difference與product都closed，而且`(1,0)`在E內像identity。它是否符合本課subring convention？

操作變數：
- candidate：constant functions D / A-supported functions E
- identity card：ambient `(1,1)` / internal-only `(1,0)`
- TEST DIFFERENCE / TEST PRODUCT / DOCK AMBIENT 1_R

主要視覺：
沿用同一function-card board，右側固定一個不可更名的`AMBIENT IDENTITY DOCK · constant-one function (1,1)`。D的boundary包住dock card；E只包住B-lane為0的cards，包含`(1,0)`但ambient dock仍在外。兩張identity cards外觀相似但明確標`1_R`與`identity for E only`，避免角色混淆。

因果：
E通過difference與product時保持中性狀態，不以紅色暗示壞掉；只有DOCK AMBIENT 1_R時顯示`OUTSIDE COURSE CONVENTION`。切到D時同一張(1,1)直接位於boundary內。

Invariant：
Candidates使用相同ambient operations；course convention badge、ambient 1_R的位置與角色都不切換。

動態 readout：
分三行顯示`DIFFERENCE: CLOSED`、`PRODUCT: CLOSED`、`AMBIENT 1_R: IN / OUT`，最後才產生course verdict。

Evidence：
`CONVENTION CHECK`，不是以example證明一般theorem。

觀念圖卡：
本課的subring與ambient ring共用operations，也共用同一個1_R。

遷移檢查：
比較`ℤ⊆ℚ`：ambient identities都是1，因此identity port通過；要求學習者不要因world變大就猜identity一定不同。

正式展開：
說明有些教材允許non-unital subrings，或允許subring擁有不同identity；`E`在那些conventions下可能被接受。本課後續ring maps與ideal比較固定使用same-identity convention。
```

**擁擠檢查：** 本節只隔離identity convention。不重新教授closure，也不引入ideal；different textbook conventions全部待主判斷完成後才展開。

### 6.5 · Generated subring 是 seed 在 contract 下被迫長出的最小世界

**本節設計句：** 學完後，學習者應能預測generated subring的每張新card都由identity、difference或product強迫加入，且擴張在不再產生新card時停止。

```text
預測：
在function ring `R=(ℤ/2ℤ)^{A,B}` 中放入seed f=(0,1)。若generated subring必須包含ambient1=(1,1)，最後boundary只會包住seed與1，還是被迫長成更多cards？

操作變數：
- seed preset：constant 1 / nonconstant f=(0,1)
- ADD REQUIRED IDENTITY / NEXT FORCED CARD / WHY REQUIRED / AUTO COMPLETE / RESET
- 完成primary後才解鎖base transfer `(ℤ/3ℤ)^{A,B}`

主要視覺：
Ambient function-card grid以ordered value pair `(h(A),h(B))`排列。初始只有seed帶粗框；加入ambient identity後，frontier逐步包住被difference或product強迫的cards。每張新card旁固定掛reason tag，例如`0=f−f`、`(1,0)=1−f`。未被迫的cards保持在ambient board上，不以暗色暗示不存在。

因果：
NEXT FORCED CARD每次只執行一個目前已在boundary內cards的合法operation，產生新card才擴張；若output已在內，只記錄closure witness而不重複增長。AUTO COMPLETE逐步執行至frontier固定，不能一鍵跳答案。Seed=constant1時停在constant functions；seed=(0,1)時在ℤ/2 base中長成全部四張functions。

Invariant：
Seed永遠保留、ambient1必須加入、既有cards不被移除；boundary只因subring contract的forced output單調擴張。

動態 readout：
同時顯示`CURRENT BOUNDARY`、`NEXT OBLIGATION`與`WHY THIS CARD CANNOT BE OMITTED`。停止時顯示`FIXED POINT · every required output already inside`，而不是只說done。

Evidence：
過程標`FORCED CONSTRUCTION`；完整掃完有限ambient後才標`FINITE EXHAUSTION`。切到ℤ/3 base時持續標`TRANSFER INSTANCE`，避免把`f+f=0`當一般rule。

觀念圖卡：
Generated subring不是任選一個closed外殼；它是任何包含seed的subring都無法拒絕的cards集合。

遷移檢查：
切到`(ℤ/3ℤ)^{A,B}`，先預測constant seed與nonconstant seed各自會停在哪些function patterns，再逐步驗證；重點是forced frontier，不要求心算完整operation table。

正式展開：
Generated subring常寫成`⟨A⟩_ring`；若從指定base subring S adjoining elements，才常寫`S[A]`。它可定義成所有包含A之subrings的intersection；finite closure algorithm為何在有限ambient必停放在details。Polynomial generated subring只作下一門課預告。
```

**擁擠檢查：** 本節只建立minimal forced closure，不介紹ideals generated by a seed，也不提前講polynomial rings。Base transfer完成primary後才出現；reason tags每次只顯示一個obligation。

### Ch6 畫面與實作約束

- **建議5 screens，不合併。** 6.1先固定operation inheritance；6.2單獨建立universal evidence；6.3才壓縮subring test；6.4隔離identity convention；6.5建立generated subring。若把6.1–6.3合併，單頁會同時承擔語意、量詞與shortcut proof，確實過擠。
- Function-card board跨6.1–6.4保持同一value-pair slots與pointwise operation machines。Candidate boundary可改形狀，但不得重排cards；任何pair shorthand都能展開回A／B lanes，避免representation壓縮變成黑箱。
- Boundary不能只靠底色；使用實線輪廓、card membership標記與`IN / OUT`文字。Escape output保留coordinate label與來源route。
- 6.2 audit history必須保留untested狀態；兩次sample success不得觸發PASS。COMPLETE AUDIT可step、pause、reset，reduced motion使用逐cell離散更新。
- 6.3 inherited seals不做成九張同尺寸axiom cards。Ambient law rails整體封裝，主焦點只給identity／difference／product三個ports。
- 6.4 persistent badge必須寫`COURSE CONVENTION · SAME AMBIENT 1_R`。Alternative conventions不能做成任意toggle改變當前答案，只放details並解釋來源。
- 6.5每張新增card都必須有可查詢reason與parent inputs。AUTO COMPLETE只是連續呼叫同一NEXT step；不得以無原因的growth animation填滿board。
- **主流程概念預算：** 6.1只新增inherited operation；6.2只新增universal no-escape；6.3只新增compact subring test；6.4只處理identity convention；6.5只新增generated／minimal closure。Ideal、ring homomorphism與quotient vocabulary都不進主流程。
- 本章不使用3D。核心推理依賴exact membership、pair correspondence與audit history；2D fixed board比透視空間更清楚。

### Ch6 完成驗收

在不打開formal layer時，學習者應能回答：

1. 為什麼subring不能替subset重新定義addition或multiplication？
2. 為什麼幾個成功examples不能證明closure，而一個escape可以否決它？
3. 為什麼associativity與distributivity不必在candidate內從頭重驗？
4. 本課的三個boundary obligations是哪些，subtraction為什麼能壓縮additive checks？
5. 為什麼A-supported subset E即使有internal identity，在本課convention下仍不通過？
6. Generated subring的每張新card為什麼是forced，而不是設計者任意加入？
7. Pair shorthand展開成完整function lanes後，能否確認自己仍在對同一批elements與同一套pointwise operations推理？

若學習者只會看boundary外觀猜subring、把sample scan當proof、重新背一遍ring axioms，或無法說明generated boundary為何minimal，本章就還不算完成。

## Ch1–Ch6 整體稽核 · 2026-08

### 結論：維持章序與章數，不合併；強化跨章交棒

目前最佳順序仍是：

```text
Ch1 先辨認同一world的兩種operations
  ↓ 留下兩層如何相容的問題
Ch2 用distributivity接上兩層
  ↓ 已有mechanism，尚缺完整contract
Ch3 把能力封裝成ring blueprint
  ↓ multiplication不保證undo
Ch4 看哪些individual elements取得global undo
  ↓ nonunit wiring可能出現未解釋的資訊問題
Ch5 放大collision，建立zero divisor與integral domain
  ↓ 從individual multiplier轉向一整批elements能否獨立生活
Ch6 建立subring boundary與minimal generated closure
```

不把Ch1與Ch3合併：Ch1是在形成object／operation mental model，Ch3是在已有兩章經驗後壓縮contract；若第一次見ring就展示blueprint，會退回axiom wall。3.1／3.2必須以`CALLBACK · ALREADY OBSERVED`開場，直接封裝Ch1能力，不重新跑完整教學。

不把Ch4與Ch5合併：unit回答「何時能完整倒帶」，zero divisor回答「何時真的壓掉input distinction」。Finite modular rings中兩者容易看似互補，但Ch5.3的`ℤ`／`ℤ/10ℤ`並排正是必要的anti-overgeneralization。

不把Ch5與Ch6顛倒：先學multiplication map保存或丟失資訊，再轉向subset boundary，會讓後續kernel／ideal中的「difference被外部乘法推動」已有語意。Subring先回答internal autonomy，ideal到Ch8–Ch9才回答ambient absorption。

### 六章各自只能留下的一句話

1. **Ch1：** 同一批objects上可以有不同operations；operation是world指定的rule。
2. **Ch2：** Distributivity要求multiplication尊重addition組好的結構。
3. **Ch3：** Ring contract是不對稱的三層blueprint，不是兩個groups或一列axioms。
4. **Ch4：** Unit讓固定乘法成為whole-world reversible map。
5. **Ch5：** Zero divisor讓固定乘法壓掉nonzero difference。
6. **Ch6：** Subring沿用ambient operations，並在boundary內自給自足。

若某頁的主圖卡無法明確歸屬其中一句，就表示內容跨章或重複，應刪除、移到formal layer或改成callback。

### Recurring visual 的累積語意

| Visual primitive | 首次建立 | 後續只能增加的語意 |
|---|---|---|
| 同一objects、ADD／MULTIPLY wiring | Ch1 | Ch2增加mixed routes；Ch3封裝成blueprint，不重新定義 |
| Function card與pointwise lanes | Ch1 | Ch2檢查route；Ch4檢查inverse；Ch5檢查support collision；Ch6檢查subset membership |
| Fixed multiplication map `m_a` | Ch4 | Ch5把reverse unavailable拆成collision／gap；不得在Ch1提前命名injective／surjective |
| Difference packet | Ch3 additive backbone | Ch5成為被乘成0的資訊；Ch6成為subring autonomy port |
| Membership boundary | Ch4 ambient inverse | Ch6改問whole subset autonomy；Ch8才新增ambient absorption，不提前把boundary叫ideal |
| Evidence badge | Ch2 witness／finite scan | Ch5、Ch6持續區分EXAMPLE、WITNESS、FINITE EXHAUSTION、GENERAL ARGUMENT |

Function cards是Ch1–Ch6最重要的non-number spine。Ch6不再突然引入一套獨立的pair-ring語言，而使用`R=(ℤ/4ℤ)^{A,B}`；value pair只是完整function card的shorthand，必須可展開回lanes。

### 本次稽核後的具體調整

1. **Ch3避免重教Ch1：** 3.1與3.2實作時加入`CALLBACK · PACK INTO BLUEPRINT`層級；預測只問能力應接到哪個module，不重做Ch1所有controls。
2. **Ch4→Ch5保留同一wiring：** Ch4遇到nonunit只顯示`GLOBAL UNDO UNAVAILABLE`；collision／gap名稱與source fibers延到Ch5，避免答案先洩漏。
3. **Ch5收緊證據語言：** 5.2用`b=c+d`與distributive routes讓information loss可見；5.5使用三欄translator，不用沒有數學量值的triangle。
4. **Ch6沿用function spine：** constant functions D、almost-constant candidate C與A-supported subset E都住在同一function-card board，減少representation switching。
5. **Ch6 identity案例改成真正非退化案例：** E有自己的identity `(1,0)`卻沒有ambient `(1,1)`，能清楚顯示這是course convention，不只是「忘了放1」的粗糙反例。
6. **Generated notation修正：** 一般generated subring使用`⟨A⟩_ring`描述；只有從指定base subring S adjoining elements時才使用`S[A]`，避免把兩種角色混寫。

### 一到六章的整體概念預算

- 主流程正式新名詞依序只解鎖：binary operation → distributivity → ring → unit → zero divisor／integral domain → subring／generated subring。
- Injective、surjective、group of units與subring test屬於既有mechanism的壓縮名稱，不得做成額外taxonomy carousel。
- Field、division ring、semiring、reduced ring、nilradical、annihilator、ideal、quotient都不進Ch1–Ch6主流程；必要邊界只放details或future marker。
- 每節最多一個自由探索區。Transfer controls在primary prediction與causal observation完成後才解鎖。
- 29個screens雖多，但目前沒有可安全合併的相鄰insights；刪掉任何一節都會失去一項misconception repair、generality check或representation transfer。後續若實際1920×1080驗證發現閱讀節奏重複，優先縮短callback頁的文案與controls，不先合併概念。

### 跨章驗收

完成Ch1–Ch6後，學習者應能面對一個陌生candidate world，依序問：

1. Objects是什麼？兩種operations各自如何決定output？
2. Mixed routes是否由distributivity對齊？
3. 哪些能力屬於ring contract，哪些只是individual element的額外能力？
4. 固定乘a時，是完整可逆、只有gaps，還是已有collisions？
5. 圈出subset後，operations是否仍是ambient rules，且identity／difference／product能否全留在boundary內？

若這五問能在不先搜尋結構名稱的情況下完成，前六章才真正建立了可遷移模型。

## Ch7 詳細 storyboard · 一張 map，兩套 wiring 都不能翻壞

### 為什麼 Ch6 之後先學 map，而不是直接定義 ideal

Ch6 已經回答「一批 elements 如何沿用 ambient operations，在同一個 ring 內形成自足 boundary」。接下來真正缺少的鏡頭不是另一種 subset 名稱，而是：

> 當 elements 從一個 ring world 被送往另一個 ring world，哪些 operation structure 被保留，哪些 distinctions 被 map 忘掉？

若沒有先建立這個鏡頭，ideal 的 absorption 只會像額外規定。Ch7 先讓 map 的雙 operation contract 與 collision difference 可見；Ch8 才能從「map 看不見的 differences」自然發現 ambient multiplication 為何必須把它們留在同一暗區。

本章不把 Group Theory 已教過的 homomorphism、injective、surjective、image 與 composition 全部重講。只取回「先合成再翻譯＝先翻譯再合成」這個舊模型，增加 ring 特有的第二條 operation rail。

### 全章設計句

```text
核心 insight：
Ring homomorphism 不是任意 element correspondence；同一張 map 必須讓 ADD 與 MULTIPLY 的「先運算再翻譯／先翻譯再運算」都抵達同一 output，並在本課 convention 下保留 ambient identity。

學習者原本可能怎麼誤解：
1. 只要 map 對 elements 有明確輸出，就是一種合法的 ring translation。
2. Map 若保留 addition，應該自然也會保留 multiplication，或反過來。
3. 只檢查幾組 inputs 看到兩條 routes 重合，就能證明 universal preservation。
4. φ(1_R)=1_S 會由保加法與保乘法自動推出，不需要另外說明。
5. Map collision 只是任意的 many-to-one 配對，和 source 中的 ring structure 無關。

第一個具體問題：
把 function f:{A,B}→ℤ/4ℤ 送到它在 A 的 value。對兩張 function cards，先在 function world 逐點相加／相乘再讀 A，與先各自讀 A 再在 ℤ/4ℤ 合成，會不會永遠同終點？

一般機制如何表述：
Source R 與 target S 各自有自己的 ADD／MULTIPLY rules。一張 map φ:R→S 保結構，表示對任意 source inputs，沿 source operation後跨橋，或先各自跨橋再用target operation，兩條 routes同終點。本課另要求 identity beacon 1_R跨橋到1_S。

全章主要視覺模型：
左右固定為 SOURCE R 與 TARGET S，中間只有一張φ bridge。每種operation都有一個two-route audit：上路先在R合成再過φ，下路先讓兩個inputs過φ再在S合成。ADD用solid parallel rails；MULTIPLY用double rails與不同icon，不只靠顏色。

全章保持不變的東西：
同一張φ、同一對source inputs與同一對source／target worlds保持固定；切換的是目前audit哪一條operation contract。任何route mismatch都必須保留兩個明確endpoints，不能只亮紅燈。

Course convention：
主線使用commutative rings with identity，ring homomorphisms preserve identity。畫面常駐 `COURSE CONVENTION · φ(1_R)=1_S`；不同教材允許non-unital homomorphisms的差異只放正式展開，不提供會暗中改變當前verdict的toggle。

正式內容放在哪個展開層：
Ring homomorphism的量詞定義；為何保加法自動推出φ(0)=0與φ(−a)=−φ(a)；composition與image-subring等基本結果可列為optional consequences，但不進主互動。Kernel只在本章最後以「zero-output fiber」描述，名稱與ideal proof留到Ch8。

最後如何檢查能否遷移：
把evaluation map換成reduction map ℤ→ℤ/6ℤ，學習者能否仍畫出兩條routes、指出source與target使用不同world rules，並預測collision difference會被送到0？
```

### 主例子與 accidental-property audit

主例子使用evaluation map：

```text
R = (ℤ/4ℤ)^{A,B}
S = ℤ/4ℤ
ev_A(f) = f(A)
```

選它是為了延續Ch1–Ch6的function-card spine：一整張function仍是source element，`ev_A`才把card送成target residue。它也能在7.4產生清楚的many-to-one collisions。

但它有三項偶然性，UI必須主動解除：

1. **Evaluation看起來只是抽出一條lane。** 這不是homomorphism的一般外觀；7.1完成primary observation後，用reduction map `ℤ→ℤ/6ℤ`做surface transfer。
2. **Source與target共用mod 4 arithmetic。** 一般ring map兩側rules不必長得相同；route labels必須分別寫`operate in R`與`operate in S`，不能把中間bridge畫成「同一台machine延伸」。
3. **Pointwise operations讓preservation近乎逐lane可見。** 這是好的入口，但不能因此暗示所有maps自動preserve；7.2立刻放入只保單一operation的maps。

非退化預設state使用：

```text
f=(1,2), g=(3,1) in (ℤ/4ℤ)^{A,B}
```

在A lane中，ADD抵達`0`、MULTIPLY抵達`3`，兩種operation不會因數值碰巧得到同一endpoint；B lane則保持可見但不被evaluation讀取，讓「完整source element」與「map觀察到的coordinate」角色真正分開。

---

### 7.1 · 同一張 bridge，要讓兩種 two-route audits 都對齊

**本節設計句：** 學完後，學習者應能把ring homomorphism直覺讀成「同一張map同時尊重source與target的兩種operation wiring」，而不是element lookup table。

```text
預測：
固定f=(1,2)、g=(3,1)，map為ev_A。先選ADD或MULTIPLY，要求預測上路「先在R合成再讀A」與下路「先讀A再在S合成」是否同終點，以及終點是哪個residue。

操作變數：
- active audit：ADD / MULTIPLY
- source function cards f、g的小範圍values
- STEP ROUTES / RESET
- primary兩種audit都完成後才解鎖TRANSFER · REDUCTION MOD 6

主要視覺：
畫面固定左右兩個world。SOURCE端保留完整A／B lanes；TARGET端是mod-4 residue dock。中央φ bridge不可移動。上方route把兩張cards先送進active source-operation port，再讓完整output card跨橋；下方route先讓兩張cards各自跨橋，再進target-operation port。兩個endpoint最後在同一target dock重疊。

因果：
按STEP ROUTES時兩路可分段前進：先顯示intermediate objects，再顯示endpoint。切換ADD／MULTIPLY只換operation rails，不換φ與inputs。調整f(B)或g(B)會更新完整source cards與source result，但ev_A endpoint不變；調整A lane才同步改變兩路endpoint。

Invariant：
φ始終是同一張evaluation map；source operation只發生在R、target operation只發生在S；B lane不是被刪除，而是這張map沒有觀察它。

動態readout：
用自然語句先顯示兩條路，例如`先逐點相加再讀A → 0`與`先讀A得到1、3，再在target相加 → 0`。兩路重合後才壓縮成對應公式，不讓公式成為第一幕。

Evidence：
單一input pair只標`EXAMPLE · THIS PAIR COMMUTES`。Pointwise definition對任意f,g逐lane成立的說明標`GENERAL ARGUMENT`並放在最後壓縮層；不能因兩次動畫顯示`PROVED`。

觀念圖卡：
Ring homomorphism是一張同時尊重兩套wiring的翻譯；不是只把每張card指定一個新名字。

遷移檢查：
切到q:ℤ→ℤ/6ℤ、q(n)=n mod 6。固定inputs 8、5，要求在不依賴function lane的情況下畫出ADD或MULTIPLY的兩條路，並指出哪個world先運算、哪個world後運算。

正式展開：
φ(a+b)=φ(a)+φ(b)、φ(ab)=φ(a)φ(b)的完整量詞版本；兩側operation symbols可不同，但主流程為可讀性沿用+、·。
```

**擁擠檢查：** 本節只建立雙operation的preservation mechanism。Map是否injective／surjective、identity gate、kernel、image與composition都不進主流程。雖有ADD／MULTIPLY toggle，兩者是同一個insight的兩次audit，不是兩個新概念。

### 7.2 · 通過一條 rail，不會替另一條 rail 背書

**本節設計句：** 學完後，學習者應能主動尋找只保留一種operation的map，理解ADD preservation與MULTIPLY preservation是兩項邏輯獨立的義務。

```text
預測：
Map若已讓所有ADD squares對齊，MULTIPLY squares是否必然也對齊？先commit verdict，再選candidate做audit。

兩個candidate maps：
A. L:ℤ^{A,B}→ℤ，L(f)=2f(A)−f(B)
   - GENERAL ARGUMENT：L保addition，且L(1,1)=1。
   - WITNESS：x=(1,0)時L(x²)=2，但L(x)²=4，故不保multiplication。
B. abs:ℤ→ℤ，abs(n)=|n|
   - GENERAL ARGUMENT：|ab|=|a||b|，且abs(1)=1。
   - WITNESS：a=−1、b=1時abs(a+b)=0，但abs(a)+abs(b)=2，故不保addition。

操作變數：
- candidate map A / B
- audit rail：ADD / MULTIPLY
- TRY DECEPTIVE SAMPLE / REVEAL DECISIVE WITNESS / RESET
- witness出現前可自行選小範圍inputs

主要視覺：
沿用7.1同一座two-route bridge，不發明第二套detector。兩條operation rails始終並排顯示status：`GENERAL PASS`、`UNTESTED`或`WITNESS · endpoints differ`。主stage一次只展開active rail的intermediates，避免四條routes同時競爭注意。

因果：
切換candidate時bridge rule更新，但source／targetworld與audit grammar不變。成功sample只增加一筆example，不會把rail變成universal PASS；只有載入general argument才可標general pass。一個mismatch witness立即否決該rail。

Invariant：
同一candidate在兩條rails上的verdict彼此獨立。已通過rail不因另一rail失敗而改成紅色；整張map只因ring contract需要兩條都通過而未取得最終資格。

動態readout：
同時保留intermediate objects與兩個不同endpoints。例如L的乘法witness必須顯示`L(x²)=2`與`L(x)L(x)=4`，不能只顯示`MULTIPLY FAIL`。

Evidence：
成功試值標`EXAMPLE`；決定性反例標`WITNESS`；代數上涵蓋任意inputs的preservation argument標`GENERAL ARGUMENT`。不對infinite worlds使用finite exhaustion語言。

觀念圖卡：
Preserving ADD與preserving MULTIPLY是兩份合約；任何一份都不能替另一份簽名。

遷移檢查：
給negation n↦−n，只要求判斷應先在哪一條rail尋找witness並解釋理由；不新增第三個完整lab。

正式展開：
逐式證明L的additivity與abs的multiplicativity；說明「independent obligations」不代表存在一張map能任意選擇rules，而是任一項都不由另一項邏輯推出。
```

**擁擠檢查：** 兩個candidate看似是兩個例子，但共同承擔同一個對稱反例任務；不用另拆兩節。Identity status只以小badge保持可見，為避免把failure怪到identity，正式identity convention延至7.3。

### 7.3 · 兩條 operation routes 都對齊，仍可能漏掉 identity gate

**本節設計句：** 學完後，學習者應能辨認`φ(1_R)=1_S`是本課採用的ring-map convention中的獨立要求，而不是由保加法與保乘法自動得到。

```text
預測：
Zero map z:ℤ→ℤ、z(n)=0讓ADD與MULTIPLY的two-route audits全部對齊。它在本課是否算ring homomorphism？

操作變數：
- RUN ADD AUDIT / RUN MULTIPLY AUDIT
- SEND IDENTITY BEACON
- compare map：reduction q:ℤ→ℤ/6ℤ（primary完成後解鎖）

主要視覺：
7.1的雙rails縮成兩個已密封的route seals；中央另有不和input pairs混在一起的identity beacon。Source的1_R沿φ bridge前進，target的1_S dock固定可見。Zero map把beacon送到0，停在dock之外；reduction map則送到target residue class 1。

因果：
先跑兩條operation audits，zero map確實各自PASS；只有按SEND IDENTITY後才出現獨立failure。畫面不可回頭把兩條已通過rails染紅，因為那會錯誤暗示zero map其實不preserve operations。

Invariant：
Zero map rule、source／target rings與前兩項verdict保持不變；唯一新增檢查是identity image。

動態readout：
明示`z(ab)=0=z(a)z(b)`與`z(a+b)=0=z(a)+z(b)`仍成立，再顯示`z(1_ℤ)=0≠1_ℤ`。Final verdict寫`REJECTED BY THIS COURSE CONVENTION`，不寫成跨所有教材的絕對結論。

Evidence：
Zero map對兩項operation preservation使用`GENERAL ARGUMENT`；identity failure使用單一但完整的`WITNESS · 1_R maps to 0`。

觀念圖卡：
本課的ring map有三個入口：保ADD、保MULTIPLY、把ambient 1送到ambient 1；第三個不會由前兩個自動亮起。

遷移檢查：
切到q:ℤ→ℤ/6ℤ，只追蹤source 1與target 1，要求判斷identity gate；不重跑整章operation audits。

正式展開：
比較unital ring homomorphism與允許不保1的教材conventions；說明保multiplication只推出φ(1_R)在image上扮演identity／是一個idempotent，未必等於整個target的1_S。另在details推導保加法自動給φ(0)=0與φ(−a)=−φ(a)，避免把0也誤列成第四個獨立gate。
```

**擁擠檢查：** 本節只隔離identity convention。不同conventions不可做成主流程toggle；不引入zero ring、idempotent taxonomy或non-unital subrings，相關邊界只留在details。

### 7.4 · Map 的 collisions 不是散亂配對；它們會化成送往 0 的 differences

**本節設計句：** 學完後，學習者應能從`φ(f)=φ(g)`預測`φ(f−g)=0`，把many-to-one collision翻譯成source中一個被map看不見的additive difference。

```text
預測：
對ev_A:(ℤ/4ℤ)^{A,B}→ℤ/4ℤ，f=(1,0)與g=(1,2)被送到同一target 1。兩張source cards的difference會被送到哪個target？

操作變數：
- 選擇兩張source function cardsf、g
- COLLIDE / PACK DIFFERENCE / SEND TO TARGET三步控制
- toggle：same A-value pair / different A-value pair
- primary完成後TRANSFER · REDUCTION MOD 6

主要視覺：
先沿用Ch5的collision fibers：兩張完整function cards跨φ後落到同一target dock。接著不把cards消失，而是在source側把difference packet f−g=(0,2)抽出；packet跨橋後落到target的0 dock。三個狀態按步驟累積，讓collision、difference、zero fiber有可追蹤的一對一語意。

因果：
若兩張cards有相同A-value，target endpoints重合，difference的A lane必為0，因此ev_A(f−g)=0。切到不同A-value時，endpoints分離且difference packet不進0 dock。操作只改cards的A lane關係；φ與pointwise subtraction保持固定。

Invariant：
Source cards始終是完整functions，difference也仍是source ring element。`0`是target的additive identity，不是「畫面什麼都沒有」。B lane即使非零也可被ev_A看不見，精確呈現map遺失哪種資訊。

動態readout：
先用語句顯示「f與g看起來相同 ⇔ 它們的difference看起來像0」，再壓縮為`φ(f)=φ(g) ⇔ φ(f−g)=0`。本章只依賴additive preservation，不假裝使用multiplication得出此結論。

Evidence：
Primary cards提供`EXAMPLE`；雙向等價由φ(f−g)=φ(f)−φ(g)的推理標`GENERAL ARGUMENT`。Transfer中的8與2同餘mod 6則是第二個example，不冒充新proof。

觀念圖卡：
Homomorphism 的collision有結構：被混在一起的兩個inputs，正好相差一個被送到0的difference。

遷移檢查：
對q:ℤ→ℤ/6ℤ選8與2。要求先預測difference 6送到哪裡，再判斷14與2是否也collision，確認理解依附於zero-output difference而非function coordinate外觀。

通往下一章的未解問題：
若一個difference i已被φ送到0，拿任意ambient r乘它之後，ri是否仍會被φ看成0？主流程只把問題留在MULTIPLY rail前，不播放答案；Ch8再用雙operation contract推出absorption並命名kernel／ideal。

正式展開：
證明φ(a)=φ(b) iff a−b落入zero-output fiber。Kernel notation、kernel是ideal與其完整closure proof留到Ch8；本節details只可註明Group Theory中的identity fiber將在ring world獲得額外乘法結構。
```

**擁擠檢查：** 本節只建立collision／difference／zero-output三種表示的等價，不回答ambient multiplication後會發生什麼。若把absorption也做完，Ch8會失去需要ideal的問題動機。

### Ch7 畫面與實作約束

- **建議4 screens，不合併。** 7.1建立general two-route mechanism；7.2用雙向反例證明兩項義務獨立；7.3隔離identity convention；7.4把map collision翻成zero-output difference並交棒Ch8。合併7.2與7.3會把logical independence與definition scope混在同一判斷；合併7.1與7.4則會在第一次見ring map時同時負擔preservation與information loss。
- 7.1–7.3沿用同一座SOURCE／TARGET bridge與two-route rails。換candidate只能改bridge rule與intermediate cards，不能重新發明版型，使PASS／FAIL具有可比較性。
- Source與target必須有明確world labels與各自operation port；不能只畫一條跨越箭頭，使學習者誤以為map把source operation原封不動搬到target。
- Function-card pair shorthand一律可展開成A／B lanes；7.4的difference packet保留兩個lanes，不能把`(0,2)`畫成單一數字0。
- ADD／MULTIPLY除顏色外持續使用solid／double rail、不同port shape與文字。Route mismatch保留兩個endpoint位置、數值與來源標籤。
- 主stage一次只展開一項active audit。另一條rail只保留compact status，不讓四條路徑同時動畫。STEP ROUTES可逐段、重播、重設；reduced motion直接切換有編號的discrete states。
- 任何成功input sample只顯示`EXAMPLE`。Infinite examples不提供看似完整的scan按鈕；`GENERAL ARGUMENT`必須可點開查看它涵蓋任意inputs的reason。
- 7.3常駐`COURSE CONVENTION · UNITAL MAPS PRESERVE 1`，但7.1–7.2也保留小型convention badge，避免答案在章中途悄悄換scope。
- 本章不使用3D。核心是兩條exact routes、world ownership與endpoint equality；2D commuting layout能保持對應，3D只會讓跨world paths產生遮擋與錯誤的距離語意。
- **主流程概念預算：** 7.1只新增ring map的雙operation preservation；7.2只新增兩項義務的logical independence；7.3只新增identity convention gate；7.4只新增collision difference落入zero-output fiber。Kernel、ideal、image、composition、isomorphism與map taxonomy不進主流程。

### Ch7 完成驗收

在不打開formal layer時，學習者應能回答：

1. 為什麼ring map不能只看每個element被送到哪裡，而要比較two routes？
2. Source operation與target operation各自在route哪一段發生？
3. 為什麼preserve ADD不能保證preserve MULTIPLY，反向也不行？
4. 幾個成功samples、failure witness與general argument各能支持多強的結論？
5. Zero map為什麼通過兩項operation audits，卻被本課identity convention拒絕？
6. 為什麼φ(f)=φ(g)能翻譯成φ(f−g)=0？這裡用到哪一條operation preservation？
7. 把evaluation map換成reduction mod 6後，能否仍使用同一座bridge與difference模型推理？
8. 本章最後尚未回答的問題是什麼，為什麼它涉及ambient multiplication？

若學習者只會背三條公式、把任意function當homomorphism、認為通過一條operation就夠、把zero map誤說成不保乘法，或尚未分清zero-output difference與literal zero element，本章就還不算完成。

## Ch8 詳細 storyboard · 看不見的 difference，為什麼乘完仍看不見？

### 重新評估後的章節角色

Ch7最後只留下單一collision的結構：`φ(a)=φ(b)`恰好表示difference `a−b`被送到target 0。第八章不應立刻把這句換成kernel／ideal定義卡，而要回答三個依序不同的問題：

1. 所有被送到0的source elements合起來是什麼區域？
2. 這個區域為什麼對source的additive differences穩定？
3. 為什麼連boundary外的任意ambient multiplier也無法把它推出去？

只有三個behavior都可見後，才把這份boundary contract命名為ideal。Quotient、coset multiplication與「每個ideal都是某個quotient map的kernel」仍然延後，否則本章會同時教發現機制與用途，重新變成定義巡禮。

### 全章設計句

```text
核心 insight：
Kernel收集map看不見的additive differences；因ring map同時保留ADD與MULTIPLY，這個區域既能在difference下自我維持，也能承受整個ambient ring的任意乘法作用。這份穩定性正是ideal contract。

學習者原本可能怎麼誤解：
1. Kernel只是「剛好被送到0的幾個elements」，和map collisions沒有完整關係。
2. Kernel只需像subring一樣檢查boundary內部的inputs。
3. Absorption表示r與i相乘後在source ring裡真的等於0，或表示ambient r本身被吞進ideal。
4. 只要挑幾個multipliers成功留內，就已證明absorption。
5. Ideal是「條件比較多、所以更強的subring」，或一定要包含1。
6. Function evaluation的kernel是zero-coordinate區域，所以所有ideals都應長得像「某個coordinate為0」。

第一個具體問題：
對ev_A:(ℤ/4ℤ)^{A,B}→ℤ/4ℤ，把全部16張function cards依target output分成四條fibers。哪一整條fiber代表這張map完全看不見的source directions？

一般機制如何表述：
對ring homomorphism φ:R→S，kernel是zero-output fiber。若i、j在kernel，additive preservation迫使i−j仍在kernel；若r來自整個R而i在kernel，multiplicative preservation迫使ri仍在kernel。前者是internal additive stability，後者是ambient absorption，兩者角色不能混寫。

全章主要視覺模型：
保留Ch7的SOURCE R／TARGET S bridge。Target的0 dock向source反向照亮整條zero fiber，形成有實線boundary與`KER φ · ZERO-OUTPUT FIBER`標籤的區域。ADD difference port位於boundary內；MULTIPLY action port跨在boundary邊緣，清楚顯示r可來自外部、只有product被要求落回內部。

全章保持不變的東西：
Map φ、source／target worlds與kernel membership保持固定；各節只依序改變目前追蹤的是fiber、internal difference或ambient multiplication。任何source product是否等於0與其是否落在kernel分開顯示。

Course convention與scope：
主線仍使用commutative rings with identity，因此寫ri即可。Kernel結論本身不靠φ保留1；noncommutative worlds中的left／right／two-sided ideals差異放正式展開。Ideal不要求包含1；含有1的ideal會被迫等於整個ring。

正式內容放在哪個展開層：
kerφ=φ^{-1}({0_S})；kernel的additive subgroup proof與absorption proof；ideal的量詞定義；noncommutative left／right distinction；為何含1的ideal等於R。Quotient construction與every ideal is a kernel不在本章展開。

最後如何檢查能否遷移：
把evaluation map換成q:ℤ→ℤ/6ℤ。學習者能否把kernel辨認為6ℤ，預測兩個multiples of 6的difference，以及解釋任意integer r乘上6k後為何仍在6ℤ，而不依賴coordinate-zero外觀？
```

### 主例子與 accidental-property audit

主例子沿用：

```text
R = (ℤ/4ℤ)^{A,B}
S = ℤ/4ℤ
φ = ev_A
ker φ = { (0,b) : b∈ℤ/4ℤ }
```

它能讓zero-output fiber、完整function cards與pointwise multiplication同時可見，但有四項風險：

1. **Kernel恰好由「A lane為0」描述。** 這只是evaluation map的fiber geometry；8.1與8.3完成primary後，使用`q:ℤ→ℤ/6ℤ`把相同機制轉成multiples-of-6 pattern。
2. **Pointwise multiplication使support不會跨lane。** 可能誤以為absorption來自coordinate位置，而非homomorphism law；8.3必須同步顯示target route`φ(r)·0=0`作general reason。
3. **某些multiplier會把i真的乘成zero function。** 預設必須使用non-degenerate state `r=(2,3)`、`i=(0,1)`，得到`ri=(0,3)≠0_R`，讓「留在kernel」與「等於source zero」真正分開。
4. **Function ring是commutative。** UI常駐`COURSE SCOPE · COMMUTATIVE`; noncommutative order問題不藉由動畫假裝不存在，而放details解釋left／right distinction。

本章的角色標記固定為：

```text
i, j  · INSIDE KERNEL
r     · ANY AMBIENT ELEMENT（預設在boundary外）
ri    · PRODUCT REQUIRED INSIDE KERNEL，但不必等於0_R
0_S   · TARGET ZERO DOCK
```

這些角色不得因數值碰巧相同而共用一張無標籤card。

---

### 8.1 · Kernel 是整條 zero-output fiber，不是零星失敗名單

**本節設計句：** 學完後，學習者應能把核（kernel）辨認為target 0的完整preimage，並用它描述map究竟看不見哪些source differences。

```text
預測：
ev_A只讀A lane。16張source function cards中，kernel只有zero function (0,0)，還是包含所有(0,b)？先選boundary，再照亮target 0的完整fiber。

操作變數：
- target dock：0 / 1 / 2 / 3
- TRACE PREIMAGE / RESET
- target 0完成後才可顯示KERNEL label

主要視覺：
左側4×4 function-card board固定A／B lanes，不以座標位置暗示數學距離；右側四個target docks。選一個dock時，φ bridge反向亮起所有preimage cards。選0時用實線boundary圈住(0,0)、(0,1)、(0,2)、(0,3)，但每張card仍完整顯示A與B values。

因果：
切換target dock只改目前追蹤的fiber，不重排source cards。選target 2會看到另一條同大小fiber，但只有target 0那條取得kernel名稱，因為0是target additive identity。Kernel揭露後只用一張不可操作的`CALLBACK · Ch7.4`小圖顯示「collision difference落在此處」，不重做pair selector。

Invariant：
φ始終只讀A lane；所有fibers都是map的preimages，但kernel專指zero-output fiber。B lane非零的card仍可在kernel中，防止kernel等同literal zero element。

動態readout：
明示`4 source cards map to target 0`與目前完整set；不得只顯示`kernel size=4`。選其他fiber時寫`FIBER OVER 2 · NOT THE KERNEL`。

Evidence：
16張cards的完整掃描標`FINITE EXHAUSTION · THIS FINITE MAP`。`Kernel一般定義為zero preimage`是definition，不把有限掃描冒充一般theorem。

觀念圖卡：
Kernel不是「source裡的0」；它是所有被map看成target 0的完整區域。

遷移檢查：
給q:ℤ→ℤ/6ℤ與integer window，要求從0 dock反推可見的preimages並預測window外的pattern；畫面明示finite window只能support pattern，`ker q=6ℤ`需由mod rule的general argument確認。

正式展開：
核（kernel）首次標註英文與notation `kerφ=φ^{-1}({0_S})`；preimage／fiber術語回顧。Kernel與所有collision differences的雙向關係引用7.4，不重做完整證明。
```

**擁擠檢查：** 本節只建立整個zero-output region與名稱。尚不檢查difference closure或ambient multiplication；Ch7 collision只作一張靜態callback，不形成第二個exploration lab。

### 8.2 · 看不見的 differences，相減後仍然看不見

**本節設計句：** 學完後，學習者應能從ADD preservation預測：若i、j都落在kernel，則i−j也落在kernel，因為target只會看到0−0。

```text
預測：
從kernel選i=(0,1)、j=(0,3)。不先計算完整output，預測i−j會逃出boundary，還是仍被ev_A送到0？

操作變數：
- kernel inputs i、j
- PACK DIFFERENCE / SEND BOTH ROUTES / RESET
- general route完成後出現一張固定的`BROKEN ASSUMPTION`判斷卡，不增加outside-input自由控制

主要視覺：
沿用8.1的kernel boundary。兩張inside cards進入solid ADD-difference port，output card仍保留兩個lanes。右側同步顯示target route：i、j各自過φ得到0、0，再做0−0。兩條routes在target 0 dock重合。

因果：
改變i(B)、j(B)會改變source difference的B lane，但A lane始終0，因此output沿source route留在kernel。Primary general route完成後，固定challenge改成一張outside card，要求學習者指出哪個前提消失；不讓額外controls稀釋主因果。

Invariant：
Map、kernel boundary與difference operation不變；本節不使用multiplication。`i−j`可能不是zero function，但其image仍是0。

動態readout：
同步顯示source statement`i−j=(0,2)∈kerφ`與target reason`φ(i−j)=φ(i)−φ(j)=0−0=0`。不可把結論只歸因於「A lane看起來沒變」。

Evidence：
Function example標`EXAMPLE`；two-route algebra對任意i、j∈kerφ成立，標`GENERAL ARGUMENT`。Outside toggle是`BROKEN ASSUMPTION`，不是反例於theorem。

觀念圖卡：
Kernel內的invisible differences可以再相減；target仍只看見0。

遷移檢查：
在ker q=6ℤ中選18與−6，先預測difference 24，再解釋為何它仍被q送到[0]₆；不使用function lanes。

正式展開：
Nonempty與subtraction closure如何使kerφ成為additive subgroup；φ(−j)=−φ(j)來自Ch7的additive preservation consequence。完整量詞proof放details。
```

**擁擠檢查：** 本節只建立internal additive stability。雖然視覺形式像Ch6 difference port，問題已改為「map visibility是否保持」，而不是subring autonomy；multiplication port保持鎖定。

### 8.3 · Ambient multiplier 可以來自外面；product 仍留在看不見區域

**本節設計句：** 學完後，學習者應能直覺看見吸收性（absorption）要求的是`r∈R`、`i∈I`時`ri∈I`，而不是要求r也在I，更不是宣稱ri=0_R。

```text
預測：
固定kernel element i=(0,1)，把boundary外的ambient r=(2,3)送入multiplication port。Product會逃出kernel、變成zero function，還是成為另一張nonzero kernel card？

操作變數：
- kernel element i固定為(0,1)，避免同時移動兩種角色
- ambient multiplier r：預設outside kernel，只調整r的A／B lanes
- MULTIPLY / TRACE TARGET REASON / RESET
- primary完成後解鎖TRANSFER · q:ℤ→ℤ/6ℤ

主要視覺：
Kernel boundary位於source board中央，i在內；r card明確放在ambient R但boundary外。跨boundary的double-line MULTIPLY port只把product card送回boundary，不移動r本身。Target側保持φ bridge與0 dock，顯示φ(r)與φ(i)=0相乘。

因果：
預設r=(2,3)、i=(0,1)得到ri=(0,3)：product非zero function但仍在kernel。學習者只改r，source product即時更新；i與其zero image固定，隔離「任意ambient r都無法推出boundary」這一項因果。前提破壞留作固定challenge，不在primary lab再加入i toggle。

Invariant：
r始終是ambient input，不需要加入kernel；i始終提供zero image。Product membership與literal source-zero status用兩個獨立badges顯示：`IN KERNEL`／`EQUALS 0_R`。

動態readout：
主句優先顯示`ri=(0,3)≠0_R, but ri∈kerφ`；次句才顯示target reason`φ(ri)=φ(r)φ(i)=φ(r)·0=0`。避免把absorption誤讀成annihilation。

Evidence：
可調function state是`EXAMPLE`；使用homomorphism law與zero absorption涵蓋任意r∈R、i∈kerφ，標`GENERAL ARGUMENT`。Slider掃過多值不升格為proof。

觀念圖卡：
Ideal absorption不是把product乘成source 0；而是任意ambient action都無法把invisible difference推出boundary。

遷移檢查：
對q:ℤ→ℤ/6ℤ固定i=6、r=5，顯示ri=30≠0_ℤ但q(30)=[0]₆；要求指出哪個角色對應ambient r、kernel i與target zero。

正式展開：
完整proof `φ(ri)=φ(r)φ(i)=φ(r)0=0`。在noncommutative ring中，要求RI⊆I、IR⊆I或兩者分別對應left、right與two-sided ideal；主線commutative所以不新增order controls。
```

**擁擠檢查：** 本節只有一個新mechanism：ambient absorption。Source／target同步視圖不是第二個insight，而是專門拆開`ri∈kerφ`與`φ(ri)=0`。不在此列ideal定義或比較subring。

### 8.4 · Difference stability 加上 ambient absorption，才是 ideal contract

**本節設計句：** 學完後，學習者應能把前兩節壓縮成理想（ideal）的兩個ports，並解釋為何每個ring-map kernel自動通過，而不是把ideal背成一種特殊形狀。

```text
預測：
Kernel已通過internal difference port與ambient multiplication port。還需要像本課subring convention一樣要求1_R在boundary內嗎？

操作變數：
- lens：INTERNAL DIFFERENCE / AMBIENT ABSORPTION
- replay 8.2／8.3 accumulated evidence
- candidate transfer：ker(ev_A) / ker(q mod 6)
- 一張NEXT QUESTION card：previous subring boundary是否必然通過ambient port？只commit預測，不在本章揭曉完整比較

主要視覺：
不是axiom wall，而是一個two-port boundary contract。第一個solid ADD port標`i−j stays inside`；第二個跨boundary double MULTIPLY port標`r·i stays inside for every r∈R`。Identity 1_R停在boundary外且附`NOT REQUIRED`標記。兩個ports都由前頁general arguments接上proof cable後，中央才出現`IDEAL`名稱。

因果：
切換lens只聚焦某一port與它的roles，另一port保留已通過status。切換到6ℤ時boundary外觀從function cards變成integer rail，但兩個ports與role labels不變，顯示definition依附的是mechanism而非形狀。

Invariant：
Ideal contract始終要求nonempty additive difference closure與all-ambient multiplication closure；不因representation改變。1_R不作為entry requirement；若將1_R手動放入，UI只留下future note，不在主流程展開proper／improper taxonomy。

動態readout：
使用兩欄：`INTERNAL ADDITIVE STABILITY`與`EXTERNAL MULTIPLICATIVE STABILITY`。Final verdict為`GENERAL THEOREM · EVERY RING-MAP KERNEL IS AN IDEAL`，並列出兩條各自的reason來源。

Evidence：
Kernel→ideal使用兩個`GENERAL ARGUMENTS`，不是有限model scan。ev_A與mod-6只是representations；切換example不會新增或刪除proof obligations。

觀念圖卡：
Ideal是能容納invisible differences、又承受整個ambient ring乘法作用的boundary；kernel天然具有這份contract。

遷移檢查：
面對6ℤ，要求不用kernel名稱也能逐port解釋：兩個multiples of6的difference仍是multiple of6，任意integer乘multiple of6仍是multiple of6。

通往下一章的未解問題：
Ch6的subring boundary檢查的是internal product，這裡ideal檢查的是ambient-times-inside。兩者到底誰包含誰、是否只是強弱差異？本節只讓學習者commit預測，Ch9用受控反例正式拆開。

正式展開：
在commutative ring R中，nonempty subset I若對i,j∈I有i−j∈I，且對r∈R、i∈I有ri∈I，就稱I為ideal。說明0 ideal與whole-ring ideal皆允許；若1_R∈I，則任意r=r1_R∈I，因此I=R。Proper ideal術語只作後續prime／maximal章預告。
```

**擁擠檢查：** 本節是behavior壓縮與命名，不新增generated ideals、principal ideals、quotients或ideal examples catalogue。與subring的差異只留下精準問題，不在同一頁完成Ch9。

### Ch8 畫面與實作約束

- **建議4 screens，不合併。** 8.1建立zero-output region；8.2單獨建立additive stability；8.3單獨建立ambient absorption並修正常見語意錯誤；8.4才壓縮成ideal contract。若合併8.2與8.3，inside／outside input roles與兩種operations會擠在同一主stage；若把8.1併入8.4，kernel會退化成先背notation。
- 8.1–8.4保持同一張ev_A source board、φ bridge與target zero dock。只切換目前的inspection layer，不重新排列cards，使「同一區域獲得更多結構」可累積。
- Kernel boundary不能只用暗色底。使用實線輪廓、`IN KERNEL／OUTSIDE`文字與card membership glyph；target zero必須畫成有label的additive identity dock，不是空白或消失動畫。
- 8.3的r、i、ri始終保留不同role badges。r從boundary外進入operation port，但r card本身不被拖進boundary；product另生成新card，避免「ambient element被ideal吞掉」的假暗示。
- `ri∈I`與`ri=0_R`使用兩個獨立status indicators。預設state必須讓前者true、後者false；只有使用者刻意選到annihilating multiplier時才同時true。
- Function-card pair shorthand仍可展開A／B lanes。Transfer到6ℤ時保留同樣roles，不把integer divisibility做成無限rail的視覺proof；finite viewport有ellipses與`GENERAL ARGUMENT`來源。
- 所有universal claims明示evidence。Complete 16-card fiber scan只能證明目前finite ev_A model；difference／absorption proofs必須走symbolic two-route reason，不能以滑遍controls冒充。
- 8.4的ideal contract只用兩個大型ports，不做多張同尺寸definition cards。Identity顯示`NOT REQUIRED`但不成為第三個自由探索區。
- 本章不使用3D。核心關係是set membership、source／target fibers與inside／outside roles；2D能精確顯示boundary crossing，3D會引入沒有數學語意的深度與容器體積。
- **主流程概念預算：** 8.1只新增kernel／zero fiber；8.2只新增kernel的additive stability；8.3只新增ambient absorption；8.4只新增ideal名稱與two-port contract。Quotient、generated ideal、principal ideal、proper ideal taxonomy與every ideal is a kernel都不進主流程。

### Ch8 完成驗收

在不打開formal layer時，學習者應能回答：

1. Kernel為什麼是target 0的完整fiber，而不只是source的literal zero？
2. 一般fiber與kernel有何差別？
3. 若i、j都在kernel，為什麼i−j仍在kernel？這一步只使用哪項preservation？
4. Absorption中的r與i分別可以來自哪裡？為什麼r不必在kernel？
5. 為什麼`ri∈kerφ`不代表`ri=0_R`？兩個0分別住在哪個world？
6. `φ(ri)=0`的一般理由是什麼，為什麼試很多multipliers仍不等同proof？
7. Ideal contract的兩個ports各自處理哪一種穩定性？為什麼不要求包含1_R？
8. 把ev_A換成reduction mod6後，能否不靠zero-coordinate圖形重建相同推理？
9. 本章刻意留給Ch9的subring／ideal問題是什麼？

若學習者把kernel等同source zero、把absorption說成annihilation、只測inside multipliers、認為ideal必須含1、或只能在function-coordinate例子中辨認boundary，本章就還不算完成。

### Ch7→Ch8→Ch9→Ch10 串接與擁擠度稽核 · 2026-08

#### 結論：Ch8維持4節，但收斂controls；不改章序

```text
Ch7.4 · 一個collision difference被送到0
   ↓ 尚未命名整個區域，也未回答multiplication
Ch8.1 · 從一個packet放大為完整zero-output fiber · kernel
Ch8.2 · ADD preservation給internal difference stability
Ch8.3 · MULTIPLY preservation給ambient absorption
Ch8.4 · 壓縮成ideal contract
   ↓ 尚未比較subset問題，也未生成boundary
Ch9   · subring與ideal回答不同問題
   ↓ 已能辨認contract，尚未知道seed如何迫使boundary長大
Ch10  · generated ideal是被ambient action與addition強迫的minimal closure
```

這條順序沒有循環依賴：Ch8只從已知ring map推出kernel behavior；不需要quotient才能理解ideal contract。Ch9只比較兩種boundary questions；Ch10才進入construction。Every ideal is a quotient kernel延至quotient已建立後再回看，避免用尚未理解的物件替當前概念背書。

#### 與前章不重複的界線

1. **Ch7.4→8.1不是重教collision。** Ch7操作一對inputs並建立`same output ⇔ difference maps to 0`；8.1禁止pair selector，改問整張map的zero preimage。畫面以`CALLBACK`靜態縮圖承接，不重播舊interaction。
2. **Ch6→8.2不是重教subtraction closure。** Ch6的reason是candidate boundary要能自給自足；8.2的reason是map preservation使`0−0`仍為0。8.2必須同時顯示source與target route，並標`SAME OPERATION · NEW REASON`。
3. **Ch3→8.3不是重教zero absorption。** Ch3的statement在單一ring內是`x·0_R=0_R`；8.3的source product通常不是0_R。Ch3只在target proof route中作callback：`φ(r)·0_S=0_S`。
4. **Ch5→8.3角色不同。** Ch5固定multiplier並研究它是否壓掉input distinction；Ch8固定invisible input i，讓任意ambient multiplier r作用。Controls與role badges不得沿用到讓兩者看似同一test。

#### 為後章保留的空間

- **Ch9仍保留真正的雙向反例。** Ch8不展示`2ℤ`與diagonal matrices，也不回答subring／ideal誰較強；8.4只把`internal product`與`ambient-times-inside`的差異寫成待判斷問題。
- **Ch10仍保留growth mechanism。** Ch8只檢查已給定boundary，沒有seed、frontier、forced card或minimality controls。
- **Ch12仍保留well-definedness動機。** Ch8不談representatives、cosets或quotient multiplication。
- **Ch14仍保留global information factorization。** Ch8只辨認zero fiber及其stability；不宣稱quotient by kernel與image等價，也不做First Isomorphism Theorem動畫。

#### 每節概念與互動負擔

| Screen | 唯一新增 insight | Primary controls | 刻意刪除／延後 |
|---|---|---|---|
| 8.1 | kernel = zero-output fiber | target dock、trace preimage | 刪除pair selector；collision只作callback |
| 8.2 | kernel對difference穩定 | 選i、j、step two routes | outside case改固定challenge；不開multiply |
| 8.3 | ambient absorption | 只調ambient r、step product route | 固定i；不做ideal definition或i自由探索 |
| 8.4 | two-port ideal contract | inspection lens、representation transfer | 不做candidate catalogue、generated ideal或quotient |

每頁最多一個真正自由探索區。Transfer與broken-assumption challenge都在primary observation完成後出現，且不與主controls同時競爭首屏焦點。

#### 最理想的視覺與互動判斷

- **8.1用fiber scanner，不用吸力動畫。** Preimage是set relation，不是物理吸引；target dock照亮source cards比把cards吸過去更準確。
- **8.2用同步two-route proof。** 單靠boundary內卡片相減只證明目前example；target的`0−0`route才讓general mechanism可見。
- **8.3用跨boundary action gate。** r停在ambient side，product另行生成於inside；這比把r拖進容器更能防止「r也成為ideal member」的錯覺。
- **8.3採雙status readout。** `PRODUCT IN KERNEL`與`PRODUCT = 0_R`分開，預設一真一假；這是全章最重要的misconception repair，不可縮成一句註腳。
- **8.4用兩個大型ports，不用Venn diagram或強弱meter。** Ideal與subring不是單一包含順序；強弱meter會提前製造Ch9要拆除的錯覺。
- **不使用3D。** Depth、volume與distance在kernel／ideal membership中沒有額外數學語意；2D fixed board、exact routes與role labels提供更高information fidelity。

#### 1920×1080首屏焦點預算

- 8.1主stage只同時高亮一個target dock與一條source fiber。
- 8.2主stage只高亮i、j、i−j與target 0，共四個semantic objects；其他kernel cards降階但不消失。
- 8.3主stage同時高亮r、i、ri與target zero route；source／target的兩個0必須有world subscript或文字label。
- 8.4首屏只顯示two-port contract與一個active lens；formal definition、zero／whole ideals及noncommutative distinctions全在secondary layer。

若實作時任一頁需要同時顯示兩組自由controls、兩個主要verdict或五個以上同層高亮objects，應先刪控制或拆狀態，不增加文案解釋擁擠的UI。

## Ch9 詳細 storyboard · Subring 與 ideal 把 multiplication inputs 接在不同地方

### 重新評估後的核心問題

舊規畫以`2ℤ`與diagonal matrices作雙向反例，數學上可行，但不是目前最佳教學組合。它同時更換ambient world、representation與commutativity，學習者可能把差異歸因於「integers vs matrices」，而非兩種boundary contracts本身。

新版主線固定在同一個commutative function ring：

```text
R = (ℤ/4ℤ)^{A,B}
D = { (c,c) : c∈ℤ/4ℤ }          · constant functions
K = { (0,b) : b∈ℤ/4ℤ } = ker ev_A
```

`D`與`K`使用同一批cards、同一套pointwise operations與同一ambient identity。唯一真正改變的是boundary membership與multiplication input scope，因此能做受控比較。

### 全章設計句

```text
核心 insight：
Subring與ideal不是同一條「條件強弱」刻度。Subring要求inside elements沿ambient operations自給自足並共享1_R；ideal則要求inside additive differences承受每一個ambient multiplier。兩者的multiplication input wiring不同，identity obligation也不同。

學習者原本可能怎麼誤解：
1. Ideal只是條件更多、比較厲害的subring，所以每個ideal一定是本課的subring。
2. Subring既然對multiplication closed，就應該自動吸收所有ambient multipliers。
3. Ideal必須像subring一樣包含1_R。
4. Ideal absorption既然允許r來自R，應該會把r本身也拉進I。
5. 在一個example中兩種verdict相同，就代表兩個definitions等價。
6. `D`與`K`看起來都是四張function cards，所以應該取得同一structure label。

第一個具體問題：
同一個candidate boundary畫在function-card world中。若multiplication的兩個input sockets都鎖在boundary內，與其中一個socket接到整個ambient R，究竟是在問同一件事，還是兩種不同的stability？

一般機制如何表述：
Subring的multiplication quantifiers是`s,t∈S ⇒ st∈S`，並在本課要求`1_R∈S`；ideal的multiplication quantifiers是`r∈R, i∈I ⇒ ri∈I`，但不要求`1_R∈I`。Ideal absorption自動涵蓋inside×inside，卻沒有補上ambient identity；subring identity與internal product也無法控制outside×inside。

全章主要視覺模型：
同一張fixed ambient board並排兩套不可混用的port wiring：
- SUBRING lens：兩條input wires都起於boundary內，另有ambient 1_R entry gate。
- IDEAL lens：一條wire起於ambient board任意位置、一條起於boundary內，沒有1_R entry gate。
兩個panels始終同時存在；切換lens只改注意力層級，不播放「inside wire向外擴張」的morph，避免暗示ideal是subring升級版。

全章保持不變的東西：
Ambient R、pointwise operations、card positions與1_R位置固定；只切換candidate D／K與目前檢查的contract。任何PASS／FAIL必須附general reason或decisive witness，不能由boundary大小或形狀猜測。

Course convention與scope：
本課subring採same ambient identity；ideal不要求含1。因而在本課分類中，subring與ideal兩類互不包含。若採non-unital subring convention，commutative ring的ideal會自動是一個non-unital subring；此差異必須在9.3明示，不能把course convention冒充universal taxonomy。

正式內容放在哪個展開層：
兩種tests的完整quantifiers；ideal absorption為何推出internal multiplication closure；alternative subring conventions；whole ring同時是subring與ideal；zero ideal為何不是本課same-identity subring。Isomorphism、module與left/right ideal仍不進主線。

最後如何檢查能否遷移：
把function examples換成`ℤ⊂ℚ`與`2ℤ⊂ℤ`。學習者能否只看input scopes與identity gate，判斷前者subring-only、後者ideal-only，而不是背D／K的card外觀？
```

### 主例子與 accidental-property audit

#### Constant-function boundary D

`D={(0,0),(1,1),(2,2),(3,3)}`沿用ambient identity `(1,1)`，且pointwise difference與product都保持constant，因此是本課subring。

它的ideal failure使用non-degenerate witness：

```text
r = (1,0) ∈ R\D
c = (2,2) ∈ D
rc = (2,0) ∉ D
```

不使用`c=(1,1)`，避免product剛好等於r，使學習者誤以為failure只和identity有關。

#### Kernel boundary K

`K={(0,0),(0,1),(0,2),(0,3)}`已由Ch8的一般arguments證明是ideal。它的subring failure只來自本課identity gate：`1_R=(1,1)∉K`。Difference與internal product其實都留在K，畫面不能把它們錯標FAIL來湊結論。

#### 共同的例子偏差

1. **D與K都恰好有四張cards。** Boundary size不具有判定力；9.1固定相同size正是為了讓input wiring成為唯一焦點。
2. **K有zero-coordinate外觀。** 9.4 transfer到`2ℤ`，解除ideal等於coordinate-zero的錯覺。
3. **Function ring是commutative。** 本章刻意不引入matrices；left／right scope留在details，避免比較主線被order問題分叉。
4. **Ideal absorption蘊含internal product closure。** 這表示兩份contracts不是完全無關的任意axes；真正的交叉來自ambient quantifier較廣、但ideal不要求1。主文必須說出這個不對稱，不能只寫「兩者完全獨立」。

---

### 9.1 · 關鍵不是boundary大小，而是input wires從哪裡接進來

**本節設計句：** 學完後，學習者應能只看multiplication inputs的quantifier scope，分辨subring的internal closure與ideal的ambient absorption。

```text
預測：
固定同一個四張card boundary。把MULTIPLY port的一條input wire從inside改接到整個ambient board，這只是測試變嚴格，還是問題本身換了角色？

操作變數：
- lens：SUBRING CONTRACT / IDEAL CONTRACT
- TRACE INPUT ORIGINS / RESET

主要視覺：
Ambient function board與candidate boundary完全固定，左右兩個等寬panels同時顯示。Subring panel中，s、t兩張cards都由boundary內連到operation port，1_R另由ambient位置接進entry gate。Ideal panel中，i留在boundary內，另一條wire直接起於ambient任意r；identity位置顯示`NOT REQUIRED`label，而不是被畫成PASS。Panels沒有左右箭頭或階梯連線。

因果：
切換lens時cards、boundary與wires全不移動，只讓目前panel提高contrast並逐段標出input origins。學習者點TRACE後，subring route讀`inside×inside`，ideal route讀`ambient×inside`。兩個panels都trace過後，difference共同點與identity差異才在底部summary出現。

Invariant：
兩種contracts都沿用ambient operations，且都需要additive difference stability。不同的只有multiplication quantifiers與identity obligation。

動態readout：
使用roles而非只顯示formula：`s,t must both live inside` vs `r may come from anywhere in R; i must live inside`。Identity列獨立顯示`REQUIRED`／`NOT REQUIRED`。

Evidence：
本頁是`DEFINITION SCOPE · INPUT WIRING`，不對目前匿名boundary給PASS／FAIL。避免在尚未提供membership evidence時靠圖形猜結論。

觀念圖卡：
Subring問inside能否自己生活；ideal問inside能否承受整個ambient world的乘法作用。

遷移檢查：
給兩句未命名的quantifiers，要求只依input origins配回SUBRING／IDEAL，不使用名詞定義順序作線索。

正式展開：
並排寫出本課subring test與commutative ideal test；說明兩者都使用subtraction壓縮additive subgroup checks。
```

**擁擠檢查：** 本節不判斷D或K，也不做counterexample。Difference與identity只在兩個panels底部作persistent scope row，唯一互動問題是追蹤multiplication wire origins。

### 9.2 · Constant functions 能在內部生活，卻擋不住外部 multiplier

**本節設計句：** 學完後，學習者應能用一個ambient-times-inside escape witness說明：subring的internal multiplication closure不會自動升格成ideal absorption。

```text
預測：
D中的任兩constant functions相乘仍constant。這能否保證任意ambient function r乘上c∈D後仍constant？

操作變數：
- callback audit：DIFFERENCE / INTERNAL PRODUCT / IDENTITY（三個已完成seals，只能inspect reason）
- ambient r固定起始(1,0)，可在primary後調整
- inside c固定(2,2)
- RUN AMBIENT WITNESS / RESET

主要視覺：
同一個D boundary先顯示三個compact subring seals。接著沿用9.1 ideal wiring：r=(1,0)從boundary外接入、c=(2,2)從內接入double-line port，生成完整product card(2,0)，並保留一條明確escape route到D外。

因果：
Primary固定c，只讓r跨入port；product由(2,2)變成(2,0)並逃逸。完成witness後才允許調r，且任何成功sample只標EXAMPLE，不會消除既有failure witness。

Invariant：
D的subring seals保持通過；ideal failure不會把internal product或identity seal改紅。Ambient world與operations沒有改，新增的只有outside input scope。

動態readout：
同時顯示`c∈D`、`r∈R\D`與`rc=(2,0)∉D`。Verdict寫`SUBRING ✓ · IDEAL ×`，並附`WITNESS · AMBIENT ESCAPE`。

Evidence：
Subring status由Ch6-style general checks支持；ideal failure由單一decisive witness支持。調slider找到inside product只是一個成功example，不能改變universal claim已被否決的事實。

觀念圖卡：
Internal product closure只管理inside×inside；boundary外的multiplier沒有簽這份合約。

遷移檢查：
給`ℤ⊂ℚ`，固定inside element1與ambient multiplier1/2，要求指出product逃到哪裡；明示兩個world共用1，所以failure不是identity造成。

正式展開：
證明constant functions形成unital subring；展示ambient witness。`D≅ℤ/4ℤ`不進主流程，最多留optional note。
```

**擁擠檢查：** 本節只證明subring不推出ideal。Subring三個ports不重新互動教學，只作Ch6 accumulated evidence；primary自由變數只有ambient r。

### 9.3 · Kernel 承受所有ambient multipliers，卻沒有本課subring需要的1

**本節設計句：** 學完後，學習者應能精確說明：ideal absorption涵蓋internal product closure，但不會把ambient identity加入boundary；因此proper ideal在本課convention下不是subring。

```text
預測：
K=ker(ev_A)已通過difference與ambient absorption。是否可直接判定它也通過本課subring contract？

操作變數：
- replay accumulated seals：DIFFERENCE / AMBIENT ABSORPTION
- DERIVE INTERNAL PRODUCT
- SEND AMBIENT IDENTITY / RESET
- 不提供alternative-convention toggle

主要視覺：
K boundary先顯示Ch8兩個ideal seals。按DERIVE INTERNAL PRODUCT時，把ambient r限制成另一張inside card，顯示inside×inside只是absorption的一個special case。接著(1,1) identity beacon前往subring entry gate，但停在K boundary外。

因果：
Internal product seal由更廣的ambient port導出，不需要重新finite scan。Identity beacon的位置始終固定；按SEND只揭示membership，不把它吸入K。Final verdict只在identity check後出現。

Invariant：
K的ideal status與internal product closure都保持PASS；subring failure只標在same-identity gate。不能為了視覺對稱把其他ports一起標FAIL。

動態readout：
依序顯示`ambient×inside includes inside×inside`與`1_R=(1,1)∉K`。Final verdict：`IDEAL ✓ · SUBRING × · UNDER THIS COURSE CONVENTION`。

Evidence：
Ideal status與derived internal product是`GENERAL ARGUMENT`；identity failure是直接membership witness。Scope badge常駐，不把convention-dependent verdict寫成universal theorem。

觀念圖卡：
Ideal的multiplication reach更廣，但它沒有subring的identity entrance；兩份contracts因此不能排成單一直線。

遷移檢查：
給`2ℤ⊂ℤ`：先解釋ambient multiplication為何留在2ℤ，再指出1_ℤ不在2ℤ。若教材允許non-unital subrings，verdict哪一部分會改變放feedback說明。

正式展開：
在commutative ring中ideal必對internal multiplication closed；若subring不要求ambient 1，ideal也會是non-unital subring。Course convention差異完整說明放details。
```

**擁擠檢查：** 本節只證明ideal不推出「本課same-identity subring」。Absorption不重做Ch8 lab；唯一新操作是identity membership。Alternative convention只解釋，不允許toggle偷偷改變主線definition。

### 9.4 · 兩種contracts形成二軸分類，不是一條強弱階梯

**本節設計句：** 學完後，學習者應能獨立檢查subring contract與ideal contract，把candidate放入both／subring-only／ideal-only／neither四種位置。

```text
預測：
若用一條「普通subset→subring→ideal」階梯排列所有candidates，哪兩個已知examples會互相矛盾？

操作變數：
- matrix anchors預先放好：R=both、C={(0,0),(1,0)}=neither
- learner只放兩張核心candidate cards：D、K
- 兩個binary axes：SUBRING CONTRACT / IDEAL CONTRACT（只讀evidence，不讓使用者任意改verdict）
- PLACE CARD / CHECK REASON / RESET
- matrix完成後解鎖TRANSFER PAIR：ℤ⊂ℚ、2ℤ⊂ℤ

主要視覺：
2×2 contract matrix，axes寫完整問題而不是只放名詞：`internal autonomy + same 1`與`ambient absorption`。R與C已作為both／neither neutral anchors；學習者只需放入D與K。四cells同尺寸、同亮度，axes沒有箭頭、低高刻度或progress方向。

因果：
選D或K後，兩條axis evidence逐一展開，learner先commit cell再PLACE。錯放時feedback只指出哪一條contract判斷錯，不一次公布另一張card。D與K都完成後才顯示`NO LINEAR RANKING`並解鎖transfer pair。

Invariant：
四個candidates住在同一R、使用同一operations與同一card positions。Axes不因candidate改變；只有evidence verdict切換。

動態readout：
- R：both
- D：subring-only
- K：ideal-only under course convention
- C：neither
每張card附最短decisive reason，不顯示名詞百科。

Evidence：
D／K沿用9.2／9.3的general reasons與witness；R由definitions直接通過；C以missing identity與difference／ambient escape witnesses否決。Matrix是已建立evidence的classification，不是simulation。

觀念圖卡：
不要問「哪個比較強」；先問你要的是internal world，還是ambient-stable difference region。

遷移檢查：
把`ℤ⊂ℚ`放到subring-only，把`2ℤ⊂ℤ`放到ideal-only，要求各指出一條decisive reason。Alternative non-unital convention只改第二張的subring axis，不改ideal axis。

通往下一章的未解問題：
現在能檢查一個已給定boundary，卻還不知道從seed出發時ideal contract會強迫加入哪些elements。Ch10才引入generated ideal frontier。

正式展開：
兩類在本課convention下互不包含；whole ring R同時是兩者。說明「二軸」是decision model，不宣稱subring與ideal在所有conventions下毫無邏輯關係。
```

**擁擠檢查：** 本節不新增theorem，只壓縮與遷移。R／C只是不可操作anchors，不要求四輪分類；matrix每次只展開D或K其中一張的兩軸evidence，transfer pair在primary matrix完成後才出現。

### Ch9 畫面與實作約束

- **建議4 screens，不合併。** 9.1先建立quantifier wiring；9.2與9.3各自需要一個方向的non-degenerate counterexample與不同misconception repair；9.4才做二軸壓縮。若把9.2／9.3並成左右雙例，首屏會同時承擔ambient escape、identity convention與四組verdict，過度擁擠。
- D與K全程使用同一個`R=(ℤ/4ℤ)^{A,B}`board，card positions不得因candidate切換而重排。Boundary shape與size也固定，避免外觀替contract作答。
- 9.1不使用強弱slider、nested circles或大小箭頭。Input wire origins與identity gate是唯一具有數學語意的視覺變化。
- 9.2的ambient r與inside c使用不同role badges與來源位置；product另生成，不能把r card拖進D。Escape route保留inputs與output labels。
- 9.3的internal-product seal必須顯示為ambient absorption的specialization，不重新掃描samples。Identity failure只標entry gate，不污染其他PASS seals。
- 所有verdict至少同時使用文字、port線型與membership glyph，不能只靠綠／紅色。Course-convention-dependent verdict常駐scope badge。
- 9.4 matrix axes使用完整問題描述；四cells不採由低至高排列，也不使用獎牌、等級或progress語意。
- 本章不使用3D。所需結構是quantifier input origins與membership escape；2D fixed board能做最嚴格的controlled comparison。
- **主流程概念預算：** 9.1只新增兩種multiplication input scopes；9.2只證明subring↛ideal；9.3只證明ideal↛same-identity subring並處理convention；9.4只做二軸分類。Generated ideal、quotient、principal ideal與matrix left/right examples不進主流程。

### Ch9 完成驗收

在不打開formal layer時，學習者應能回答：

1. Subring與ideal的multiplication inputs分別允許從哪裡來？
2. 兩種contracts共同需要哪種additive stability？Identity obligation有何不同？
3. 為什麼constant functions D通過internal product，卻可被ambient r推出boundary？
4. 為什麼K的ideal absorption自動涵蓋inside×inside？
5. K為什麼只在本課same-identity convention下取得「ideal but not subring」verdict？
6. 為什麼D與K的相同card數量完全不能決定structure label？
7. 如何用`ℤ⊂ℚ`與`2ℤ⊂ℤ`遷移兩個方向的counterexample？
8. 為什麼「ideal比較強」與「兩者完全無關」都不是精確說法？
9. 下一章的generated ideal要解決哪一個本章尚未回答的construction問題？

若學習者仍把internal×inside與ambient×inside混用、把ideal failure歸因於不含1、把subring failure錯標在internal product、或只能背D／K的位置而無法轉移到ℤ／ℚ，本章就還不算完成。

### Ch9 單節清晰度、視覺與互動稽核 · 2026-08

#### 結論：4節不擁擠，但9.1與9.4必須採靜態比較骨架

第九章的四頁不是把同一句話重複四次，而是四個不同認知工作：

| Screen | 學完應能直覺預測 | 唯一主要互動 | 不可混入 |
|---|---|---|---|
| 9.1 | 看到input origins就知道目前問internal closure還是ambient absorption | 聚焦一個panel並trace wires | D／K verdict、counterexample、強弱結論 |
| 9.2 | inside×inside通過仍可能被outside×inside推翻 | 生成一個ambient escape witness | identity convention、K、二軸matrix |
| 9.3 | absorption涵蓋internal product，卻不自動提供1_R membership | 先derive internal product，再送identity beacon | 重跑absorption lab、alternative convention toggle |
| 9.4 | D／K必須分居subring-only／ideal-only，無法排成階梯 | 只放D與K兩張cards | 四輪candidate quiz、generated boundary、quotient |

任何一頁若需要第二套自由controls，優先把它改成完成primary後的固定challenge或read-only evidence，不加更多按鈕。

#### 9.1 視覺選擇：並排，不morph

- 兩個contract panels同尺寸、同視覺重量且始終可見。Focus只改outline、opacity與逐段annotation，不改空間大小。
- 不把subring wire動畫成ideal wire，也不畫`SUBRING → IDEAL`。雖然ambient quantifier涵蓋更多multipliers，identity obligation卻反向不同；morph會過早製造單向升級語意。
- Difference row固定置於兩panels相同位置，顯示共同additive backbone；multiplication input origins與identity row才是差異。
- TRACE必須回答具體問題「兩條input wires各從哪個set取值？」；若動畫只讓線發光而沒有role labels，就沒有教學價值。

#### 9.2 視覺選擇：保留既有PASS，只新增escape witness

- D boundary與Ch6相同，三個subring seals保持compact且可查reason，不重新教closure。
- r card固定從ambient outside起步；c card固定在D內；operation port生成第三張product card。任何動畫都不可把r移進D。
- 預設`r=(1,0)、c=(2,2)、rc=(2,0)`讓三個roles與values都不同。若使用c=1，product會等於r並混淆failure來源，因此禁止作預設。
- Witness發生後保留escape route；後續調r得到成功sample也不能清除`IDEAL ×`，只新增`EXAMPLE · THIS INPUT STAYS`。

#### 9.3 視覺選擇：一個PASS derivation、一個identity failure

- 第一步不是重新scan K內products，而是把ambient input socket限制到K，視覺顯示`ambient×inside`包含`inside×inside`。
- 第二步才發送1_R beacon。Beacon只移到boundary edge並顯示`OUTSIDE K`，不彈回、不爆炸，避免把convention failure戲劇化成operation錯誤。
- Final ledger必須保留：difference PASS、internal product PASS、ambient absorption PASS、identity FAIL。只有最後一格失敗，才數學正確。
- `UNDER THIS COURSE CONVENTION`與verdict同層顯示；不能藏在details。

#### 9.4 視覺選擇：neutral matrix，不是Cartesian value graph

- 2×2只是decision table，cell位置沒有大小、高低或連續數值語意；不用座標箭頭、漸層或右上角「最好」的視覺慣例。
- R與C預先作為both／neither anchors，learner只處理D／K。這保留四種logical possibilities，又把primary decisions從4次降到2次。
- 每次只展開active candidate的兩條evidence；另一張card保持face-down，避免答案互相洩漏。
- Transfer `ℤ⊂ℚ`／`2ℤ⊂ℤ`使用match-two-cards，不再建立第二張matrix。

#### Evidence 與一般性

- 9.1是definition-scope visual，不產生structure verdict。
- 9.2一個ambient escape是足以否決ideal的`WITNESS`；D為subring來自general closure reasons。
- 9.3 K為ideal沿用Ch8的`GENERAL ARGUMENT`；1_R outside是direct membership fact。
- 9.4只整理已建立的evidence，不把分類操作當作proof。
- Function example完成後必須轉移到`ℤ⊂ℚ`與`2ℤ⊂ℤ`，否則「constant lane／zero lane」仍可能被誤認為definitions。

#### 1920×1080焦點預算

- 9.1最多高亮active panel的兩條input wires與一個identity row。
- 9.2最多高亮r、c、rc與escape boundary，共三張cards加一條route。
- 9.3最多高亮inside restriction或identity beacon其中一項；兩步不可同時播放。
- 9.4首屏只顯示matrix、D／K待放區與active evidence drawer；transfer隱藏至primary完成。

第九章不需3D。Input quantifiers、membership與escape witness都是exact set relations；透視與深度不會新增推理資訊，反而會讓「inside／outside」受相機角度干擾。

### Ch10 · 一個 seed 會長成多大的 ideal？

**唯一核心 insight：** generated ideal 是包含 seed 且滿足 absorption 所被迫加入的最小區域。

- 拖入 seed `a`，讓所有 ambient multiples 擴散成 `(a)`。
- 在 `ℤ` 看見 `(a)=aℤ`；再用雙 seed 顯示 `(a,b)` 的 closure，而不急著分類所有 ideals。
- Principal ideal（主理想）首次標註英文；PID 留到下一門 factorization 課。

### Ch11 · Larger ideal 代表更粗的解析度

**唯一核心 insight：** ideal inclusion 越大，被視為零的 differences 越多，quotient 將越粗。

- 用 nested absorption regions 與同步 bucket count 顯示 `I⊆J` 時 collapse 的層級。
- 本章只處理 inclusion 與 quotient resolution；sum、intersection、product 留到 Ch17。

---

## Part III · Quotient 是把差異安全地壓成零

### Ch12 · 為什麼 ordinary subgroup 還不夠？

**唯一核心 insight：** addition 的 cosets 不一定能安全相乘；更換 representatives 後 product 必須仍落在同一 bucket。

- 先讓學習者嘗試用一個 additive subgroup 做 quotient multiplication。
- Representative swap test 會顯示 product bucket 分裂。
- 最後看見 absorption 正是阻止污染的條件；本章是 ideal 必要性的回扣。

### Ch13 · Quotient ring 是一個解析度較低、但運算仍一致的世界

**唯一核心 insight：** quotient ring 不只是把元素分組，而是讓兩種 operations 都能直接在 buckets 上運作。

- Coset tiles 同步執行 addition 與 multiplication。
- 主例子使用 `ℤ/nℤ`，清楚區分 representative 與 residue class。
- Well-definedness 的正式證明收進「為什麼代表元不影響答案」。

### Ch14 · Kernel 正是 map 真正丟掉的資訊

**唯一核心 insight：** `R/ker φ` 與 `im φ` 描述同一個保留下來的 ring structure。

- 以 collision compression 動畫串起 `R → R/ker φ → im φ`。
- First Isomorphism Theorem for Rings 首次以英文完整命名，但公式在動畫對齊後出現。
- 不重講 group theorem；重點是 quotient 同時保留兩種 operations。

---

## Part IV · 從 quotient 的行為反看 ideals

### Ch15 · Prime ideal 保住「乘積為零」的可追溯性

**唯一核心 insight：** 在 `R/P` 中若 product 是零，至少一個 factor 已經是零；這等價於 quotient 沒有 zero divisors。

- 先操作 quotient 的 multiplication detector，再回看哪些 original elements 被送進 `P`。
- Prime ideal（質理想）在 behavior 已可見後才命名。
- 不和 maximal ideal 放同章比較定義。

### Ch16 · Maximal ideal 讓 quotient 幾乎處處可逆

**唯一核心 insight：** 再也無法擴大的 proper ideal，恰好使 quotient 中每個 nonzero class 都能 undo multiplication。

- 先在 ideal inclusion ladder 上嘗試擴張，再同步觀察 quotient inverse ports。
- Maximal ideal（極大理想）與 quotient field 的對應是唯一主線。
- `maximal ⇒ prime` 放章末遷移；正式證明放展開層。

### Ch17 · Sum、intersection 與 product 是三種不同的合併需求

**唯一核心 insight：** ideal sum、intersection 與 product 不是三套符號遊戲；它們分別回答「容納兩方」「同時屬於兩方」「由兩方乘法互動生成」哪一種限制。

- 在同一組 nested regions 上切換三種 construction，先預測哪個會變大、哪個會變小。
- Comaximal ideals 由 `I+J=R` 的「限制彼此不鎖死」視覺自然出現。
- Product ideal 的有限和形式與 closure proof 放展開層；主流程只保留它和 `I∩J` 何時對齊的可見條件。

### Ch18 · CRT 把一個 element 拆成獨立 coordinates

**唯一核心 insight：** comaximal ideals 之間沒有互相遮蔽的資訊，因此 residues 可以獨立指定並重建。

- 主要模型：一個 element 同步投影到兩個 modular dials，再由 coordinate pair 反推原 bucket。
- Chinese Remainder Theorem（CRT）先以 coprime integers 建立，再顯示 ideal 版本。
- 多 ideal 的完整陳述與 proof 放展開層。

### Ch19 · Quotient 的 ideals 其實來自原世界中更大的 ideals

**唯一核心 insight：** 壓掉 `I` 之後，`R/I` 裡的 ideal choices，正好對應 `R` 中所有包含 `I` 的 ideals。

- Resolution ladder 同步顯示 `I⊆J⊆R` 與 `J/I⊆R/I`。
- 學習者在 quotient side 選一個 region，original side 立即顯示它的完整 preimage。
- Correspondence Theorem for Rings 在雙邊 inclusion order 對齊後才命名；正式 bijection proof 放展開層。

### Ch20 · 面對陌生 quotient，先問它壓掉了什麼、又留下什麼

**唯一核心 insight：** ring 問題的可靠診斷流程，是先找被宣告為零的 differences，再檢查 quotient 保留下來的 multiplication behavior。

- Capstone 不新增 theorem；只讓學習者在 map、kernel、generated ideal、quotient、prime／maximal detector、CRT coordinates 之間選擇正確鏡頭。
- 使用 `ℤ/nℤ`、evaluation map 的 image、以及一個簡單 polynomial relation 作三條逐步解鎖的 diagnosis routes。
- Polynomial relation 只作為 quotient-language transfer，不教 polynomial division 或 irreducibility test。

本課收束圖卡：

> Ideals 把「哪些差異可忽略」「壓縮後哪些乘法資訊仍保留」放進同一套結構語言。

---

## 視覺與互動 grammar

整門課只建立少數可累積的 visual primitives，不每章發明新比喻：

1. **雙 operation wiring**：ADD 使用平行合流，MULTIPLY 使用作用／串接；兩者顏色之外還以線型與 icon 區分。
2. **Multiplication map**：固定 `r` 後看 `x ↦ rx`，用來連接 units、zero divisors、kernel absorption 與 cancellation。
3. **Absorption field**：ideal 是會吸收 ambient multipliers 的區域；外部箭頭撞入後不能逃出。
4. **Quotient buckets**：bucket 代表 equivalence class；更換 representative 時保留 bucket identity，避免把 quotient 誤解成任選代表。
5. **Resolution ladder**：ideal 越大，quotient resolution 越低；用於 inclusion、maximal ideals 與 theorem transfer。
6. **Behavior detector**：先測 quotient 是否有 collision／inverse，再命名 prime／maximal，避免名詞卡片牆。

3D 不作為本課預設。Ideal absorption、quotient buckets、ideal lattice 與 CRT coordinates 都能以 2D 更清楚呈現；只有 storyboard 證明 3D 能揭示額外結構時才使用。

## 擁擠度審核

以下內容刻意拆開：

- units 與 zero divisors：一章建立可逆，一章建立 collision。
- subring 與 ideal：先各自建立問題，再專章對比。
- ideal definition 與 quotient construction：先在 kernel 中發現 absorption，再以 representative swap 說明必要性。
- prime 與 maximal ideals：各自由不同 quotient behavior 產生。
- ideal sum／intersection／product、CRT、correspondence：先建立合併語言，再做 coordinate split，最後理解 quotient 中的 ideal lattice。

以下內容刻意不放入本課主線：

- left／right ideals、non-unital subtleties
- modules 與 exact sequences
- 完整 ED／PID／UFD taxonomy
- polynomial division 與 irreducibility tests
- fraction fields、field extensions、finite fields
- Galois theory

這些不是刪除，而是避免「為了完整」破壞本課由 ideal 到 quotient 的單一主軸。

## 下一門課：Divisibility, Polynomial Rings & Fields

建議下一門至少 18 章，承接本課而不重講 ideals。UFD／PID／ED 是一條需要完整建立的主線，不在本課尾聲用縮寫階梯帶過：

1. Divisibility 是 multiplication reachability
2. Units 與 associates 消除不重要的 factor 差異
3. GCD 是 common-divisor information 的最佳壓縮
4. Euclidean algorithm 與 remainder invariant
5. Bézout identity 是 gcd 的 ideal witness
6. Irreducible 與 prime 是兩種不同方向的判斷
7. Unique factorization 的 existence 與 uniqueness 是兩項不同承諾
8. Euclidean domain（ED）提供可下降的 division measure
9. Principal ideal domain（PID）把所有 ideals 壓成 single-generator constraints
10. Unique factorization domain（UFD）保證 factor routes 最終對齊
11. `ED ⇒ PID ⇒ UFD` 為什麼成立、反向為什麼不能倒著用
12. Polynomial 是 coefficient sequence，multiplication 是 convolution
13. Polynomial division 與 leading-term cancellation
14. Evaluation、remainder theorem、factor theorem
15. Base field 改變會改變 factorization
16. Irreducibility detectors 與各自限制
17. Fraction field 是把 nonzero denominators 正規化
18. `F[x]/(f)`、field construction 與 finite-field doorway

確切章數在該課 storyboard 時再拆，不預先把多個 detectors 或 constructions 塞成名詞巡禮。之後才銜接 Fields & Galois Theory。

## 開課前品質護欄

- 先完成 Group Theory Ch31–32 的延後視覺驗收，再開始大量 ring UI。
- Ring 課不可只替既有 lesson 換色；雙 operations、absorption field 與 quotient buckets 需要專屬 visual grammar。
- 每章實作前必須填寫 `docs/LEARNING_DESIGN.md` 的交付模板，且核心 insight 必須能用一句話說完。
- 每一個互動都要先寫出「操作什麼、看見什麼、推翻哪個誤解」。若只有數值變化或裝飾動畫，就不做。
- 公式、完整 definitions 與 proofs 收在展開層後，主流程仍必須完整且數學正確。
- 第一章不得偷跑 ideals、domains、fields 或 examples catalogue；最後一章也不得因為接近課尾而壓縮內容。

---

## Ch11–18 最新架構稽核與修訂 · 2026-08-13

> **本節取代上方初版 Ch10–20 排程中所有與 Ch11 之後相衝突的內容。**
>
> Ch11–15 已依實際課程重寫；後續 agent 不得再把初版的「Ch17 ideal arithmetic、Ch18 CRT、Ch19 correspondence、Ch20 capstone」照章號實作。新版 Ch14 已完成 correspondence 與 two-stage quotient，新版 Ch15 已在 paired-map 因果鏈中建立 intersection、sum、comaximality 與 CRT。重做同一批內容只會製造重複與概念倒退。

### 重新審核的課程依賴鏈

```text
Ch10  generated ideal：若 seed 必須歸零，哪些 differences 會被迫一起消失？
  ↓
Ch11  quotient construction：把 whole ideal 壓成 zero class，cosets 成為新 elements
  ↓
Ch12  quotient universal property：哪些 maps 能下降？induced map 為何唯一？
  ↓
Ch13  first isomorphism mechanism：kernel fibers 壓成 effective domain，再精確對準 image
  ↓
Ch14  ideal correspondence：downstairs ideals ↔ upstairs ideals containing K；two-stage = direct
  ↓
Ch15  paired quotient maps：intersection 控制共同 blind spot；sum 控制 reachability；CRT 重建
  ↓
Ch16  quotient 的每個 nonzero class 能否回到 1？ ↔ maximal ideal
  ↓
Ch17  quotient 的 nonzero product 能否塌成 0？ ↔ prime ideal
  ↓
Ch18  diagnostic capstone：依問題選擇 generated ideal、quotient、kernel/image、CRT 或 behavior detector
```

這條鏈的核心不是 theorem 清單，而是同一個 reversible mental move：

> 先在 quotient 觀察「還剩下什麼 behavior」，再把該 behavior 翻回 upstairs ideal 的 boundary condition。

### Ch11–15 承接性結論

| Chapter | 已建立的唯一主要工作 | 對下一章交出的工具 | 稽核結論 |
|---|---|---|---|
| Ch11 | whole coset 才是 quotient element；operations 不依賴 representative | canonical quotient world `R/I` | 保留；五節雖長，但每節認知工作分離 |
| Ch12 | `I⊆ker f` 是 map descent gate；induced map 被 fibers 唯一強迫 | universal factorization lens | 保留；自然承接 Ch11 的 well-definedness |
| Ch13 | collisions 正好由 kernel differences 控制；`R/ker f` 對準 image | kernel–quotient–image blueprint | 保留；是 Ch12 universal property 的具體結構化結果 |
| Ch14 | quotient ideals 由包含 K 的 upstairs ideals 精確控制；分段 quotient 等於直接 quotient | inclusion lattice 與 intermediate-boundary 語言 | 保留；為 maximality 準備必要語言 |
| Ch15 | 兩張 quotient views 的共同遺忘由 `I∩J` 控制，獨立 reachability 由 `I+J` 控制 | CRT coordinates 與 quotient-side diagnostics | 保留；已吸收初版 Ch17–19 的必要內容 |

Ch15 不必硬把每個新章都直接「推出」下一章。它結束的是 multi-view compression 線；Ch16 開始的是 quotient behavior 線。轉場必須明說鏡頭改變：

> 前面問多張 quotient views 能否拼回資訊；接下來固定一張 quotient，問它剩下的 multiplication 到底有多強。

### 現有 Ch16 審核結論

現有 Ch16 的數學模型、non-degenerate function-ring examples 與 `1=i+ra` certificate 都值得保留，但章內順序需要重排，不能視為已定稿。

主要問題：

1. **開場方向逆著最新主線。** 現有 16.1 先定義 maximal growth，再到 quotient inverse；Ch11–15 剛建立的是 quotient-first lens，應先讓學習者看見 nonzero class 的 inverse dock 是否開啟，再追問 upstairs 原因。
2. **16.4 擠入第二個新 detector。** Prime／domain 與 maximal／field 回答不同問題：一個防止 nonzero product 塌成 zero，一個要求每個 nonzero class 回到 one。放在同章末節容易讓 `domain` 看起來只是較弱 field 的附帶名詞，而不是獨立可操作的 behavior。
3. **finite example 會掩蓋一般邊界。** 在有限 commutative quotient 中 domain 會自動成為 field，因此同一個 16-card world 找不到 prime-but-not-maximal。這個 accidental property 必須留到獨立 prime 章，用 `ℤ` 作 controlled transfer，而不是在 maximal 章尾匆忙補洞。
4. **實作模型存在反向耦合。** Ch16 目前從 Ch15 的「compatibility exports」取得 prime／quotient helpers。重做時應把跨章共用的 finite quotient／ideal helpers抽到中立 model；課程後章不應靠前章檔案中的臨時相容層維持。

因此不是刪除 Ch16，而是保留優秀資產後重新安排 learning sequence。

## 新版 Ch16 · 什麼 boundary 會讓 quotient 的每個非零元素都能回到 1？

**全章唯一核心 insight：** quotient 中每個 nonzero class 都可逆，等價於 upstairs ideal 與 whole ring 之間沒有 proper intermediate boundary。

**主線 scope：** commutative unital rings、proper ideals。Field（體）與 maximal ideal（極大理想）首次正式命名時標註英文。Prime、domain、zero-product detector 不進本章主流程。

**承接 Ch15 的第一句：**

> CRT 問多張 quotient views 能否形成可逆座標；現在只固定一張 quotient，改問它裡面的每張 nonzero card 能否把 multiplication 倒帶到 1。

### 16.1 · Quotient 裡不是 zero 的 class，是否都能打開 identity dock？

**本節設計句：** 學完後，學習者應能把 field behavior 看成「每一個 nonzero class 都能找到 multiplicative partner 抵達 `1+I`」，而不是把 field 背成比 ring 更高級的名詞。

```text
第一個具體問題：
固定一張quotient world。選一個nonzero class後，能否找到另一個class，使兩者product抵達1-class？

主要視覺：
單一active quotient dock，而不是首屏並排兩張tables：SOURCE CLASS在左、可選PARTNER在中、PRODUCT DOCK在右。Zero class固定停在上方reference lane並標`EXEMPT`；它不能被選作待審nonzero source。

互動：
1. 選source class。
2. 在看到答案前選partner或預測`NO PARTNER`。
3. 執行一次class multiplication，觀察output是否抵達identity dock。
4. 手動完成一列後才解鎖`AUDIT REMAINING CLASSES`。
R/K與R/Q使用同一座dock切換，不同world不並排競爭注意力；完成兩次audit後才顯示compact comparison ledger。

因果：
選 partner → 計算 class product → 是否抵達 identity dock。不要先顯示 maximal 或 ideal lattice。

Evidence：
一列是`EXAMPLE · EXACT CLASS PRODUCT`；完整掃過active finite quotient才是`FINITE EXHAUSTION · THIS QUOTIENT`。Field的general definition在behavior可見後才命名，不把finite scan當一般theorem proof。

Accidental-property audit：
R/K 只有一個 nonzero class且它 self-inverse，會暗示 inverse 通常等於自己。完成主 audit 後固定轉移到 Z/5Z 的 2↔3，不新增自由 controls。

觀念圖卡：
Field 不是「沒有 multiplication 問題」；它是每個 nonzero element 都有路回到 1。
```

**擁擠界線：** 本節不提 generated enlargement、maximal、prime 或 domain，只建立 quotient-side behavior detector。

### 16.2 · 一張 `1=i+ra` certificate 同時解釋 growth 與 inverse

**本節設計句：** 學完後，學習者應能看見 `a+I` 在 quotient 可逆，恰好等價於把 outside seed `a` 加入 I 後能生成 identity。

```text
第一個具體問題：
a 在 ambient ring 中不是 unit，它的 quotient class 為何仍可能可逆？

主要視覺：
同一張certificate置中，使用上下對齊的雙讀法：上半部是AMBIENT GROWTH，下半部是QUOTIENT INVERSE。`i`、`r`、`a`三個tokens位置在兩層完全對齊；切換讀法只改變wrap與角色標註，不讓元素飛到另一套圖。

因果：
1=i+ra，i∈I。Upstairs 讀法：identity 被 I 與 a 強迫生成。Downstairs 讀法：i wrap 成 zero，留下 (r+I)(a+I)=1+I。

互動：
對比OPEN與BLOCKED兩個固定state。主流程只用一個stepper依序：
1. GENERATE FROM I AND a
2. ASK WHETHER 1 ARRIVES
3. WRAP I TO ZERO
上下readout逐步同步；不放三顆同時可按的stage buttons，也不提供無目的sliders。

Non-degenerate transfer：
Z/5Z 中 1=(-5)+3·2，ambient 2 不是 Z-unit，但 2+5Z 的 inverse 是 3+5Z。

Evidence：
固定 examples 提供 exact certificates；details 中放雙向 GENERAL ARGUMENT。

觀念圖卡：
Growth reaches 1 與 quotient class 取得 inverse，是同一張 certificate 的兩種讀法。
```

**擁擠界線：** 本節只處理 single class／single outside seed 的雙向 bridge，不量化 every class，也不命名 maximal。

### 16.3 · Every outside seed 都直達 R，才代表沒有 intermediate ideal

**本節設計句：** 學完後，學習者應能用 every-outside growth criterion 判斷 maximality，並理解 maximal 是 inclusion gap，不是 cardinality 最大。

```text
第一個具體問題：
Q 有 4 張 cards、K 有 8 張；為什麼 card 數完全不能證明 K maximal？

主要視覺：
固定ideal inclusion fork `Q⊂K,L⊂R`。Nodes大小相同、上下距離只代表inclusion而非cardinality；加入outside seed後，只高亮實際generated path。旁邊保留fixed ambient card board，顯示哪些cards是original、forced、still outside。

互動：
先跑一張focused seed。若停在intermediate ideal，立即留下decisive witness；若抵達R，UI提醒single success尚未證明maximal。之後才解鎖`AUDIT ALL OUTSIDE SEEDS`。Audit結果以seed cards分組，不再重畫整張lattice。

一般機制：
若 I⊊J⊊R，任取 a∈J\I，GROW(I;a)⊆J，故不會抵達 R。反向若某個 outside a 的 growth 仍 proper，它本身就是 intermediate ideal。

Transfer：
6Z⊂2Z⊂Z 證明 6Z 不 maximal；2Z 加任一 odd seed 直達 Z。兩者都是 infinite sets，徹底移除 card-count 錯覺。

觀念圖卡：
Maximal 不是 biggest；它表示從 I 到 R 沒有可停靠的 proper boundary。
```

**擁擠界線：** `I+(a)` 的正式 notation 放 details；ideal sum 已在 Ch15 出現，但本節不重新教 sum construction。

### 16.4 · 許多 outside representatives，可能只是同一個 nonzero class

**本節設計句：** 學完後，學習者應能看見projection把所有outside elements按coset分束；growth／inverse certificate只依賴class，不依賴選到哪張representative。

```text
第一個具體問題：
K外面有8張function cards，但R/K只有1個nonzero class。Maximal detector為什麼檢查8張outside cards，field detector卻只出現1列？

主要視覺：
左側fixed ambient board把outside cards保持各自位置；中央canonical projection把它們束成quotient fibers；右側是nonzero class cards。每一束用共同outline與fiber label辨識，不只靠顏色。禁止畫成outside card與class的一對一箭頭表。

互動：
選同一fiber中的兩張representatives a、a+i，先預測它們會不會得到不同growth destination。按`COMPARE REPRESENTATIVES`後，同步顯示：
- `I+(a)=I+(a+i)`
- `a+I=(a+i)+I`
- inverse verdict相同
接著切換另一個fiber驗證mechanism，而不是逐張做8次audit。

Invariant：
I、ambient ring、quotient projection與certificate rule固定；只更換同一fiber內的handle。Zero fiber仍標`INSIDE I / ZERO CLASS`，outside fibers才對應nonzero classes。

因果：
若a'−a∈I，兩個seeds只相差already-available ideal correction，所以generated enlargement相同；它們本來也就是同一quotient class。這一頁只建立representative invariance，不顯示maximal–field theorem seal。

Transfer：
改用Z/12Z與I=(4)：outside representatives 1、5、9收成同一class，要求預測`GROW(I;1)`與`GROW(I;5)`是否可能有不同identity status。

Evidence：
目前finite fiber comparison是`EXAMPLE`；representative-invariance的algebraic reason標`GENERAL ARGUMENT`並放在主畫面的短因果列，完整等式移到details。

觀念圖卡：
Maximal detector量化representatives；field detector量化classes。Projection會把前者按fiber打包，但不會改變certificate verdict。
```

**擁擠界線：** 本節不再教canonical projection、coset或representative；那些是Ch11–12既有工具。本節也不命名新theorem，唯一工作是修正「outside cards與nonzero classes一對一」的錯覺。

### 16.5 · 把同一個 single-class bridge 全稱量化，得到 maximal–field correspondence

**本節設計句：** 學完後，學習者應能用一條已建立的single-class equivalence與16.4的fiber bundling，推出every-outside criterion恰好等於every-nonzero-class inverse criterion。

```text
主要視覺：
三層窄版quantifier bridge，不再出現完整labs：
1. EVERY OUTSIDE REPRESENTATIVE a
2. GROUP BY NONZERO CLASS a+I
3. SAME CERTIFICATE: 1=i+ra
左端接`NO INTERMEDIATE IDEAL`，右端接`EVERY NONZERO CLASS UNIT`。所有箭頭雙向但逐步出現，沒有強弱階梯或上下排名。

互動：
學習者依序放入三張已知reason tiles：
- `a outside I ⇔ a+I nonzero`
- `same fiber ⇒ same certificate verdict`
- `1∈GROW(I;a) ⇔ a+I has inverse`
每次錯放只指出缺少哪個logical connection。三張完成後才把左右兩端命名為MAXIMAL IDEAL與FIELD。

Invariant：
I proper、commutative、unital scope始終可見；zero class不進inverse quantifier。畫面不再讓使用者選數值，避免把theorem synthesis退化成第三次finite scan。

Evidence：
本頁是`GENERAL ARGUMENT · SYNTHESIS OF 16.2–16.4`。前章finite instances只作read-only anchors，不能把兩個PASS ledgers當proof。

正式命名：
`M maximal ⇔ R/M is a field`。Field（體）、maximal ideal（極大理想）若前頁只暫用behavior label，於此第一次正式並列；完整雙向proof放details。

Transfer：
Z/pZ與Z/nZ的固定對比只問quotient inverse behavior與intermediate ideals；「p為prime的數論判準」不在本課證明，避免偷跑下一門divisibility課。

章末未解問題：
Field要求每個nonzero class回到1；若我們只要求nonzero×nonzero不要塌成zero，會對應哪一種ideal boundary？

觀念圖卡：
Maximal ideal 與 field quotient 不是兩條相似定義；它們由每一張 1=i+ra certificate 逐列對齊。
```

**擁擠界線：** 本節不比較prime、不證明field⇒domain、不放integer counterexample，也不重新操作inverse dock或growth lattice。這些分別屬於16.1／16.3與下一章。

### Ch16 視覺與實作處置

- 可重用現有`field-audit-lab`、identity certificate、growth fork與exact certificate generation；重點是拆出fiber bundling並重排文案責任，不需推翻整套數學model。
- 現有16.3的quotient class audit重構為新版16.1的single-dock exploration；現有16.2保留為新版16.2但將三顆stage buttons收成單一stepper；現有16.1移作新版16.3並降低首屏control數。
- 新版16.4需要專屬projection-fiber comparison，不能拿16.1 audit table換標題重用。
- 新版16.5只做logical tile synthesis，不再把兩個finite audits並排重跑。
- 舊`step-maximal-prime-boundary`不屬於Ch16，已從本章移除；Ch17應在補齊prime的前置insight後重新實作，不可只把舊頁換章號。
- Ch16 model 不再 import Ch15 的 compatibility-only prime helpers。Quotient class operations與 ideal membership由Ch16自己的中立model承擔，Ch15 CRT model只保留Ch15所需概念。
- 全章不使用 3D。需要表達的是 class rows、identity dock、certificate correspondence 與 inclusion gap，2D exact relations最清楚。

### Ch16 單節 insight、擁擠度與互動稽核

#### 為什麼是5節，不是4節，也不需要更多

| Screen | 學完只新增哪一個判斷能力 | 唯一主要操作 | 完成後才解鎖 | 絕對不可混入 |
|---|---|---|---|---|
| 16.1 | 能用identity dock判斷一個quotient是否具備field behavior | 選source、預測partner、跑product | finite audit與Z/5Z correction | maximal、growth、prime、domain |
| 16.2 | 能把`1=i+ra`同時讀成growth與class inverse certificate | 單一stepper逐層wrap certificate | exact transfer | every quantifier、maximal命名 |
| 16.3 | 能用intermediate ideal／every-outside criterion判斷maximality | 加一張outside seed並追蹤generated destination | full outside audit與integer transfer | quotient inverse audit、prime |
| 16.4 | 能說明many representatives如何收成one class且共享verdict | 比較同fiber兩張handles | second-fiber transfer | theorem seal、重新教coset |
| 16.5 | 能把三條已知bridge組成maximal⇔field | 排三張logical reason tiles | theorem與章末問題 | 數值explorer、prime/domain比較 |

四節版本會迫使16.4同時承擔fiber bundling與theorem synthesis；這兩者失敗時反映的迷思不同，feedback也不同，因此必須拆開。六節版本則只能把16.1的single product與finite audit拆開，但兩者是「先做一列，再確認every row」的同一問題閉環，拆開會讓第一頁沒有完成field behavior insight。因此5節是目前最低且完整的概念預算。

#### 易懂性檢查

1. **先看behavior，再看upstairs名稱。** 16.1先讓nonzero class嘗試回到1；學習者不需先懂maximal才有問題可追。
2. **先處理一張certificate，再量化。** 16.2只做single `a+I`；16.3才做every outside；16.5才把兩端的every對齊。
3. **many-to-one關係獨立顯示。** 16.4防止把8張outside cards與1個nonzero class誤畫成一對一，也防止學習者以為換representative會改變maximal／inverse verdict。
4. **相近概念延後比較。** Prime與domain完全移到Ch17。Ch16的頁面不出現zero-product detector，即使作為「順便提醒」也不允許。
5. **正式定理最後才出場。** `M maximal ⇔ R/M field`只在16.5顯示；前四節使用behavior labels與局部關係，避免學習者先背終點再倒填理由。

#### 理想視覺的選擇理由

- **16.1使用dock，不使用multiplication table。** 完整table會把注意力轉成找格子；source→partner→identity dock直接呈現「是否能undo」的因果。
- **16.2使用同一張可wrap certificate，不使用左右兩台machines。** 左右機器容易暗示growth與inverse是碰巧同步的兩個process；共享tokens才能表達它們是同一等式的兩種讀法。
- **16.3使用inclusion fork，不使用大小圓或進度條。** Maximal是order中的cover relation，不是集合面積最大或完成百分比。所有ideal nodes同尺寸，只有containment edges有語意。
- **16.4使用fiber bundling，不使用一對一箭頭ledger。** Projection本來就是many-to-one；bundle是這一步不可被文字替代的視覺工作。
- **16.5使用reason-tile bridge，不使用第三個example lab。** 最後一頁要訓練argument assembly；再玩一次finite model只會讓general theorem看起來由sample counts得出。
- **不使用3D。** 本章關係是exact membership、fibers、inclusion與equivalence；depth會引入遮擋與「更高／更強」的假語意，沒有額外數學收益。

#### 互動因果與控制預算

- 每頁首屏最多一組primary controls，按鈕不超過5個；transfer controls在主流程完成前不顯示。
- 16.1一次只允許一個active quotient與一個source class；comparison ledger只讀。
- 16.2只有state selector、NEXT、REPLAY、RESET；stage不可由三顆按鈕任意跳躍。
- 16.3 focused seed selectors最多3個，完整audit只有一顆按鈕；audit cards可回點inspect但不產生第二套mode。
- 16.4一次只比較兩張same-fiber representatives，固定顯示difference-in-I certificate；不讓學習者自由配對16張cards造成無目的組合爆炸。
- 16.5只操作三張reason tiles；不再提供ideal、class或number selectors。

每個互動回答的問題必須可明說：

```text
16.1：這張nonzero class找得到回到1的partner嗎？
16.2：identity進入growth與class取得inverse是否由同一張certificate控制？
16.3：加入這張outside seed後，會停在proper intermediate ideal嗎？
16.4：換成同一coset的另一張handle，certificate verdict會改變嗎？
16.5：哪三個已知理由把兩個every statements接成equivalence？
```

若一個control無法直接服務其中一句，就刪除或移到details。

#### 視覺假暗示防護

- Field與maximal不可畫成右上角／更高等級；它們分居quotient behavior與ideal inclusion兩個representation，最後用equivalence bridge連接。
- Identity dock只表示product class等於`1+I`，不可讓路徑長度、角度或速度暗示inverse大小。
- Inclusion fork的node面積固定；cardinality只在readout中出現，不能控制node大小。
- Outside representative bundles與nonzero classes不是一對一；所有projection arrows必須先匯入fiber sleeve再接class。
- `1=i+ra`中的`i`消失只因`i∈I`被quotient壓成zero，不使用淡出動畫卻不保留membership label。
- OPEN／BLOCKED、DOCKED／NO PARTNER、REACH R／STOP INTERMEDIATE都同時使用文字、邊框線型與icon，不能只靠綠紅色。

#### Evidence與一般性稽核

- 16.1：single product=`EXAMPLE`；全class scan=`FINITE EXHAUSTION`；field definition=`DEFINITION`。
- 16.2：具體等式=`EXACT CERTIFICATE`；雙向等價=`GENERAL ARGUMENT`。
- 16.3：一個intermediate stop=`WITNESS`；every-outside finite scan=`FINITE EXHAUSTION`；criterion proof=`GENERAL ARGUMENT`。
- 16.4：兩張handles=`EXAMPLE`；same-fiber invariance=`GENERAL ARGUMENT`。
- 16.5：只使用`GENERAL ARGUMENT · SYNTHESIS`，不顯示finite PASS meter。

主例`R=(ℤ/4ℤ)^{A,B}`的accidental properties：finite、所有class很少、R/K只有一個nonzero class且self-inverse、finite domain會是field。修正方式分別是Z/5Z non-self inverse、integer ideal inclusion、Z/12Z多representative fiber；finite-domain shortcut延到Ch17明示scope。

### Ch16 完成驗收

不打開details時，學習者應能回答：

1. Field behavior在quotient class層級究竟要求什麼？Zero class為何不列入？
2. 為什麼ambient element不是unit，它的quotient class仍可能是unit？
3. `1=i+ra`在upstairs與downstairs各讀成什麼？
4. Maximal為什麼是「沒有proper intermediate ideal」，而不是「card最多」？
5. 為什麼一個outside seed直達R還不能證明maximal，而一個intermediate stop卻足以否決？
6. 為什麼同一coset中的不同representatives有相同growth與inverse verdict？
7. Every outside representatives與every nonzero classes為什麼不是一對一，卻仍可互相量化？
8. 如何只用三條已知bridge推出`M maximal ⇔ R/M field`？
9. 哪個尚未回答的問題自然交給Ch17，而不是塞在本章尾端？

若學習者仍把maximal理解成最大cardinality、把quotient inverse誤認為ambient inverse、把outside cards與nonzero classes逐張配對、或只能背theorem而說不出certificate bridge，Ch16就還不算完成。

## 新版 Ch17 · 哪種 ideal 會讓 quotient 的非零乘積不憑空消失？

**全章唯一核心 insight：** prime ideal 恰好讓 quotient 保留 zero-product 的可追溯性：若 product class 是 zero，至少一個 factor class原本就是zero。

### 17.1 · Nonzero × nonzero 是否可能塌進 zero class？

- 固定同一 quotient multiplication detector，比較一個有 zero divisors 的 quotient 與一個沒有的 quotient。
- 只問 collision behavior，不提 inverse；zero-product witness保留兩個 nonzero input cards與 zero output。
- Integral domain（整環）在 behavior 可見後首次命名；scope 明示 commutative unital、`1≠0`。
- 核心圖卡：domain不承諾能回到1，只承諾兩個nonzero factors不會一起消失。

### 17.2 · 把 zero-product witness 拉回 upstairs boundary

- 同步顯示 `(a+P)(b+P)=0+P` 與 `ab∈P`。
- 將「至少一個 factor class 已是zero」翻回 `a∈P or b∈P`，在因果完成後命名 prime ideal（質理想）。
- 使用 decisive witness 推翻非prime candidate；general definition與quantifiers放在壓縮圖卡，不能用有限抽查冒充證明。
- 核心圖卡：prime boundary能吸收product的結果，但不會把兩個outside factors一起藏成zero。

### 17.3 · Prime ideal ⇔ domain quotient

- 用 two-route equivalence ledger 對齊：zero class membership、product collapse、factor membership。
- 學習者先把三張 implication tiles 排序，再 reveal `P prime ⇔ R/P is an integral domain`。
- 一個 finite instance做 exhaustive audit，另一個 infinite transfer用`(0)⊂ℤ`作一般概念檢查；proof仍放details。
- 不在本節比較 maximal，讓 prime/domain correspondence先獨立站穩。

### 17.4 · Maximal ⇒ prime，但 converse 在一般世界失敗

- 重用現有 field→domain behavior row：inverse能把`uv=0`拉回`v=0`，所以 field⇒domain。
- 垂直翻譯為 maximal⇒prime；箭頭只單向。
- Controlled counterexample固定`(0)⊂2ℤ⊂ℤ`：`ℤ/(0)=ℤ`是domain但不是field，因此zero ideal prime但不maximal。
- Finite commutative domain⇒field標為`FINITE SCOPE SHORTCUT`，專門修復第16章finite function example造成的偶然重合。
- 核心圖卡：prime防止nonzero product消失；maximal還要求每個nonzero class回到1。

### Ch17 擁擠與一般性護欄

- Domain與field不得以「低級／高級」階梯呈現；使用兩個不同問題的detectors，再以單向 implication連接。
- 17.1不介紹prime；17.2不證明完整 correspondence；17.3不比較maximal；17.4只做已建立概念的強弱邊界。
- 至少保留一個 infinite transfer，否則有限例中domain=field會讓兩個detectors視覺上無法分離。
- Irreducible element、prime element、UFD/PID、polynomial irreducibility都留到下一門 divisibility 課。

## 新版 Ch18 · 面對陌生 ring map 或 quotient，該選哪一副鏡頭？

**全章唯一核心 insight：** ring quotient 問題不是靠背 theorem 名稱；先辨認「被迫歸零的 differences」與「想觀察的剩餘 behavior」，就能選出正確路徑。

Ch18 是 capstone，不新增 theorem，也不再補 ideal product、radical、localization 或 polynomial factorization。建議五節，每節只訓練一次 lens selection：

### 18.1 · Goal-first diagnosis map

- 給四種目標：讓seed歸零、讓map下降、描述map真正保留的image、判斷quotient multiplication。
- 學習者先選 lens，再看到需要的 input evidence；不是先看公式猜 theorem。
- 建立一張可帶走的 route map：`seed → generated ideal`、`I→0 → R/I`、`map collisions → ker/image`、`quotient behavior → prime/maximal`。

### 18.2 · Construction route：宣告一個 relation 為 zero

- 用最簡單的 polynomial-looking world作 representation transfer，例如把符號 relation `x²+1=0` 當作 quotient instruction；不做 polynomial division 或 irreducibility test。
- 問「哪些 expressions 被迫視為相同？」並選 generated ideal + quotient lens。
- 主流程只訓練 relation → safe-collapse region → quotient elements，避免偷開下一門課。

### 18.3 · Map route：一張 evaluation map 忘掉了什麼？

- 給 finite function evaluation 或 integer residue map，先找 collisions，再選 kernel–quotient–image route。
- 必須區分 target與image，不把 surjectivity當預設。
- 由學習者組出`R → R/ker f → im f ↪ S`，不重新講 first isomorphism theorem。

### 18.4 · Multi-view route：兩張 quotient outputs 能否重建？

- 給一組comaximal與一組non-comaximal ideals，要求先判斷共同blind spot，再判斷product target是否reachable。
- 正確 lens依序是intersection → sum → CRT；不能只因看到兩個moduli就直接按CRT。
- Feedback精確指出是injectivity/kernel問題或surjectivity/reachability問題。

### 18.5 · Behavior route：要domain還是field？

- 給陌生 quotient 的兩種需求：「nonzero product不可消失」與「每個nonzero class必須可逆」。
- 學習者分別選 prime detector與maximal detector，並指出所需 evidence不同。
- 最終混合挑戰只要求選route與第一個decisive test，不要求一頁完成長計算。

### Ch18 最終收束圖

```text
WHAT MUST BECOME ZERO?                 WHAT MUST SURVIVE?
seed / relation → generated ideal      distinguishability → kernel / image
given ideal → quotient                 paired reachability → intersection / sum / CRT
map descent → I⊆ker f                  zero-product trace → prime / domain
                                       inverse-to-one → maximal / field
```

最終圖卡：

> Ideal 告訴你哪些 differences 可以安全忽略；quotient 告訴你忽略之後，addition 與 multiplication 還保留了什麼。

## 為什麼不再維持 20 章

初版 Ch17–19 的內容已被新版 Ch14–15 以更好的因果順序吸收：

- ideal correspondence 與 two-stage quotient 已在 Ch14 完成；
- intersection、sum、comaximality 與 CRT 已在 Ch15 的 paired-map pipeline 完成；
- 若再做「sum／intersection／product 一章、CRT 一章、correspondence 一章」，前兩個 constructions會被重教，學習者反而失去目前清楚的 kernel／reachability分工。

Ideal product 尚未進主線，但它不是為了湊章數就必須補上的缺口。它在 factorization、primary decomposition 或 algebraic geometry 中會有更強的動機；本課只為了 taxonomy 加入它，會破壞由 safe differences 到 quotient behavior 的單一主軸。Radical ideals、localization、Spec、ED/PID/UFD同理，留到各自有問題驅動的後續課程。

因此新版終點採 18 章：Ch16 建 field/maximal，Ch17 建 domain/prime，Ch18 練整合診斷。若未來 storyboard 證明 capstone 五節過長，可以把它拆成 18–19 兩章；但不預先承諾第20章，也不靠新增名詞填滿章號。
