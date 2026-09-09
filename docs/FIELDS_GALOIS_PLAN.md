# Fields & Galois — 課程規畫

## 課程定位

這是 Group Theory Foundations（Ch1–32）與 Rings & Ideals（Ch1–18）之後的第三門精雕代數課，完成 **群 → 環 → 體** 三部曲。不接續前兩課章號，自成一門。

本課不把 field 當成「再多背一組公理的 ring」，也不急著把 field extensions、Galois correspondence 與可解性一次講完再回頭補直覺。核心問題只有一個：

> 當我們把數系擴大到剛好裝得下一個方程的根，這個擴張會自帶一組「重排根但不動底層」的對稱；這組對稱的形狀，決定了方程能不能被開方解出。

整門課的 north star：

> Field extension 是為了容納一個目前無解的方程而長出的最小世界；它自帶的 symmetry group 記錄了「哪些根可以互換而不破壞任何代數關係」；Galois correspondence 讓「中間世界」與「對稱子群」互為鏡像；可解性最後只剩一個群論問題——這組對稱能不能被逐層拆成 abelian 片。

### 與前兩課的接口

Rings & Ideals 的終點是刻意鋪給本課的入口：

- Rings Ch16 用 **maximal ideal** 造出 field（`R/M` 是 field）。
- Rings Ch17 用 **prime ideal** 造出 integral domain。
- 學生走完環課，腦中最後一個可操作動作是「quotient 掉 maximal ideal → 得到一個 field」。

本課 Ch3「加一個根＝對 minimal polynomial 做 quotient」正是這個動作的續集：`K(α) ≅ K[x]/(m(x))`，而 `m(x)` irreducible 讓 `(m(x))` 成為 maximal ideal，quotient 自然是 field。**環課的 quotient 機制在這裡直接兌現，不重教。**

本課也會回收：

- 群論的 subgroup lattice、normal subgroup、simple group、solvable group（Ch9–11）。
- 線代的 basis、dimension、vector space（Ch2）。
- 複分析的「根排在複平面上」直覺（Ch7）。

---

## 實作進度與待驗證清單（2026-08-25）

依使用者決定，**視覺驗證與 RWD 稽核統一延後到多章實作完成後再批次做**。下列章節已完成 Angular 實作、`ng build`（development）type-check 通過，但**尚未**做 1920×1080 視覺、鍵盤、非色彩辨識、reduced-motion 稽核。

| 章 | 節數 | storyboard | 實作（build 通過） | **視覺驗證** |
|---|---|---|---|---|
| Ch1 Field 是除法安全的世界 | 4 | ✅ | ✅ | ⬜ 未驗證 |
| Ch2 擴張＝vector space | 4 | ✅ | ✅ | ⬜ 未驗證 |
| Ch3 加根＝quotient by minimal polynomial | 5 | ✅ | ✅ | ⬜ 未驗證 |
| Ch4 塔的維度相乘 | 3 | ✅ | ✅ | ⬜ 未驗證 |
| Ch5 尺規作圖＝二次塔 | 4 | ✅ | ✅ | ⬜ 未驗證 |
| Ch6 splitting field / normal | 4 | ✅ | ✅ | ⬜ 未驗證 |
| Ch7–Ch14 | — | ⬜ 未寫 | ⬜ 未做 | ⬜ |

**待驗證項目（每章批次做）：** 依 `AGENTS.md`／`docs/LEARNING_DESIGN.md`／`CLAUDE.local.md`：

- 約 1920×1080 桌面版面、資訊密度、並排/同步視圖是否成立。
- 鍵盤可完成核心探索、focus 可見。
- 非色彩辨識線索（形狀＋文字，不只紅綠）。
- `prefers-reduced-motion` 下不遺失關鍵資訊。
- 每個互動的預測 → 回饋 → 壓縮閉環實際可用；SVG 座標、readout 對齊。

**驗證方式備忘（見 `CLAUDE.local.md`）：** lazy chapter chunk 很大，headless 直接 `--screenshot` 常只截到 app shell；需 `--virtual-time-budget` 或等 `.fields-lesson` selector 出現後再截。路由 `/learn/fields/ch1..6/<step>`。驗證後關閉暫時的 ng serve 與 debug port。

**實作過程已知並已修正的小事（不影響邏輯，視覺 pass 時仍建議複查）：** 多處 Angular 模板字面 `{…}` 集合需以 `{{ '{' }}` 跳脫（Ch3/Ch4/Ch5 各修過一次）；Ch5.1 線∩圓交點座標已實算對齊到線與圓上。

---

## 本課採用的 conventions

主線先在 **characteristic 0 的 field**（`ℚ` 與其擴張）上建立所有直覺，並以 `Fp = ℤ/pℤ` 作為 char p 的最小對照，讓學習者不把「field ＝ ℚ／ℝ／ℂ 這種世界」當成一般定義。

- **主線 field 預設 perfect（char 0 或 finite）**，因此 separability 是免費的：irreducible polynomial 一定沒有重根。char p 的 inseparable 現象放進選修深挖，只給一個 scope label，不讓它稀釋「`|Gal| = [L:K]`」這條乾淨主線。
- Polynomial 預設係數在明示的 base field；**minimal polynomial 預設 monic**。
- Extension 預設 **algebraic 且 finite**；transcendental extension（如 `ℚ(π)`）只在 constructibility 的「化圓為方」與維度無限的 scope label 出現。
- Galois extension 定義為 **normal + separable 的有限擴張**；在主線 perfect-field 假設下，等價於「splitting field」。
- 這些假設要在 UI 中持續可見（例如 `CHAR 0 · PERFECT FIELD`、`FINITE EXTENSION`），不藏在註腳；一旦某節換到 finite field 或 char p，scope label 必須換掉。

這個選擇不是宣稱所有教材採同一 convention，而是避免學習者在尚未建立「擴張 → 對稱 → 對應」主軸前，同時背上 separability、inseparable degree、infinite Galois theory 等分歧。

---

## 全課概念主線

```text
現有 field 對某個方程封閉不了（x²−2 在 ℚ、x²+1 在 ℝ 無解）
      ↓ 造一個剛好裝下這個根的最小世界
field extension —— 它是 base field 上的 vector space，維度 [L:K] 就是它的大小
      ↓ 加一個根 = 對 minimal polynomial 做 quotient 與 reduction（回收環課 quotient）
K(α) ≅ K[x]/(m(x))
      ↓ 塔的維度相乘
tower law [L:F] = [L:K][K:F]
      ↓ 幾何版本：尺規作圖 = 一連串二次擴張
constructible ⇔ 落在維度 2ⁿ 的塔（三大古典不可能）
      ↓ 一個根牽出全部根
splitting field / normal extension
      ↓ 擴張自帶的對稱 = 只重排根、不動 base field 的重貼標籤
field automorphism
      ↓ 對稱的數量 = 擴張維度（Galois extension）
|Gal(L/K)| = [L:K]
      ↓ 子群格 ↔ 中間體格，互為鏡像
Galois correspondence
      ↓ 開方 = 逐層加 n 次方根，每層對稱是 abelian
radical tower ↔ solvable group
      ↓ 五次的根對稱拆不出 abelian 層
S₅ 不 solvable（卡在 simple 的 A₅）
      ↓ 兩個完全算得出來的乾淨世界回頭驗證整台機器
finite fields（Frobenius 是自帶的對稱）
      ↓
cyclotomic fields（Gal ≅ (ℤ/nℤ)ˣ，回扣尺規作圖）
      ↓
diagnostic capstone
```

`Galois group` 不以定義卡開場。學習者會先在複平面上看見「哪些根可以互換而不破壞關係」，再替這組重排命名為 automorphism，最後才發現它們組成一個 group 且大小恰好等於維度。

---

## Part 0 · 為什麼還要更大的世界

### Ch1 · Field 是「除法也安全」的世界

**唯一核心 insight：** field 不是「數很多」的世界，而是「每個非零元素都可以被除回去」的世界；有些方程之所以無解，不是數不夠，而是這個世界對那個方程封閉不了。

- 從環課終點接上：field ＝ commutative ring with `1≠0`，每個非零元都是 unit ＝ **只有 `(0)` 與整個 ring 兩個 ideal**（直接回收環課 maximal-ideal 判準）。
- 第一個具體衝突：`x²−2` 在 `ℚ` 裡逐點檢查都無解、`x²+1` 在 `ℝ` 裡無解——但同樣的方程換個世界就有解。讓學習者先預測「缺的是數，還是缺的是世界的封閉性」。
- 用 `Fp = ℤ/pℤ` 當 char p 的最小對照：它是有限的 field，打破「field 一定像 ℚ／ℝ／ℂ」的成見。scope label：`CHAR 0` vs `CHAR p`。
- **擁擠限制：** 本章不定義 extension degree、不談 automorphism、不引入 minimal polynomial。只把「field ＝ 除法安全的封閉世界」與「無解 ＝ 世界封閉不了」兩件事立穩。

**符號對應：** `(F,+,·)`、`char F`、`Fp`；「每個非零元可逆」↔「只有兩個 ideal」。

---

## Part I · 把世界擴大到剛好裝下一個根

### Ch2 · 擴張是一個 vector space，維度就是它的大小

**唯一核心 insight：** 把大 field `L` 看成小 field `K` 上的 vector space，它的「大小」就是維度 `[L:K]`——即使 `L`、`K` 都是無限集合，這個維度仍可能有限，也可能需要無限多個方向。

- 主要互動：把 `ℂ` 看成 `ℝ` 上的平面，basis `{1, i}`，`[ℂ:ℝ]=2`；把 `ℚ(√2)` 看成 `ℚ` 上的平面，basis `{1, √2}`。任何元素都寫成 `a·1 + b·(基底)`。
- Non-degenerate 對照：`ℚ(∛2)` 的 basis 是 `{1, ∛2, ∛4}`，`[ℚ(∛2):ℚ]=3`，避免學習者以為「擴張都是二維」。
- scope label：`ℝ` over `ℚ` 是無限維（transfer，說明 finite 是本課主線假設）。
- **擁擠限制：** 本章只建立「擴張＝向量空間、大小＝維度」。不解釋維度為何等於 minimal polynomial 的次數（Ch3），不談對稱。

**符號對應：** `[L:K]`（degree/dimension）、basis、finite vs infinite extension。回收線代 basis／dimension。

### Ch3 · 加一個根 = 對 minimal polynomial 做 quotient

**唯一核心 insight：** 「加入一個根 α」不是憑空放進一個神祕新數，而是拿它的 minimal polynomial `m(x)` 當 modulus，對多項式做 reduction——`K(α) ≅ K[x]/(m(x))`，這正是環課 quotient ring 的續集。

- 主要視覺：reduction register。運算後超出 basis 的高次項，依 relation 重新分配到低次 directions；不畫循環、不暗示週期。
- Non-degenerate 對照：`ℚ[x]/(x³−x−1)` 中 `α³=α+1`，一次 replacement 會同時流入兩個 basis slots；與 `α³=2` 並排，避免把一般 reduction 誤認成「高次冪總會掉回單一常數槽」。
- 回收環課：`m(x)` irreducible ⇒ `(m(x))` 是 `K[x]` 的 maximal ideal ⇒ quotient 是 field。**這一步是環課 Ch16「quotient by maximal ideal ＝ field」的兌現，不重新證明，只指回。**
- **擁擠限制：** 本章只建立「adjoining a root ＝ modular arithmetic by minimal polynomial」。tower law 留到 Ch4，automorphism 留到 Ch7。

**符號對應：** `K(α)`、minimal polynomial `m(x)`（monic irreducible）、`K[x]/(m(x))`、`deg m = [K(α):K]`。

**密度註記（全課載重最大的一章）：** 本章圍繞單一 insight，但一章要扛 algebraic 元素＋minimal polynomial 存在／irreducible、`K(α)≅K[x]/(m)`、reduction、`deg m=` 維度、maximal→field callback。維持一章，但 storyboard 需嚴控節預算（目標 5 節、上限 6）；若真的爆節，唯一洩壓閥是把「algebraic vs transcendental＋minimal polynomial 存在」抽成前一節的輕量前導，**不獨立成章**（那會拆散同一機制的兩面）。

### Ch4 · 塔的維度會相乘

**唯一核心 insight：** 把兩層擴張疊起來，總維度是兩層維度的乘積——`[L:F]=[L:K][K:F]`；大 basis 由兩層 basis 的乘積構成。

- 主要視覺：`ℚ ⊂ ℚ(√2) ⊂ ℚ(√2,√3)`，`2×2=4`，basis `{1,√2,√3,√6}` 排成 2×2 網格，明示「乘積」的幾何。
- 立即後果（供 Ch5 使用）：`α` 在 `K` 上的次數整除 `[L:K]`——minimal polynomial 的次數必須「塞進」塔的維度。
- **擁擠限制：** 本章只建立維度相乘與「次數整除總維度」。不進入 constructibility 判準（Ch5），不談 normal。

**符號對應：** tower law `[L:F]=[L:K][K:F]`、`α∈L ⇒ deg_K(α) ∣ [L:K]`（逆向不成立）。

---

## Part II · 幾何與「一個根牽出全部根」

### Ch5 · 尺規作圖 = 二次擴張的塔（招牌章）

**唯一核心 insight：** 每一步尺規作圖只解一個一次或二次方程，所以能作圖的數恰好落在「一連串二次擴張」疊成的塔裡；一個數若要能作圖，它在 `ℚ` 上的維度**必須**是 2 的冪。三大古典不可能問題就卡在需要 degree 3 或根本不是代數數。

- 主要視覺：左側是尺規動作，右側同步是 construction field tower；只有真正加入新平方根時才長一層 `[Kᵢ:Kᵢ₋₁]=2`，沒有新方向則 ×1。目標 `ℚ(x)` 畫成 ambient `Kₘ` 內的 pocket，不與整座塔混為一談。
- 三大不可能，各自一個 decisive witness：
  - 倍立方：`∛2` 的 minimal polynomial 是 `x³−2`，degree 3，不是 2 的冪 → 不可作圖。
  - 三等分角：`cos 20°` 滿足一個 degree 3 的 irreducible，degree 3 → 不可作圖。
  - 化圓為方：`π` transcendental，根本不是代數數 → 落不進任何有限塔。
- **Evidence 強度護欄（本章最關鍵）：** 「degree 是 2 的冪」是**必要非充分**條件。一個 degree 3 的 witness 足以**推翻**可作圖（`WITNESS`）；但畫面**不得**用「degree 是 2 的冪」冒充「一定可作圖」的證明（存在 degree 4 卻不可作圖的數）。UI 明示 `WITNESS · NOT CONSTRUCTIBLE` 與 `NECESSARY CONDITION ONLY`，不讓綠燈看起來像充分證明。
- **擁擠限制：** 本章只用「維度是 2 的冪」這個必要條件擋下三大問題。完整的「可作圖 ⇔ 落在二次塔」充分刻畫放展開層。

**符號對應：** quadratic tower `ℚ=K₀⊂…⊂Kₙ`、`[Kₙ:ℚ]=2ᵐ`、transcendental vs algebraic。

### Ch6 · 從一個根到完整根系

**唯一核心 insight：** 加一個根不代表其 conjugates 會全部跟來；splitting field 是針對一個 polynomial 補齊所有根的最小 construction，normal 則要求 extension 對所有 relevant irreducible families 都不會只含一部分。對 finite extensions，splitting-field certificate 與 normal 等價。

- 主要對照：`ℚ(∛2)`（只含一個實根，另兩個複根不在裡面）vs `ℚ(∛2, ω)`（把 `x³−2` 的三個根全裝進來）。視覺上把三個根畫在複平面，看哪些落在世界內。
- separability 是另一條軸：normal 管 conjugates 是否到齊，separable 管它們是否彼此相異；finite extension 同時滿足兩者才是 Galois。主線 perfect fields 下 separability 免費，char p 的 inseparable 現象放展開層。
- **擁擠限制：** 本章只建立 splitting field、normal/separable 兩軸與 Galois 舞台。automorphism 的定義與計數留到 Ch7–8。

**符號對應：** splitting field、normal extension、separable extension、Galois ⇔ normal + separable（finite）。

---

## Part III · 對稱

### Ch7 · 根之間的對稱：只重排根、不動底層

**唯一核心 insight：** 擴張的一個 symmetry 是一個「固定 base field 每個元素、只把根重新貼標籤」的映射，而且它必須保持所有代數關係——所以它只能把一個根送到「同一個 minimal polynomial 的另一個根」。

- 主要視覺：根排在複平面上，`σ` 是一個 permutation。`ℂ/ℝ` 的複共軛把 `i ↔ −i`（`x²+1` 的兩根對調），是唯一的非平凡 `ℝ`-automorphism。`ℚ(√2)/ℚ` 把 `√2 ↔ −√2`。
- 關鍵限制（防錯誤泛化）：`σ` 不能把 `√2` 送到 `∛2`——它只能在**同一條 minimal polynomial 的根集合內**重排。用一個 decisive witness 讓「亂配對」立刻破壞某個代數等式。
- **擁擠限制：** 本章只建立「automorphism ＝ 保關係的 root 重排」。不計數、不組成 group（Ch8）。

**符號對應：** `K`-automorphism、`Aut(L/K)`、fix base field、permute roots of a minimal polynomial。

### Ch8 · 對稱的數量剛好等於維度

**唯一核心 insight：** 有限擴張的 automorphism 數量最多是維度；當擴張同時 normal + separable（Galois）時，數量**恰好**等於維度——「對稱填滿了維度」。

- 主要 non-degenerate 對照：
  - `ℚ(∛2)/ℚ`：degree 3，但只有 1 個 automorphism（另兩根是複數，不在世界內）→ **不是** Galois，對稱沒填滿維度。
  - `ℚ(∛2, ω)/ℚ`：degree 6，有 6 個 automorphism（`≅ S₃`）→ Galois，對稱填滿維度。
- 這個對照直接回收 Ch6：normal（全家進來）＋ separable 才讓對稱數 ＝ 維度。
- **擁擠限制：** 本章只建立 `|Gal(L/K)| = [L:K]`（Galois 時）與「不 normal 就填不滿」的對照。correspondence 留到 Ch9。

**符號對應：** `Gal(L/K)`、`|Aut(L/K)| ≤ [L:K]`，等號 ⇔ Galois。

### Ch9 · 子群格 ↔ 中間體格，互為鏡像（全課中心）

**唯一核心 insight：** 對一個 Galois 擴張，「中間 field」與「對稱子群」一一對應，而且是**上下顛倒的鏡像**：越大的對稱群固定越小的世界；`[L:E]=|H|`，`[E:K]=[G:H]`。

- 主要視覺：兩個同步 lattice。左邊是中間 field 的格（由 `K` 到 `L`），右邊是 `G` 的 subgroup 格（由 `{e}` 到 `G`），中間用 order-reversing 的對應線連起來。點一邊，另一邊高亮對應節點。
- 完整可算範例：`ℚ(√2,√3)/ℚ`，`G ≅ ℤ/2 × ℤ/2`。四個子群 ↔ 四個中間體：`ℚ(√2)`、`ℚ(√3)`、`ℚ(√6)`，加上兩端 `ℚ`、`ℚ(√2,√3)`。每個對應都能手算驗證，格的鏡像關係完全顯式。
- normal subgroup ↔ normal（Galois）sub-extension，作為進 Ch10 的接口，本章先點出、細節放展開層。
- **擁擠限制：** 本章只建立 correspondence 的 bijection 與 order-reversing、維度對應。solvability 留到 Ch10。

**符號對應：** `E ↦ Gal(L/E)`、`H ↦ L^H`（fixed field）、`[L:E]=|H|`、`[E:K]=[G:H]`。

---

## Part IV · 可解性

### Ch10 · 開方 = 逐層加 n 次方根，每層對稱是 abelian

**唯一核心 insight：** 「用根式解出來」等於「從 base field 出發，一層一層加入某個東西的 n 次方根」；在補足 roots of unity 後，每一層擴張的對稱是 abelian（cyclic）——所以可根式解 ⇔ Galois group 可以被剝成一疊 abelian 層（solvable group）。

- 主要視覺：一個 radical tower（每層寫著 `adjoin ⁿ√…`）與其對應的 subgroup chain 並排，每一層的 quotient 標成 abelian。
- 回收群論：solvable group ＝ 有一條 subnormal series 使每個 quotient 都 abelian。這裡不重新定義，只把群論的 solvable 接到「逐層開方」上。
- roots of unity 需先補進來的技術細節放展開層，不打斷主線。
- **擁擠限制：** 本章只建立「radical tower ↔ abelian-layered（solvable）group」。五次的具體失敗留到 Ch11。

**符號對應：** radical extension、solvable group、subnormal series with abelian quotients。

### Ch11 · 五次為何沒有公式

**唯一核心 insight：** 一般五次方程的 Galois group 是 `S₅`，而 `S₅` 剝不成 abelian 層——它卡在一個非交換的 simple group `A₅`；根的對稱太糾纏，拆不出可開方的層次。

- 主要視覺：嘗試把 `S₅` 逐層拆解的動畫，每次都撞回 `A₅` 這道牆；對照 Ch10 能順利拆成 abelian 層的低次數情形。
- 具體 witness：`x⁵−6x+3`（Eisenstein irreducible、恰三個實根）的 Galois group 是 `S₅` → 不可根式解。與「一般五次」的 `S₅` 相互印證。
- 3D 選修：`A₅` ＝ 正二十面體（icosahedron）的旋轉對稱群（60 個），把「非交換 simple」具象化（符合本專案 3D 準則：解決 2D 難表達的空間對稱）。
- 回收群論：`A₅` 是最小的非交換 simple group——群論課裡那頁在這裡兌現成「五次無公式」。
- **擁擠限制：** 本章只完成「`S₅` 不 solvable ⇒ 五次不可根式解」。不進入一般 `n≥5` 的完整處理（點到即可）。

**符號對應：** `S₅`、`A₅`（simple, nonabelian）、not solvable ⇒ not solvable by radicals。

---

## Part V · 乾淨的完整範例與收束

> **範圍決策：** finite fields 與 cyclotomic fields 是整台機器完全透明運轉的兩族——correspondence、群、固定體全都可顯式寫出。它們機制不同、各自一整章的份量，故拆成 Ch12、Ch13 兩章，不合併。

### Ch12 · Finite fields：Frobenius 是自帶的對稱

**唯一核心 insight：** 每個 order `pⁿ` 恰有一個 field，而它對 `F_p` 的**所有**對稱都由單一個 Frobenius `x↦xᵖ` 生成；子體剛好對應 `n` 的因數——一個 correspondence 完全可手算的透明世界。

- 每個 `pⁿ` 恰有一個 `F_{pⁿ}`（up to iso），是 `xᵖⁿ−x` 的 splitting field。
- `Gal(F_{pⁿ}/F_p)` 是 cyclic、階 `n`，生成元是 **Frobenius** `φ:x↦xᵖ`。
- 子群 ↔ 子體：`F_{pᵈ} ⊆ F_{pⁿ} ⇔ d ∣ n`，與 `⟨φ⟩` 的子群一一對應——Ch9 correspondence 在此完全顯式。
- Non-degenerate：用 `F_8`／`F_9`（`n=3`／`2`），別只用 `F_4` 讓 `n=2` 的偶然對稱誤導。
- **擁擠限制：** 只跑 finite field 一族與 Frobenius；cyclotomic 留 Ch13。

**符號對應：** `F_{pⁿ}`、Frobenius `x↦xᵖ`、`F_{pᵈ}⊆F_{pⁿ} ⇔ d∣n`。

### Ch13 · Cyclotomic fields：roots of unity 與 (ℤ/nℤ)ˣ

**唯一核心 insight：** 把 `n` 次單位根全裝進 `ℚ` 得到的 `ℚ(ζ_n)` 是 Galois，其對稱群恰好是 `(ℤ/nℤ)ˣ`——每個對稱就是「把 `ζ` 送到 `ζᵏ`」；正 `n` 邊形能不能尺規作圖，也由這個群回扣 Ch5。

- `ℚ(ζ_n)/ℚ` Galois，`Gal ≅ (ℤ/nℤ)ˣ`，`σ_k:ζ↦ζᵏ`（`gcd(k,n)=1`）；`[ℚ(ζ_n):ℚ]=φ(n)`（Euler totient）。
- 回扣 Ch5（Gauss）：正 `n` 邊形可作圖 ⇔ `φ(n)` 是 2 的冪 ⇔ `n = 2ᵏ ×`（相異 Fermat primes）；正 17 邊形可作、正 7／9 邊形不可作。
- Non-degenerate：`n=5`（`φ=4`，可作）對照 `n=7`（`φ=6`，不可作），別只用 `n=3,4` 的小 case。
- **擁擠限制：** 只跑 cyclotomic 一族與 `(ℤ/nℤ)ˣ`；一般 abelian extension（Kronecker–Weber）只在展開層點名。

**符號對應：** `ζ_n`、`Gal(ℚ(ζ_n)/ℚ) ≅ (ℤ/nℤ)ˣ`、`[ℚ(ζ_n):ℚ]=φ(n)`。

### Ch14 · Diagnostic capstone

**全章核心 insight：** 面對一個陌生的擴張或多項式，先問「要量什麼」，再選對第一個 decisive test，而不是由表面名詞猜定理。照 Rings Ch18 的六節 capstone 模式，每節只完成一個可遷移的診斷動作。

- 診斷路徑選擇：
  - 要知道「多大」→ 算 `[L:K]`（tower law / minimal polynomial degree）。
  - 要知道「能不能作圖」→ 檢查 degree 是不是 2 的冪（必要條件）。
  - 要知道「一個根有沒有牽出全部」→ 判 normal / splitting field。
  - 要知道「有幾個對稱」→ 判 Galois，算 `|Gal|`。
  - 要知道「哪些中間體」→ 用 correspondence 從子群反讀。
  - 要知道「能不能開方解」→ 判 Galois group 是否 solvable。
- 最終 route map 只收束「問題 → 第一個 decisive test」，不要求一頁做完長計算。

### Ch14 最終收束圖

```text
要量什麼？
  多大 ────────────► [L:K]、tower law、minimal polynomial degree
  能否作圖 ─────────► degree 是否 2ⁿ（必要條件）
  是否牽出全部根 ───► normal / splitting field
  有幾個對稱 ───────► Galois？|Gal(L/K)| = [L:K]
  哪些中間世界 ─────► correspondence：子群 ↔ 中間體
  能否開方解 ───────► Galois group 是否 solvable（S₅ 卡在 A₅）
```

最終圖卡：

> Field extension 是為了裝下一個根而長出的世界；它自帶的對稱記錄了哪些根可以互換；而「能不能開方解」最後只是一個問題——這組對稱能不能被拆成 abelian 層。

---

## Ch1 詳細 storyboard · Field 是「除法也安全」的世界

### 全章設計句

```text
核心 insight：
Field 不是「數多到夠用」的世界，而是「加法能撤銷、且每個非零元的乘法也能撤銷」的世界。Ring 已保證前者；field 只多要求後者這一件事。「某方程無解」不是因為數不夠，而是因為這個世界對那個方程封閉不了。

學習者原本可能怎麼誤解：
1. Field 就是「可以加減乘除的數」，而 ℚ／ℝ／ℂ 就是 field 的樣子——以為 field 一定無限、char 0、長得像數線。
2. 只要世界夠「密」或元素夠多，方程就會有解（把可解性當成數量問題）。
3. 所有 ℤ/n 都能除，因為它們都叫「modular arithmetic」。
4. 一個元素能不能除，是它「自己」的性質，與它住在哪個世界無關。

第一個具體問題：
同一個元素 2，在 ℤ、ℚ、ℤ/5、ℤ/4 這四個世界裡，能不能被除回去（找到乘起來等於 1 的夥伴）？為什麼答案由世界決定，而不是由 2 決定？

全章主要視覺模型：
「inverse-partner 面板」——不論世界是 ℤ、ℚ 還是 ℤ/n，都用同一種畫面：選一個非零元，系統在同一世界內找它的乘法反元素夥伴。field-ness 一律從「是不是每個非零元都找得到夥伴」讀出，而不是從世界的外觀（數線、時鐘）讀出。

全章保持不變的東西：
「能除 ＝ 每個非零元都有乘法反元素」這條判準跨所有世界不變；改變的是 ambient world，以及因此哪些元素找得到夥伴。

主例子的 accidental properties：
- 只用 ℚ／ℝ／ℂ 會暗示 field 一定無限、char 0、像數線 → 用 F_p 對照。
- 只用 ℤ/p 會暗示所有 ℤ/n 都能除 → 用 ℤ/6、ℤ/4 對照。
- ℤ/5 內 1、4 自逆（4≡−1）會暗示 inverse 通常等於自己 → 主例改用非自逆的 2↔3。

哪個 non-degenerate state 讓角色真正分開：
ℤ/5（field）與 ℤ/6（非 field）同為「時鐘」外觀但結論相反；且 ℤ/5 內 2↔3 這對 inverse 不等於自己。

視覺可能造成的假暗示：
數線的「連續／稠密」外觀可能被誤讀成 field 的判準。四種世界共用同一 inverse-partner 視覺，把判準綁在「有沒有夥伴」，不綁在世界形狀。

evidence 類型：
ℤ/n 用 FINITE EXHAUSTION（可掃完）；ℚ 的可逆用 GENERAL ARGUMENT（p/q 的反元素公式）；「非零元進 ideal 就撐滿整個 field」也是 GENERAL ARGUMENT。UI 明示三者證明力不同。

特例 detector 與 course convention 如何持續標示 scope：
持續顯示 COMMUTATIVE · 1≠0 與 CHAR 0／CHAR p；1.4 起確立全課的 char 標籤。

正式內容放在哪個展開層：
完整 field axioms、division ring（非交換版）與本課 commutative 慣例、char 是 0 或 prime 的理由、Fˣ 是 abelian group。

最後如何檢查能否遷移：
固定「找 2 的乘法 inverse」，只換 ambient world，看 2 的地位在 ℤ（非 unit）、ℚ（½）、F5（=3）、ℤ/4（zero divisor）之間改變。
```

### 1.1 · 為什麼「能除」是一件特別的事

- **衝突／預測：** 環課已把 ring 走完——`+`、`−`、`×` 都在、加法方程 `a+x=b` 永遠有解。先問學習者：在 ℤ 裡 `2x=1` 有解嗎？再讓他們預測「ℤ、ℚ、ℤ/6、ℤ/5 四個世界，哪些能對任意非零元做除法？」，揭曉前先各自下注。
- **可操作模型：** inverse-partner 面板。選一個非零元 `a`，面板在**同一世界內**掃找 `b` 使 `a·b=1`。ℤ 只有 `±1` 找得到；ℚ 每個非零元都找得到（`a=p/q → b=q/p`）；ℤ/6 只有 `1,5`；ℤ/5 全部 `1,2,3,4` 都找得到。
- **視覺因果：** 找到夥伴就在兩者間連一條「乘積回到 1」的線，找不到就顯示「此世界內無夥伴」。同一操作、不同世界，線的有無由世界決定。
- **invariant：** 判準永遠是「乘積回到 1」；變的是世界。
- **evidence 類型：** ℤ/n 用 `FINITE EXHAUSTION`；ℚ 用 `GENERAL ARGUMENT`（`p/q` 反元素公式），不逐一試。
- **回收前課：** 這正是環課 Ch4 的 unit；field 的伏筆是「每個非零元都是 unit」。
- **壓縮圖卡：** 「Ring 保證加法能撤銷；field 多要求一件事——每個非零元的乘法也能撤銷。」
- **擁擠限制：** 本節不給 field 定義卡，不談 ideal、char。只讓「能除是特別的、大多數 ring 做不到」成為可見事實。

### 1.2 · Field 的定義就是「非零元全是 unit」

- **命名：** 在 1.1 的觀察上命名：commutative ring with `1≠0`，若每個非零元都是 unit，就是 **field（體）**；此時 `Fˣ = F∖{0}`。
- **可操作模型：** 並排 detector，逐一測 ℤ、ℚ、ℤ/5、ℤ/6、ℤ/4，各自標出 units 與非零非-unit；field ⇔ 後者為空。
- **non-degenerate 對照（防偶然性質）：**
  - ℤ/5（field）vs ℤ/6（非 field）：同為時鐘外觀、結論相反——擋掉「所有 ℤ/n 都能除」。判準回收環課：ℤ/n 是 field ⇔ `n` prime。
  - ℤ/5 內用 `2↔3` 這對非自逆 inverse 當主例（`2·3=1`），不用 `1、4` 的自逆巧合。
  - ℤ/4 點出 `2` 是 zero divisor（`2·2=0`）——非 unit 是結構性擋住除法，不是「剛好沒找到」（回收環課 Ch5）。
- **evidence 類型：** `FINITE EXHAUSTION`（掃完每個 ℤ/n）＋ `GENERAL ARGUMENT`（`n` prime ⇔ field）。
- **符號對應：** `(F,+,·)`、`Fˣ`、「field ⇔ ℤ/n 的 n 為 prime」。
- **壓縮圖卡：** 「Field 與『只是 ring』的界線，就在有沒有非零卻不能除的元素。」
- **擁擠限制：** 本節只定義 field 與判 unit 覆蓋。不進 ideal 視角（1.3）、不進 char（1.4）。

### 1.3 · 從 ideal 看 field：只有兩個 ideal

- **衝突／預測：** 回到環課語言先預測：「一個 field 裡，能不能造出一個既不是 `(0)`、也不是整個 field 的 ideal？」
- **可操作模型：** 在 field 裡挑任一非零元 `a` 放進候選 ideal，面板施加 ambient 乘法：`a` 可逆 → `a⁻¹·a=1` 被吸進來 → `1` 再把所有元素吸進來，候選 ideal 瞬間膨脹成整個 field。對照 ℤ：把 `2` 放進 ideal 只長出偶數 `(2)`，停得下來，因為 `2` 不可逆。
- **視覺因果：** 「放入非零元 → 被 inverse 拖出 1 → 1 拖出全世界」三步吸收動畫；ℤ 裡第一步就卡住。
- **invariant：** 「非零元 × 可逆 ⇒ 拖進整個世界」；變的是該元素在此世界可不可逆。
- **evidence 類型：** `GENERAL ARGUMENT`（一行：非零元在 ideal 且可逆 ⇒ ideal ＝ 整個 ring），操作後才顯示。
- **回收與前導：** 這就是環課 Ch16「`R/M` 是 field ⇔ `M` maximal」回頭看得懂的原因，也是本課 Ch3「`K[x]/(m)` 是 field ⇔ `m` irreducible」的前置。
- **符號對應：** 「field ⇔ 只有 `(0)` 與 `R` 兩個 ideal」。
- **壓縮圖卡：** 「Field ＝ 沒有中間 ideal 的 ring；非零元一旦進 ideal，可逆性就把整個世界拖進來。」
- **擁擠限制：** 本節只建立「兩個 ideal」判準。不證 maximal ideal 一般理論、不碰 polynomial ideal（留 Ch3）。

### 1.4 · Field 不一定像 ℚ／ℝ／ℂ：char 與 F_p

- **衝突／預測：** 先問「field 一定是無限的嗎？一直加 1 會不會回到 0？」讓學習者預測 ℚ 與 F5 的差別。
- **可操作模型：** 「加 1 計數器」。ℚ 裡連加 1 永不回 0；F5 裡 `1+1+1+1+1=0`，加法世界繞回原點。定義 **characteristic**：使 `n·1=0` 的最小正整數 `n`（沒有就是 0）。char ℚ ＝ 0，char F5 ＝ 5。
- **non-degenerate：** F5 小、有限，卻是不折不扣的 field——除法照樣通（`2·3=1` 故 `2⁻¹=3`）。把 finite field 呈現成「同樣合法」，不是異類。
- **scope label（全課通用）：** 本節起確立 `CHAR 0`（主線）與 `CHAR p` 兩個持續標籤；之後任何一節切到 finite field 都要換標籤。
- **evidence 類型：** `FINITE EXHAUSTION`（F5 的 wrap-around 可直接看完）。
- **符號對應：** `char F`、`F_p = ℤ/pℤ`、（展開層）「char 是 0 或 prime」。
- **壓縮圖卡（全章收束）：** 「Field 只約束四則運算安全，不約束大小或 characteristic；有限的 F_p 也是 field。」
- **前導 teaser（本章不解決）：** 即使 ℚ 除法完全沒問題，`x²−2` 在 ℚ 仍無解、`x²+1` 在 ℝ 無解——缺的不是除法，是「對這個多項式的封閉性」。下一步不是加更多數，而是造一個剛好裝下缺席根的最小世界。（實作於 Ch2–3，本章只留問題。）
- **擁擠限制：** 本節只建立 char 與「field 不必像 ℚ／ℝ／ℂ」。不建 extension、不定義 degree、不碰 minimal polynomial。

### transfer（全章一次受控遷移）

固定「找 `2` 的乘法 inverse」這個 element＋equation，只換 ambient world：

- ℤ：`2` 非 unit（無解）
- ℚ：`2⁻¹ = 1/2`
- F5：`2⁻¹ = 3`
- ℤ/4：`2` 是 zero divisor（結構性無解）

同一個 `2`、同一條方程，地位由世界決定——證明「可除」依附世界而非元素外觀，正面打掉「元素自帶可除性」的誤解。

### Ch1 畫面與實作約束

- 四種世界（ℤ、ℚ、ℤ/n、F_p）共用同一 inverse-partner／ideal-absorption 視覺語法，讓 field-ness 從「每個非零元是否有夥伴」讀出，不從數線或時鐘外觀讀出（避免暗示「field ＝ 連續數線」）。
- 所有 selector（選元素、選世界）畫成 cards／buttons，不用位置或距離暗示不存在的運算語意。
- evidence 標籤 `EXAMPLE／FINITE EXHAUSTION／GENERAL ARGUMENT` 明顯可見；綠燈不等於一般證明。
- 動態 readout（units 集合、char 計數、ideal 膨脹）隨操作即時重算，可重設／重播；`aria-live` 播報 verdict，但不逐 frame 洗版。
- scope label `CHAR 0／CHAR p`、`COMMUTATIVE · 1≠0` 持續顯示。
- 全部控制項可鍵盤操作、有可見 focus 與非色彩狀態線索（形狀＋文字，不只紅綠）。

### Ch1 完成驗收

學習者離開本章後應能：

1. 用「加法能撤銷、且每個非零元乘法也能撤銷」說出 field 相對 ring 多要求什麼，而不是背「能加減乘除的數」。
2. 判斷 ℤ/6、ℤ/4 為何不是 field、ℤ/5 為何是，並指出關鍵是「有沒有非零非-unit／zero divisor」。
3. 用「只有 `(0)` 與整個 ring 兩個 ideal」重述 field，並說明可逆性如何把非零元的 ideal 撐滿整個世界。
4. 接受 finite field（F_p）是合法 field，並用 char 區分 ℚ 與 F_p。
5. 說出「`x²−2` 在 ℚ 無解」缺的是封閉性而非數量，並知道這問題留待造更大的世界解決——但**還不會**在本章動手造。

若任何一項只能靠背定義或指向 ℚ／ℝ／ℂ 的外觀，而不能用 inverse-partner／ideal-absorption 模型解釋，本章就還不算完成。

---

## Ch2 詳細 storyboard · 擴張是一個 vector space，維度就是它的大小

### 接續 Ch1 的教學

Ch1 收在一個懸而未決的問題：即使 ℚ 的除法完全沒問題，<code>x² − 2</code> 在 ℚ 仍無解——缺的是「對這個多項式的封閉性」，下一步要造一個剛好裝下 √2 的最小世界，但 Ch1 沒有動手造。**Ch2 就從這裡接手，而且刻意讓 Ch1 的透鏡繼續有效：**

- **回收 Ch1 的「field ＝ 可除」透鏡：** 造出來的 <code>ℚ(√2)</code> 仍然是一個 field——<code>1/(a+b√2)</code> 依然落在世界內。學生在 Ch1 學會問「這是不是 field？」，在 Ch2 對同一個物件再多問一個問題：「它比 base 大多少？」
- **新增一個透鏡「維度」：** 同一個擴張同時戴兩頂帽子——對自己是 field（Ch1 的視角），對 base field 是一個有限維 vector space（Ch2 的新視角）。這一章要建立的就是後者，並把「大小」量化成 <code>[L:K]</code>。
- **為 Ch3 鋪路：** 本章會在兩個受控實例中看見一條 polynomial relation（<code>√2·√2 = 2</code>、<code>∛2³ = 2</code>）讓之後的冪可以摺回既有方向；但動畫本身不能證明此前各方向獨立。Ch3 才用 minimal polynomial 同時補上「為何沒有更早的 relation」與一般 reduction 機制。

### 全章設計句

```text
核心 insight：
把「更大的世界」L 看成 base field K 上的 vector space，它的「大小」就是維度 [L:K]。即使 L、K 都是無限集合，這個維度仍可能是有限數字；但也可能真的需要無限多個獨立方向。而 L 同時仍是一個 field，只是我們現在改用「有幾個獨立方向」來量它。

學習者原本可能怎麼誤解：
1. 「更大的世界」是模糊地「多了一些數」，說不清到底多了什麼、多了多少。
2. 擴張都像 ℂ 那樣是「一個平面」，維度永遠是 2。
3. 擴張一定牽涉虛數（因為第一次看到的擴張是 ℝ→ℂ）。
4. 座標平面上的距離、角度對這個世界有數學意義（其實只是選值用的座標）。

第一個具體問題：
把 √2 丟進 ℚ、又要保持加減乘除封閉，最少還得帶進哪些數？答案是恰好所有 a+b√2；為什麼「兩個方向」就夠，而 ∛2 卻需要三個？

全章主要視覺模型：
「basis-coordinate 面板」——把 L 的每個元素寫成 base field 上的座標：ℚ(√2) 的 a+b√2 對應 (a, b)，基底方向是 1 與 √2；ℂ 的 a+bi 對應 (a, b)，基底方向是 1 與 i。維度 = 需要幾個獨立方向。座標軸代表「基底方向」，不是帶有距離語意的幾何平面。

全章保持不變的東西：
L 一直是一個 field（能除）；改變的是我們用哪個 base field 去量它、因此需要幾個方向。換根（√2 → ∛2）會改變方向數，但「擴張 = base 上的 vector space」這件事不變。

主例子的 accidental properties：
- 只用 √2 與 ℂ（都是 dim 2）會暗示所有擴張都是二維 → 2.3 用 ∛2（dim 3）打破。
- 用 ℝ→ℂ 當唯一例子會暗示「擴張＝加虛數」→ 同時用實數擴張 ℚ(√2)，證明不必牽涉虛數。
- a+b√2 畫成平面會暗示距離／角度有意義 → 軸只標「基底方向」，不畫成 metric plane、不把乘法演成旋轉。
- 基底 {1, √2} 的 1 與 √2 角色不同（base 的單位 vs 新根），不可畫成同一種東西。

哪個 non-degenerate state 讓角色真正分開：
用 3+2√2（兩個座標都非零）而非純 √2，讓兩個方向都被用到；並以 ∛2 的 dim 3 對照 √2 的 dim 2，讓方向數真的不同。

視覺可能造成的假暗示：
座標平面的距離、夾角、面積在此無數學語意；不得用它們暗示 field operation。內部乘法（√2·√2=2）如何摺回，本章只「觀察」，不演成幾何旋轉（那是 Ch3／Ch7）。

evidence 類型：
ℚ(√2) 封閉且仍是 field 用 GENERAL ARGUMENT（<code>1/(a+b√2) = (a−b√2)/(a²−2b²)</code>，且 a²−2b²≠0）；具體乘積用 EXAMPLE；「ℝ 對 ℚ 無限維」在展開層以 GENERAL ARGUMENT 草稿（cardinality）呈現。

特例 detector 與 course convention 如何持續標示 scope：
持續顯示 FINITE EXTENSION（主線）；2.4 明示 ℝ/ℚ 是 INFINITE。char p 的 transfer（F₄/F₂）換上 CHAR 2 標籤。

正式內容放在哪個展開層：
extension 的正式定義、[L:K] = dim_K L 與 basis-independence、ℚ(√2) 每個非零元可逆的證明、K(α) 的 basis {1,α,…,α^{n−1}}（完整留 Ch3）、ℝ/ℚ 無限維的 cardinality 論證。

最後如何檢查能否遷移：
換 ambient world 保持機制：F₄ 當作 F₂ 上的 vector space，basis {1, α}，dim 2——與 ℚ(√2)/ℚ 同構造，證明「擴張＝vector space」不依賴 char 0，並回收 Ch1 的 finite fields。
```

### 2.1 · 那個「更大的世界」到底裝了哪些數？

- **衝突／預測（直接接 Ch1）：** Ch1 說要造一個裝下 √2 的最小世界。先讓學習者預測：「把 √2 丟進 ℚ、還要能加減乘除，最少要帶進哪些數？」選項：只要多一個 √2／所有 <code>a+b√2</code>／需要無窮多種新形式。
- **可操作模型：** closure builder。兩個係數選擇器 <code>a</code>、<code>b</code>（取小範圍有理數）組出 <code>a+b√2</code>。按「相乘」把兩個這種數相乘，結果 <code>(ac+2bd)+(ad+bc)√2</code> 自動摺回同樣的兩槽形式；按「取倒數」顯示 <code>1/(a+b√2) = (a−b√2)/(a²−2b²)</code> 也落在兩槽形式。
- **視覺因果：** 任何 +、×、÷ 的輸出都「吸附」回 <code>[1 槽][√2 槽]</code> 兩格——沒有跑出第三種形式，也沒有跑出世界。
- **invariant：** 封閉性與「仍是 field」不變；變的是選了哪個 <code>a+b√2</code>。
- **回收 Ch1：** 倒數仍在世界內 → <code>ℚ(√2)</code> 仍是 Ch1 定義的 field，只是現在多了一個新根。
- **evidence 類型：** 具體乘積 <code>EXAMPLE</code>；倒數公式 <code>GENERAL ARGUMENT</code>。
- **壓縮圖卡：** 「裝下 √2 的最小世界，恰好是所有 <code>a+b√2</code>——兩個方向就封閉。」
- **擁擠限制：** 本節只發現「形式恰為 a+b√2、且仍是 field」。不說「vector space／維度」（2.2），不解釋為何高次冪一定摺回（Ch3）。

### 2.2 · 把擴張看成 base field 上的向量空間

- **命名：** <code>a+b√2</code> 就是座標 <code>(a, b)</code>，基底方向是 <code>{1, √2}</code>。<code>L</code> 是 <code>K</code> 上的 <strong>vector space</strong>：可以相加、可以用 <code>K</code> 的元素縮放。方向數就是 <strong>維度 <code>[L:K]</code></strong>。
- **可操作模型：** 兩個同步 basis-coordinate 面板。左：<code>ℚ(√2)</code>，把 <code>3+2√2</code> 畫成 <code>(3, 2)</code>，兩軸標「1 方向／√2 方向」。右：<code>ℂ = ℝ(i)</code>，把 <code>a+bi</code> 畫成 <code>(a, b)</code>，基底 <code>{1, i}</code>。切換係數，兩邊同步顯示「同一個想法」。
- **視覺因果：** 改 <code>a</code> 只沿 1 方向移動、改 <code>b</code> 只沿另一方向移動——維度 = 需要幾個獨立方向。
- **invariant：** 「兩個方向」= dim 2；換係數不改變維度。
- **關鍵界線（防混淆）：** vector space 只用 <code>+</code> 與「用 K 縮放」；內部乘法 <code>√2·√2=2</code> 是額外結構（讓它成為 field），其一般機制留 Ch3。座標軸是基底方向，不是 metric——距離與夾角在此沒有 field 語意。
- **evidence 類型：** 「每個元素都能寫成基底座標」是 <code>GENERAL ARGUMENT</code>，以具體 reductions 呈現。
- **符號對應：** <code>[L:K] = dim_K L</code>（extension degree）、basis <code>{1, √2}</code>／<code>{1, i}</code>。
- **壓縮圖卡：** 「擴張的『大小』是一個維度：base 上需要幾個獨立方向。」
- **擁擠限制：** 本節只建立 vector-space 透鏡與維度。不證「維度 = minimal polynomial 次數」（Ch3／Ch4），不談 tower（Ch4）。

### 2.3 · 維度不是二：relation 不同，方向數就可能不同

- **單一 insight：** 擴張不固定是二維；方向數取決於新元素所滿足的最低次 exact polynomial relation。這節只比較兩個受控 radical cases <code>α²=2</code> 與 <code>α³=2</code>，不把「根號外觀」泛化成一般定律。
- **防偶然性質：** 換成 <code>∛2</code>。在這個 case 中需要 <code>1、∛2、∛4</code> 三個方向，且 <code>(∛2)³ = 2</code> 已能用舊方向表示；所以 <code>[ℚ(∛2):ℚ] = 3</code>。真正保證 <code>1、∛2、∛4</code> 獨立的證書，是 <code>x³−2</code> 在 ℚ 上 irreducible，留 Ch3 進入主流程。
- **可操作模型：** 切換受控案例（√2 → dim 2、∛2 → dim 3）。逐冪推進時，面板顯示 direction cards，並把證據拆成兩欄：左欄 <code>VISIBLE RELATION</code> 顯示 <code>αⁿ=2</code>；右欄 <code>PROOF DEBT</code> 明說「動畫尚未證明此前沒有更早的 relation」。
- **視覺因果：** 操作能直接證明的只有「目前 relation 使這一冪不再開新槽」；它不能靠逐格出現就證明先前 cards linearly independent。
- **invariant：** 仍用「幾張獨立 direction cards」量維度；改變的是控制這些 cards 的最小 relation，而不是表面上的根號種類。
- **evidence 類型：** <code>EXAMPLE + EXPLICIT PROOF DEBT</code>。relation 是直接可見的 witness；independence 由展開層先給 irreducibility 證書，Ch3 再正式一般化。
- **符號對應：** <code>[ℚ(√2):ℚ]=2</code>、<code>[ℚ(∛2):ℚ]=3</code>；先用「最低次 exact polynomial relation」描述控制物，<strong>minimal polynomial</strong> 的正式定義與 <code>deg m=[K(α):K]</code> 留 Ch3。
- **壓縮圖卡：** 「維度不由『加了一個根』決定；它由最早能把新冪拉回舊方向的 exact relation 控制。」
- **擁擠限制：** 本節只打破「所有擴張都是二維」並留下清楚 proof debt。不教 irreducibility test、不正式定義 minimal polynomial、不做一般 reduction；全部留 Ch3，tower law 留 Ch4。

### 2.4 · 有些擴張是無限維（scope）與收束

- **衝突／預測：** 「把 ℝ 當作 ℚ 上的 vector space，維度是有限還是無限？」讓學習者先猜。
- **可操作模型：** 對照牆。左：有限維擴張（<code>ℚ(√2)</code>、<code>ℚ(∛2)</code>）能列出完整 basis。右：先看子擴張 <code>ℚ(π)/ℚ</code>，逐張加入 <code>1,π,π²,…</code> 的 independent-direction cards。每加入 <code>πⁿ</code>，relation gate 都問它能否由前面有限張 cards 作 ℚ-linear combination；若能，就會得到一條 π 滿足的有理係數多項式，與 π transcendental 矛盾。因此這是一個真正無限的 linearly independent family，不是靠「多按幾次仍沒停」冒充證明。最後由 <code>ℚ(π)⊂ℝ</code> 推出 <code>ℝ/ℚ</code> 也無限維。
- **scope label（全課通用）：** 本課主線是 <code>FINITE EXTENSION</code>（<code>[L:K]</code> 有限）；<code>ℝ/ℚ</code> 明示為 <code>INFINITE</code>，且 π 這種 transcendental 不落進任何有限維塔（回扣 Ch5 化圓為方的預告）。
- **evidence 類型：** 左側 basis 是完整描述；右側用 <code>GENERAL ARGUMENT</code>（π transcendental ⇒ powers of π linearly independent）直接支撐無限維。Cardinality argument（若 ℝ/ℚ 有限維則 ℝ 可數）留展開層作第二條證明。
- **兩透鏡收束：** 同一個擴張——對自己是 field（Ch1）、對 base 是 vector space（Ch2）；這個 vector space 可能有限維，也可能無限維。
- **前導 teaser（不在本章解決）：** 為什麼 <code>√2·√2</code>、<code>∛2³</code> 能 reduce 回既有 directions、又為什麼恰好在第 <code>n</code> 次出現 relation？下一章用 minimal polynomial 給出一般 reduction 機制：<code>K(α) ≅ K[x]/(m(x))</code>。
- **壓縮圖卡（全章收束）：** 「擴張＝base 上的 vector space；它的維度就是它比 base 大多少，而有限維是本課的主場。」
- **擁擠限制：** 本節只建立 finite vs infinite 的 scope 與收束。不進 Ch3 的建構、不進 tower。

### transfer（全章一次受控遷移）

換 ambient world、保持機制：<code>F₄</code> 當作 <code>F₂</code> 上的 vector space。<code>F₄ = F₂(α)</code>（<code>α² + α + 1 = 0</code>），basis <code>{1, α}</code>，<code>[F₄:F₂] = 2</code>——與 <code>ℚ(√2)/ℚ</code> 完全同一種座標結構，只是 base 換成 char 2 的 finite field。這既證明「擴張＝vector space」不依賴 char 0，也回收 Ch1「finite field 也是合法 field」並預告 Ch12。

### Ch2 畫面與實作約束

- 所有擴張共用同一 basis-coordinate 視覺（槽／座標軸），維度一律從「幾個獨立方向」讀出，不從平面外觀或虛實讀出。
- 座標軸標「基底方向」；不畫格線距離刻度暗示 metric，不把乘法演成旋轉或縮放動線。
- 係數選擇器畫成 sliders／cards；高次冪按鈕的「開新槽／摺回」要有非色彩線索（槽的出現／併入 + 文字），不只顏色。
- evidence 標籤 <code>EXAMPLE／PROOF DEBT／GENERAL ARGUMENT</code> 可見；Ch2.3 不得把有限次逐冪動畫標成 proof of independence。scope 標籤 <code>FINITE EXTENSION</code>／<code>INFINITE</code>／<code>CHAR 2</code> 持續顯示。
- 動態 readout（目前元素座標、維度、基底列表）隨操作即時重算，可重設；<code>aria-live</code> 播報維度與摺回事件。
- 鍵盤可完成核心探索，focus 可見。

### Ch2 完成驗收

學習者離開本章後應能：

1. 把 Ch1 留下的「造一個裝下 √2 的世界」具體化成 <code>ℚ(√2) = {a+b√2}</code>，並說明它仍是 field（可除）。
2. 用「base 上有幾個獨立方向」解釋 <code>[L:K]</code>，並對 <code>ℂ/ℝ</code>、<code>ℚ(√2)/ℚ</code> 給出維度 2。
3. 在 <code>ℚ(∛2)/ℚ</code> 的受控案例中，區分兩件事：<code>α³=2</code> 顯示第三次冪能摺回；<code>x³−2</code> irreducible 才保證 <code>1,α,α²</code> 此前確實獨立。能據此說明維度 3，而不是把「三次根」背成通則。
4. 用 <code>1,π,π²,…</code> 不可能出現有限 ℚ-linear relation 說明 <code>ℚ(π)/ℚ</code> 無限維，進而指出 <code>ℝ/ℚ</code> 也無限維；並知道 finite extension 是本課主場。
5. 把同一機制遷移到 <code>F₄/F₂</code>，看出擴張＝vector space 與 char 無關。
6. 說出 Ch2.3 的畫面只展示特定 relation，真正的一般控制物與 independence 證書留給 Ch3 的 minimal polynomial；並且**還不會**在本章用 <code>K[x]/(m)</code> 回答。

若任何一項只能背 <code>[L:K]</code> 的定義或指著 ℂ 平面，卻不能用 basis-coordinate 模型說明維度、或把它接回 Ch1 的 field 透鏡，本章就還不算完成。

---

## Ch3 詳細 storyboard · 加一個根 = 對 minimal polynomial 做 quotient

### 接續 Ch2 的教學

Ch2 在受控例子中讓學生看到高次冪可由 relation 寫回既有 directions（<code>√2·√2 = 2</code>、<code>(∛2)³ = 2</code>），並留下兩個未答問題：**一般 relation 如何治理所有高次冪？** 以及 **維度為什麼等於最低次 relation 的次數？** Ch3 一次回答兩者：根滿足一條 minimal polynomial，而運算就是對它做 reduction。

- **回收 Ch2 的 register 視覺：** Ch2.3 的「α^n 摺回」座標 register 直接沿用，只是本章替它命名為「mod minimal polynomial 的 reduction」。
- **回收 Ch1 的兩個判準：** 「field ⇔ 只有兩個 ideal」「ℤ/n 是 field ⇔ n 是質數」在 3.4 變成「K[x]/(m) 是 field ⇔ m irreducible」——irreducible 正是多項式版的「質數」。
- **回收環課：** <code>K(α) ≅ K[x]/(m)</code> 就是環課 quotient ring 的續集；「加一個根」＝「把多項式環 quotient 掉一個 ideal」。
- **證明 Ch2 的觀察：** 3.2 把「維度＝根的次數」正式接成 <code>deg m = [K(α):K]</code>。
- **為 Ch4 鋪路：** 3.5 造出多個擴張後，自然問「疊起來維度怎麼合併？」→ tower law。

### 擁擠度控管（本章是全課載重最大的一章）

全章只有 **一個** 中心 insight：<strong>加一個根＝對 minimal polynomial 做 quotient 與 reduction，<code>K(α) ≅ K[x]/(m)</code></strong>。其餘四節分別是它的「前置（哪條方程）」「機制（reduction）」「後果（為何是 field）」「一般性（任何 irreducible）」，切成 5 節、每節單一 insight，明確互不搶戲：

| 節 | 單一 insight | 刻意不做（留給哪節） |
|---|---|---|
| 3.1 | 高次冪 reduction＝把 relation 當改寫規則，重新分配到低次 slots | 不命名 minimal polynomial（3.2）；不談 iso（3.3） |
| 3.2 | 那條方程是 minimal polynomial：最小 monic、且 irreducible | 不做 K[x]/(m) iso（3.3）；不證 field（3.4） |
| 3.3 | K(α) ≅ K[x]/(m)：同一套算術，α 與 x 兩種標籤 | 不論可逆性／field（3.4）；不談 tower（Ch4） |
| 3.4 | m irreducible ⇔ 每個非零餘式可逆 ⇔ 是 field（＝質數版判準） | 不做一般性配方（3.5） |
| 3.5 | 任何 irreducible、任何 base 都能用同一配方造根 | 不做 tower law（Ch4） |

### 全章設計句

```text
核心 insight：
「加入一個根 α」不是憑空放進神祕新數，而是把「α 滿足的最小方程 m(x)=0」當成 modulus，對多項式做 reduction mod m。因此 K(α) 與 K[x]/(m) 是同一個世界的兩種標籤；而 m irreducible 這件事，正是讓它成為 field 的原因（多項式版的「質數」）。

學習者原本可能怎麼誤解：
1. 「加一個根」是把某個外來的數硬塞進來，運算規則說不清。
2. 擴張就是「加一個開根號」——以為一定牽涉 √、∛ 這種 radical。
3. 只要把方程 quotient 掉就會得到 field，跟那條方程是不是 irreducible 無關。
4. K[x]/(m) 像 ℤ/n 一樣是「n 格的循環時鐘」，α^n 會轉回 α^0（其實 α^n 等於低次項，不是循環回原點）。

第一個具體問題（直接接 Ch2）：
Ch2 看到 √2·√2 摺回 2、(∛2)³ 摺回 2。到底憑什麼「摺回」、又為什麼恰好在那一冪？

全章主要視覺模型：
「reduction register」——沿用 Ch2 的 n 槽座標（1, α, …, α^{n-1}）；任何高次冪或乘積，反覆用「根的方程」把超出的次數還原進低槽，直到次數 < n。它是「取餘數 mod m」的視覺，不是循環時鐘（α^n 落在低次項，不是轉回 α^0）。

全章保持不變的東西：
「用一條固定方程把高次還原到低次」這個 reduction 機制不變；換根／換 base 只改那條方程與槽數。

主例子的 accidental properties：
- 只用 <code>αⁿ=c</code> 型 relation，縱使換成 ∛2 或增加 reduction 步數，仍會讓每次 replacement 看似只落到單一 slot → 3.1 預設改用 <code>x³−x−1</code>，讓 <code>α³=α+1</code> 同時流入兩個 slots；√2／∛2 只作熟悉的對照。
- 只用 radical 根會暗示「擴張＝加根號」→ 3.5 用 x³−x−1（無 radical 形式）與 F₂ 上的 x²+x+1（finite field）破除。
- 只用 irreducible modulus 會讓「quotient 就是 field」看起來理所當然 → 3.4 用可約的 x²−1 製造 zero divisor 反例。
- 把 modular arithmetic 類比成「時鐘」會暗示 α 的冪具有週期 → 主流程完全不用 clock 隱喻，只保留 quotient、remainder 與 register 語言。

哪個 non-degenerate state 讓角色真正分開：
<code>x³−x−1</code> 世界裡的 <code>α⁴</code>：先由 <code>α³=α+1</code> 得 <code>α⁴=α²+α</code>，結果同時占用多個 basis directions；以及「irreducible x²−2（field）對比可約 x²−1（有 zero divisor、非 field）」這一對。

視覺可能造成的假暗示：
不畫循環 clock face（會誤示 α 有週期 n）；不把乘法演成旋轉。register 的「還原」動線代表代數替換，不代表幾何移動。

evidence 類型：
reduction 一定終止到次數 < n：GENERAL ARGUMENT，以具體 EXAMPLE 呈現。minimal polynomial irreducible：GENERAL ARGUMENT（若可約則 α 滿足更小因式）。iso：GENERAL ARGUMENT（兩種算法逐步吻合），用 EXAMPLE 展示。field：irreducible ⇒ gcd(f,m)=1 ⇒ Bézout 逆元（GENERAL ARGUMENT）；可約 modulus 給 zero divisor WITNESS。

特例 detector 與 course convention 如何持續標示 scope：
minimal polynomial 預設 monic；主線 char 0，但 3.5 明確切到 CHAR 2 的 F₂。標示「IRREDUCIBLE modulus → FIELD」與「REDUCIBLE modulus → 只是 ring」。

正式內容放在哪個展開層：
minimal polynomial 的存在與唯一（division algorithm／K[x] 是 PID）、(m) maximal ⇔ m irreducible、evaluation map K[x]→K(α) 的 kernel = (m)、basis {1,α,…,α^{n-1}} 與 deg m = [K(α):K]、用 extended Euclid 求逆元。

最後如何檢查能否遷移：
換 base 保機制：F₂[x]/(x²+x+1) = F₄（basis {1,α}，α²=α+1）；換成無 radical 的根：ℚ[x]/(x³−x−1)。兩者都用同一配方，證明「加根＝quotient by irreducible」與 radical 形式、characteristic 無關。
```

### 3.1 · 高次冪如何 reduce？

- **衝突／預測（直接接 Ch2）：** 先用熟悉的 <code>α=√2</code> 問 <code>α³</code> 如何 reduce，隨即切到預設的 <code>α³=α+1</code>：高次項不一定「掉回常數」，可能同時重新分配到多個 directions。
- **可操作模型：** 通用 reduction engine。預設輸入 <code>x³−x−1</code> 與 <code>α⁴</code>，逐步套用 <code>α³=α+1</code> 得 <code>α⁴=α²+α</code>；低次 register 即時顯示最後佔用的 coefficients。另可切換 √2／∛2，辨認它們只是同一機制中較簡單的單槽 cases。
- **視覺因果：** 每次「有次數 ≥ 2 的項」就被那條方程替換、併入低槽；動線代表代數替換，不是幾何移動。
- **invariant：** 「用同一條方程把高次還原到低次」不變；變的是輸入多項式。
- **類比（回收 Ch1／環課）：** 這就是 ℤ/n 的「算完取餘數 mod n」，只是 modulus 從整數 n 換成方程 <code>α² − 2</code>。
- **evidence 類型：** reduction 一定停在次數 < n（<code>GENERAL ARGUMENT</code>），用具體 <code>EXAMPLE</code> 展示。
- **符號對應：** 定義關係 <code>α² = 2</code>（即 <code>α² − 2 = 0</code>）＝ reduction rule。
- **壓縮圖卡：** 「Relation 是 reduction rule，不是旋轉週期；它把高次項重新分配到低次 directions。這些 directions 是否獨立，留待 minimal polynomial 判定。」
- **擁擠限制：** 本節只建立「有一條固定方程在做 reduction」。不命名 minimal polynomial、不談唯一性／irreducible（3.2），不提 <code>K[x]/(m)</code>（3.3）。

### 3.2 · 那條方程的「身份證」：minimal polynomial

- **衝突／預測：** α=√2 滿足很多方程（<code>x²−2</code>、<code>x³−2x</code>、<code>x⁴−4</code>、<code>(x²−2)(x−1)</code>…）。哪一條才是「做 reduction 用的那條」？先讓學習者猜「該挑哪一條」。
- **可操作模型：** 「哪條方程在治理？」picker。列出數條 α 滿足的多項式，篩出<strong>最小次數、monic</strong> 的那條 <code>m(x)</code>；示範一個可約候選（如 <code>x³−2x = x(x²−2)</code>）會分解，α 落進較小因式 <code>x²−2</code> → 它不是最小；真正的 minimal <code>x²−2</code> 無法再分解（irreducible）。
- **視覺因果：** 拖進一個可約候選 → 它裂成因式 → α 掉進其中一個更小因式 → 系統指出「還有更小的」；只有 irreducible 的那條停得下來。
- **invariant：** 「最小 monic 且 irreducible」是唯一身份；換根只換這條方程。
- **回收 Ch2：** <code>deg m</code> 正是 Ch2.3 觀察到的維度（√2→2、∛2→3）——正式命名那個伏筆。
- **evidence 類型：** 「若可約則 α 滿足更小因式」＝ <code>GENERAL ARGUMENT</code>。
- **符號對應：** <strong>minimal polynomial <code>m(x)</code></strong>（monic、least degree、irreducible）；<code>deg m</code>。
- **壓縮圖卡：** 「每個 α 有一張唯一身份證：最小的 monic 方程，而且一定 irreducible。」
- **擁擠限制：** 本節只確立 minimal polynomial 這個物件與其 irreducibility。不做 <code>K[x]/(m)</code> iso（3.3）、不證 field（3.4）；存在唯一性的正式證明放展開層。

### 3.3 · 加一個根 = 對 minimal polynomial 做 quotient（全章中心）

- **中心 insight：** 在 <code>K(α)</code> 裡算，就等於拿多項式對 <code>m(x)</code> 做 reduction——<code>K(α) ≅ K[x]/(m(x))</code>。元素＝次數 < n 的多項式（＝ mod m 的餘式），加法乘法都是多項式運算後 reduce mod m。
- **可操作模型：** 「兩種標籤，同一算術」雙欄。左：在 <code>ℚ(√2)</code> 直接算 <code>(a+bα)(c+dα)</code>、用 <code>α²=2</code> 摺回；右：把同一式當多項式 <code>(a+bx)(c+dx)</code> 算，再 <code>mod (x²−2)</code>。兩欄逐步得到<strong>完全相同</strong>的結果——差別只是把 x 叫成 α。
- **視覺因果：** 改任一係數，兩欄同步；「reduce」步驟在兩欄一一對應。
- **invariant：** 兩種標籤永遠給同一答案（iso）。
- **回收環課：** <code>K[x]</code> 是 ring、<code>(m)</code> 是 ideal，quotient 把「差一個 m 的倍數」的多項式視為相同——這正是環課 quotient ring；「加一個根」＝「quotient 掉 <code>(m)</code>」。
- **evidence 類型：** <code>GENERAL ARGUMENT</code>（依建構兩算法必吻合），以 <code>EXAMPLE</code> 呈現。
- **符號對應：** <code>K(α) ≅ K[x]/(m(x))</code>；元素 = <code>{ a₀ + a₁α + … + a_{n-1}α^{n-1} }</code>。
- **壓縮圖卡：** 「加一個根＝把多項式環 quotient 掉它的 minimal polynomial；α 只是 x mod m 的名字。」
- **擁擠限制：** 本節只建立 iso 與「quotient 中的 remainder arithmetic」。可逆性／為何是 field 留 3.4；tower 留 Ch4。

### 3.4 · 為什麼這個 quotient 世界是 field（接回 Ch1 與環課）

- **衝突／預測（回收 Ch1.2）：** Ch1 說「ℤ/n 是 field ⇔ n 是質數」。多項式版會是什麼？先讓學習者猜「<code>K[x]/(m)</code> 什麼時候是 field」。
- **可操作模型：** 「在 quotient 世界裡除」panel。對 irreducible <code>x²−2</code>：任一非零餘式 <code>f</code> 與 <code>m</code> 沒有共同因式（因 m irreducible 且不整除 f）→ 由 Bézout 得 <code>f·g ≡ 1 (mod m)</code>，<code>g</code> 就是逆元。對<strong>可約</strong>的 <code>x²−1 = (x−1)(x+1)</code>：<code>(x−1)(x+1) ≡ 0</code> 出現 zero divisor → 非 field。
- **視覺因果：** 切 irreducible ↔ reducible modulus，同一個「找逆元」操作，一邊成功、一邊卡在 zero divisor。
- **invariant／對應：** 「irreducible ⇔ 每個非零可逆 ⇔ field」對映 Ch1「質數 ⇔ 每個非零可逆 ⇔ field」；irreducible 就是多項式版的質數。
- **回收：** Ch1.3「field ⇔ 只有兩個 ideal」與環課 Ch16「<code>R/M</code> field ⇔ M maximal」——這裡 <code>(m)</code> maximal ⇔ m irreducible。
- **evidence 類型：** irreducible ⇒ 逆元存在＝<code>GENERAL ARGUMENT</code>（Bézout）；reducible → zero divisor <code>WITNESS</code>。
- **符號對應：** <code>(m)</code> maximal ⇔ <code>m</code> irreducible ⇒ <code>K[x]/(m)</code> 是 field。
- **壓縮圖卡：** 「Quotient 世界是不是 field，看 modulus 是不是 irreducible——就像 ℤ/n 看 n 是不是質數。」
- **擁擠限制：** 本節只建立「irreducible ⇒ field」與質數類比。一般性配方留 3.5；tower 留 Ch4。

### 3.5 · 一個配方，任何根都能造（一般性與遷移）

- **一般性 insight：** 這個配方對<strong>任何</strong> base field 上的<strong>任何</strong> irreducible polynomial 都成立——給我一條 irreducible 方程，我就交給你一個含它的根的 field，不需要 radical 形式、不限 characteristic。
- **可操作模型：** 「造根機」。選一條 irreducible modulus 與 base：
  - <code>ℚ[x]/(x³−x−1)</code>：一個沒有漂亮 radical 形式的根，照樣造得出來。
  - <code>F₂[x]/(x²+x+1) = F₄</code>：char 2 的 finite field，basis <code>{1, α}</code>、<code>α² = α+1</code>。
  機器輸出 basis <code>{1,α,…,α^{n-1}}</code>、維度 <code>= deg m</code>、並確認是 field。
- **回收與遷移：** F₄ 正是 Ch2.4 只用「斷言」提過的 <code>F₄/F₂</code>——現在<strong>真的造出來</strong>；也回收 Ch1 的 Fp。
- **evidence 類型：** 跨 base 的 <code>EXAMPLE</code> 建構 + 一般宣稱的 <code>GENERAL ARGUMENT</code>。
- **符號對應：** <code>K[x]/(m)</code> 為 universal construction；<code>[K[x]/(m) : K] = deg m</code>。
- **前導 teaser（不在本章解決）：** 現在能一次造一個擴張；把它們<strong>疊起來</strong>（ℚ → ℚ(√2) → ℚ(√2,√3)）時，維度怎麼合併？下一章：tower law，維度相乘。
- **壓縮圖卡（全章收束）：** 「加一個根＝拿 minimal polynomial 當 modulus 做 quotient；只要方程 irreducible，就得到一個 field——radical 與否、char 幾都一樣。」
- **擁擠限制：** 本節只建立一般性與跨 base 遷移。tower law（Ch4）不在此做。

### transfer（全章一次受控遷移）

換 base 保機制：<code>F₂[x]/(x²+x+1) = F₄</code>（char 2），與 <code>ℚ[x]/(x²−2) = ℚ(√2)</code> 用完全同一配方——證明「加根＝quotient by irreducible」與 characteristic 無關；並換成無 radical 的 <code>ℚ[x]/(x³−x−1)</code>，證明與 radical 形式無關。兩個遷移都回收前面（Ch1 Fp、Ch2.4 F₄）並收束到同一機制。

### Ch3 畫面與實作約束

- 沿用 Ch2 的 reduction register（n 槽），本章替它命名為「reduce mod m」；<strong>不畫循環 clock face</strong>、不把乘法演成旋轉，避免暗示 α 有週期。
- reduction 逐步可步進、可重播；每步只顯示「用哪條方程、替換了哪一項」，非色彩線索標示「新併入的低槽」。
- 3.3 雙欄逐步同步；3.4 的 irreducible／reducible 切換要讓「成功找逆元」與「撞到 zero divisor」有明確、非色彩區分。
- scope 標籤：<code>MONIC minimal polynomial</code>、<code>IRREDUCIBLE → FIELD</code>／<code>REDUCIBLE → 只是 ring</code>、3.5 的 <code>CHAR 2</code>。
- evidence 標籤 <code>EXAMPLE／GENERAL ARGUMENT／WITNESS</code> 可見；<code>aria-live</code> 播報每步 reduction 與最終餘式。
- 鍵盤可完成核心探索，focus 可見。

### Ch3 完成驗收

學習者離開本章後應能：

1. 回答 Ch2 的懸念：高次冪摺回，是因為根滿足 <code>m(α)=0</code>；摺回＝reduce mod m。
2. 說出 minimal polynomial 是「最小 monic、irreducible」的那條方程，並知道 <code>deg m</code> 就是 Ch2 的維度。
3. 用「同一套算術、α 與 x 兩種標籤」解釋 <code>K(α) ≅ K[x]/(m)</code>，並指出這就是環課 quotient by <code>(m)</code>。
4. 用「m irreducible ⇔ 每個非零可逆」說明 quotient 世界為何是 field，並對映 Ch1「ℤ/n field ⇔ n 質數」；能用可約 modulus 舉出 zero divisor 反例。
5. 用同一配方在 <code>F₂</code> 上造出 <code>F₄</code>、在 ℚ 上造出 <code>x³−x−1</code> 的根，看出擴張不必是 radical、與 char 無關。
6. 說出「疊起來維度怎麼合併」是留給 Ch4 的問題，而**還不會**在本章做 tower law。

若任何一項只能背 <code>K(α) ≅ K[x]/(m)</code> 這行字，卻不能用 reduction register 演一次摺回、或說不出 irreducible 為何對應 field，本章就還不算完成。

---

## Ch4 詳細 storyboard · 塔的維度會相乘

### 接續 Ch3 的教學

Ch3.5 收在一個明確的下一步：現在能用 <code>K[x]/(m)</code> 一次造一個擴張，把它們<strong>疊起來</strong>（<code>ℚ → ℚ(√2) → ℚ(√2, ∛2)</code>）時，維度怎麼合併？Ch4 回答：<strong>相乘，不是相加</strong>。

- **回收 Ch3：** 塔的每一層都是 Ch3 的造根機（一個 <code>K[x]/(m)</code>）。
- **回收 Ch2：** 「大 basis ＝ 兩層 basis 的乘積」直接用 Ch2 的 basis／維度語言；grid 的每格是一個基底乘積。
- **回收 Ch2.3：** ∛2 的次數 3 在 4.3 用來說明「3 塞不進 2 的冪的世界」。
- **為 Ch5 鋪路：** 4.3 的「子擴張 degree 整除塔高」提供的是單向 rejection test；Ch5 用它的逆否命題擋下不可作圖目標，不把 2 的冪當充分條件。

### 擁擠度控管（本章刻意較輕，是 Ch3 後的喘息章）

全章只有 **一個** 概念：<strong>維度沿塔相乘 <code>[L:F]=[L:K][K:F]</code></strong>。切成 3 節，各一個清晰 insight，不硬拆也不灌水：

| 節 | 單一 insight | 刻意不做（留給哪節） |
|---|---|---|
| 4.1 | 疊兩層，總維度是<strong>相乘</strong>；大 basis ＝ 兩層 basis 的乘積 grid | 不談「新不新」的相對次數（4.2）；不談整除（4.3） |
| 4.2 | 每層乘的是「相對於正下方那層」的次數；加已在裡面的東西只乘 1 | 不做整除推論（4.3） |
| 4.3 | 推論：membership ⇒ degree 整除塔高；不整除可排除，整除不能證明 membership | 不做 constructibility 本體（Ch5） |

不設第 4 節：三節已把「相乘 → 相對次數 → 整除」講完，再多會重複；transfer 以 callout 併入，不獨立成節。

### 全章設計句

```text
核心 insight：
把兩個擴張疊成一座塔，總維度是兩層維度的乘積 [L:F]=[L:K][K:F]，因為大 field 的一組基底恰好是「兩層基底的所有乘積」。而每一層乘的是「相對於正下方那層」的次數；一個子擴張的次數必須整除整座塔的高度。

學習者原本可能怎麼誤解：
1. 維度會「相加」（因為 2+2 剛好也等於 4，被巧合騙過）。
2. 只要再 adjoin 一個符號，維度就一定再乘上那個次數——即使那個東西其實已經在裡面。
3. 塔裡什麼次數的元素都能有。
4. 只要 degree 整除塔高，元素就一定住在該 field 裡（把 necessary constraint 誤當 membership certificate）。

第一個具體問題（直接接 Ch3）：
把 ℚ(√2) 再疊上 ∛2 得到 ℚ(√2, ∛2)，總維度是 2+3=5 還是 2×3=6？

全章主要視覺模型：
「basis grid」——列 = 下層 basis（如 {1, √2}），行 = 上層相對 basis（如 {1, ∛2, ∛4}），每一格 = 兩者乘積（1, ∛2, ∛4, √2, √2∛2, √2∛4）。格子總數 = 列 × 行 = 總維度。grid 的「面積＝乘積」是真實對應（不是隱喻）。

全章保持不變的東西：
「大 basis ＝ 兩層 basis 的乘積」不變；改變的是每層的次數與是否真的帶進新方向。

主例子的 accidental properties：
- 2×2=4 剛好等於 2+2，會讓「相乘 vs 相加」分不出來 → 主例改用 2×3=6（≠5）的塔。
- 只用 √ 類根會讓一切看似次數 2 → 4.3 用 ∛2（次數 3）與整除連起來。
- grid 的矩形外觀可能被誤讀成有距離/度量 → 每格只標基底乘積，面積僅代表「格數＝乘積」的組合意義。

哪個 non-degenerate state 讓角色真正分開：
2×3 的塔（乘積 6 ≠ 和 5）；「加 √8（已在 ℚ(√2) 內，×1 collapse）對比加 √3（真的新，×2）」；以及 4.3 的 √2 / i 對照——兩者 degree 都是 2、都通過 2∣4，但只有 √2 在 L=ℚ(√2,√3) 中。

視覺可能造成的假暗示：
grid「格數＝乘積」是真對應，但不得暗示格子間有距離/角度；上層次數是相對於「中間 field」而非最底層——4.2 要把這點畫出來。

evidence 類型：
「乘積 grid 張成整個上層 field」＝ GENERAL ARGUMENT，用 EXAMPLE 呈現。「若 α∈L，則子擴張 degree 整除塔高」＝ GENERAL ARGUMENT；i 的 degree 2 通過 2∣4 卻不在 real field L ＝ WITNESS（逆向 implication 失敗）。

特例 detector 與 course convention 如何持續標示 scope：
相對次數一律標明「over 正下方那層」；transfer 換 CHAR 2 的 finite-field 塔。

正式內容放在哪個展開層：
乘積基底確為基底（上層基底需 over 中間 field 獨立）、相對次數、deg_K(α)=[K(α):K] 與整除、以及「上層次數是 over 中間 field」的細節。

最後如何檢查能否遷移：
finite-field 塔 F₂ ⊂ F₄ ⊂ F₁₆（2×2=4=[F₁₆:F₂]），且 F₈（次數 3）因 3∤4 進不了 F₁₆——與 ∛2 進不了 2 的冪世界同構。
```

### 4.1 · 疊起來，維度是相乘不是相加

- **衝突／預測（直接接 Ch3）：** 把 ℚ(√2) 再疊上 ∛2。總維度是 <strong>2+3=5</strong> 還是 <strong>2×3=6</strong>？先讓學習者下注（刻意用 2×3，避免 2×2=4 的巧合）。
- **可操作模型：** basis grid。列＝下層 basis <code>{1, √2}</code>，行＝上層 basis <code>{1, ∛2, ∛4}</code>，每格自動填入乘積。切換塔（(2,3)、(2,2)、(3,2)）看 grid 改形狀、格數＝列×行。
- **視覺因果：** 改任一層的次數 → grid 的行或列數變 → 總格數（維度）＝乘積。相加會對不上格數。
- **invariant：** 「總維度＝格數＝兩層次數相乘」不變。
- **evidence 類型：** grid 張成整個上層 field ＝ <code>GENERAL ARGUMENT</code>，以 <code>EXAMPLE</code>（列出 6 個基底乘積）呈現。
- **符號對應：** <code>[L:F] = [L:K][K:F]</code>；big basis ＝ <code>{ b_i · c_j }</code>。
- **壓縮圖卡：** 「疊一座塔，維度相乘——因為大 basis 是兩層 basis 的所有乘積。」
- **擁擠限制：** 本節只建立「相乘＋乘積 grid」。不談「新不新」的相對次數（4.2）、不談整除（4.3）。

### 4.2 · 每層乘的是「相對於下一層」的次數

- **衝突／預測：** 在 ℚ(√2) 上再 adjoin <code>√8</code>。維度會變成 2×2=4 嗎？先猜。（陷阱：<code>√8 = 2√2</code> 其實已在 ℚ(√2) 內。）
- **可操作模型：** 上層根切換器。切「<code>√8</code>（已在裡面）」→ 上層相對 basis 只有 <code>{1}</code>，grid 塌成 2×1，總維度仍是 2（×1）；切「<code>√3</code>（真的新）」→ 相對 basis <code>{1, √3}</code>，grid 2×2＝4。
- **視覺因果：** 上層是否帶進新方向，決定該層乘 1 還是乘 2；相對次數是<strong>相對於正下方那層</strong>，不是相對於 ℚ。
- **invariant：** 「每層乘它自己的相對次數」不變；相對次數＝1 代表沒帶進新東西。
- **evidence 類型：** <code>√8 = 2√2 ∈ ℚ(√2)</code> 是 <code>WITNESS</code>（該層 collapse）。
- **符號對應：** <code>[ℚ(√2, √8) : ℚ(√2)] = 1</code> vs <code>[ℚ(√2, √3) : ℚ(√2)] = 2</code>；相對次數 over 中間 field。
- **壓縮圖卡：** 「塔的每一層，乘的是它相對於正下方那層的次數；加一個已經在裡面的東西，只乘 1。」
- **擁擠限制：** 本節只釐清相對次數與 collapse。整除推論留 4.3。

### 4.3 · 整除是排除器，不是 membership certificate

- **衝突／預測：** <code>i</code> 與 <code>√2</code> 的 degree 都是 2，而且 2∣4。這是否足以證明兩者都在 <code>L=ℚ(√2,√3)</code>？答案否：<code>L⊂ℝ</code>，所以 i 不在。
- **可操作模型：** necessary membership filter。切換已知 members（q、√2、√3、√6、√2+√3）與 outsiders（i、∛2），畫面分成兩列：degree divisibility test 與 separate membership evidence。<code>i</code> 顯示「PASS 2∣4，但由 L⊂ℝ 判 OUTSIDE」；<code>∛2</code> 顯示「BLOCKED 3∤4」。
- **視覺因果：** 只有已知 <code>α∈L</code> 時，<code>ℚ⊂ℚ(α)⊂L</code> 才是一座合法 tower，因而推出 divisibility。若只知道 degree，畫面不得先把 <code>ℚ(α)</code> 接成中間層；outsider 使用斷裂的 inclusion edge。
- **invariant：** <code>α∈L ⇒ deg_K(α)∣[L:K]</code>；converse 不成立。
- **前導 teaser（不在本章解決）：** 因此 <code>∛2</code>（次數 3）進不了任何「維度是 2 的冪」的世界。下一章：尺規作圖只造得出<strong>維度 2 的冪</strong>的塔，所以倍立方（∛2）不可能——<em>constructibility</em>。
- **evidence 類型：** 正向 divisibility ＝ <code>GENERAL ARGUMENT</code>；逆向失敗＝<code>WITNESS</code>（i degree 2 但 i∉L，因 L⊂ℝ）。
- **符號對應：** <code>α∈L ⇒ deg_K(α) ∣ [L:K]</code>；converse false。
- **壓縮圖卡：** 「不整除可以判出局；整除通過不能發 membership 證書。Degree 是 size constraint，不是 field address。」
- **擁擠限制：** 本節只建立整除與其後果。constructibility 本體（尺規步驟 ↔ 二次擴張）留 Ch5。

### transfer（全章一次受控遷移，callout）

換 base 保機制：finite-field 塔 <code>F₂ ⊂ F₄ ⊂ F₁₆</code>，<code>2×2 = 4 = [F₁₆:F₂]</code>——tower law 在 char 2 一樣成立；而 <code>F₈</code>（<code>[F₈:F₂]=3</code>）因 <code>3 ∤ 4</code> 無法坐進 <code>F₁₆</code>，與「∛2 進不了 2 的冪世界」是同一個整除現象。

### Ch4 畫面與實作約束

- basis grid 的「格數＝列×行＝乘積」是主視覺；每格標基底乘積，面積只代表組合計數，不暗示距離/角度。
- 上層次數一律標「over 中間 field」；collapse（×1）要有非色彩線索（行數變 1 + 文字），不只顏色。
- 4.3 的整除檢查必須先標明 membership hypothesis；pass / blocked 與 actual in / outside 分成兩列。Outsider 的 <code>ℚ(α)</code> 不得畫成 L 的中間層，使用斷裂 inclusion edge。
- evidence 標籤 <code>EXAMPLE／WITNESS／GENERAL ARGUMENT</code> 可見。
- 鍵盤可完成核心探索，focus 可見；grid readout 用 <code>aria-live</code>。

### Ch4 完成驗收

學習者離開本章後應能：

1. 用 basis grid 說明 <code>[L:F]=[L:K][K:F]</code> 為何是相乘，並用 2×3=6 反駁「相加」。
2. 指出每層乘的是相對於正下方那層的次數，並用 <code>√8</code> collapse 的例子說明「加已在裡面的東西只乘 1」。
3. 說出正確方向 <code>α∈L ⇒ deg_K(α)∣[L:K]</code>，並解釋為何 degree 3 元素進不了維度 4 的世界。
4. 用 √2 / i 說明 degree 2 都通過 2∣4，但 membership 不同；知道整除是 necessary filter，不是充分證書。
5. 由逆否命題推出「∛2 進不了 2 的冪世界」，並知道這是 Ch5 倍立方不可能的判準來源。
6. 把 tower law 遷移到 finite-field 塔（F₂⊂F₄⊂F₁₆），看出與 char 無關。

若任何一項只能背 <code>[L:F]=[L:K][K:F]</code>，卻不能用 grid 說明「為何相乘」、或說不出相對次數與整除，本章就還不算完成。

---

## Ch5 詳細 storyboard · 尺規作圖 = 二次擴張的塔（招牌章）

### 接續 Ch4 的教學

Ch4.3 已證明：一個元素若住在某個 finite extension 裡，它的 degree 必須整除 ambient field 的維度；所以 degree 3 的 <code>∛2</code> 進不了任何維度為 2 的冪的世界。但 Ch4 只預告、尚未解釋<strong>尺規作圖為何會產生這種世界</strong>。Ch5 補上這一步，然後把 Ch4 的工具收成三大古典不可能：

- **補齊 Ch4.3 的缺口：** 為什麼是 2 的冪？因為<strong>每一步尺規只解到二次</strong>（5.1），疊起來就是二次擴張的塔（5.2）。
- **回收 Ch4 tower law：** 作圖塔 <code>Kₘ</code> 的維度相乘、每個非平凡因子都是 2 → <code>[Kₘ:ℚ]=2ʳ</code>；目標 <code>x</code> 只需滿足 <code>ℚ(x)⊆Kₘ</code>，故 <code>[ℚ(x):ℚ]∣2ʳ</code>。容器與目標不得畫成同一個 field。
- **回收 Ch4.3 整除：** 次數必整除 <code>2ᵐ</code> → 必是 2 的冪；<code>∛2</code>、<code>cos20°</code> 的次數 3 因此出局（5.3）。
- **回收 Ch4.2 相對次數：** line∩line 那種只解到一次的步驟，相對次數是 1，塔沒長高——與 Ch4.2 的 collapse 同一件事。

### 擁擠度控管（招牌章，但只有一條主線）

全章主線只有一句：<strong>每步作圖只解到二次 → 作圖數落在二次擴張的塔 → 維度必是 2 的冪</strong>。切成 4 節，其中「三大不可能」是<strong>同一條判準套三次（repetition，不是三個新 insight）</strong>，而 evidence 護欄自成一節（因為它是「implication 的方向」這個獨立觀念）：

| 節 | 單一 insight | 為何不與別節合併 |
|---|---|---|
| 5.1 | 一步尺規（線∩線、線∩圓、圓∩圓）只解到<strong>二次</strong> → 每步是 degree ≤ 2 的擴張 | 這是「為何 2 的冪」的<strong>局部</strong>機制 |
| 5.2 | 串起來＝二次擴張的塔；先得 ambient degree <code>[Kₘ:ℚ]=2ʳ</code>，再由 <code>ℚ(x)⊆Kₘ</code> 得 target degree 整除它 | 這是<strong>全域</strong>後果（Ch4 tower law 與整除的 callback） |
| 5.3 | 三大不可能：次數 3 或 transcendental，都不是 2 的冪 | 同一判準套 ∛2 / cos20° / π 三次（repetition） |
| 5.4 | 護欄：「2 的冪」是<strong>必要非充分</strong>；deg-3 可反駁，deg-4 未必可作圖 | 這是 implication 方向的獨立觀念，最易被誤解 |

三大不可能不拆成三節（那只是重複套判準）；護欄不併進 5.3（它是不同層次的邏輯觀念，且是本章最易錯的點）。

### 全章設計句

```text
核心 insight：
尺規每一步只能解一次或二次方程，所以每一步最多把 construction field 擴大成一個二次擴張；串起來得到 ambient tower <code>Kₘ</code>，其維度是 2 的冪。能作圖的數 <code>x</code> 住在這座塔裡，故 <code>[ℚ(x):ℚ]</code> 整除 ambient degree、也必是 2 的冪——這是必要條件，倍立方、三等分角、化圓為方都由它擋下。

學習者原本可能怎麼誤解：
1. 尺規「什麼都畫得出來，只是麻煩」。
2. 「不可能」是因為還沒想到聰明的作圖法。
3. 「維度是 2 的冪」既是必要也是充分——看到 4 = 2² 就以為一定作得出來。
4. 三大不可能都是「次數 3」——把 π 的 transcendental 也誤當次數問題。

第一個具體問題（直接接 Ch4）：
Ch4 說尺規只造得出 2ⁿ 的塔。為什麼是 2 的冪、不是 3 的冪或別的？

全章主要視覺模型：
「左幾何 / 右代數」同步——左邊是尺規動作（畫線、畫圓、取交點），右邊同步長出 field 塔。只有真正加入新平方根時才有 <code>[Kᵢ:Kᵢ₋₁]=2</code>；一次方程或二次方程的根早已在目前 field 時只乘 1。塔頂把 <code>ℚ(x)</code> 畫成住在 <code>Kₘ</code> 裡的 pocket，而非把兩者合併。

全章保持不變的東西：
「每步 relative degree ∈ {1,2}」不變；改變的是哪些步真的增加新方向、ambient tower 長多高，以及目標 <code>ℚ(x)</code> 是否佔滿它。

主例子的 accidental properties：
- 只用 ∛2、cos20°（都次數 3）會讓「不可能＝次數 3」定型 → 5.3 一定要放 π（transcendental，不同的失敗模式）。
- 只展示成功的 2 的冪塔，會讓人以為 2 的冪就充分 → 5.4 用 deg-4 卻不可作圖的反例打掉。
- 幾何畫面的距離/長度在這裡「真的有意義」（可作圖長度就是主題），與前幾章「座標只是選值」不同——要說清楚這章的幾何是實義的。

哪個 non-degenerate state 讓角色真正分開：
塔裡混入一個「方程雖可達二次、但根早已在目前 field」的 ×1 狀態，讓「二次方程」與「degree-2 extension」不被畫成同義；並把 <code>ℚ(x)</code> 畫成 <code>Kₘ</code> 的真子 field，使 target degree 與 ambient degree 不會偶然重合。另用 deg-4 不可作圖的反例，讓必要 ≠ 充分。

視覺可能造成的假暗示：
右邊塔的「高度＝維度（乘積）」沿用 Ch4，是真對應；但綠色的塔不代表「一定作得出」——5.4 明確把「necessary」與「proof」分開標示。

evidence 類型：
每步 ≤ 二次、ambient tower → <code>2ʳ</code>、target degree 整除 ambient degree：GENERAL ARGUMENT。次數 3 / transcendental ⇒ 不可作圖：WITNESS（有效反駁）。deg-4 卻不可作圖：WITNESS（證明「2 的冪」的逆命題失敗）。UI 全程標 NECESSARY CONDITION ONLY，綠燈不等於 proof。

特例 detector 與 course convention 如何持續標示 scope：
持續顯示 STRAIGHTEDGE + COMPASS ONLY（只允許線與圓）、NECESSARY CONDITION ONLY。

正式內容放在哪個展開層：
三種交點的方程（線＝一次、圓＝二次）、constructible ⇔ 被某座二次擴張塔包含的完整 iff、<code>ℚ(x)⊆Kₘ</code> 帶來的 divisibility、cos20° 滿足 8x³−6x−1=0 之 irreducibility、∛2 的 x³−2、π 的 transcendental（Lindemann）、以及逆命題反例（x⁴−x−1 的根 deg 4 但不可作圖，完整理由待對稱章）。

最後如何檢查能否遷移：
同一必要條件推廣到正多邊形，但嚴守方向：正 7 邊形需要的 <code>cos(2π/7)</code> degree 3，不是 2 的冪 → 可直接判不可作；正 17 邊形所需 degree 8 只代表「通過必要條件」，不能由此宣告可作。Gauss 的正面 construction 要等 Ch13 用 cyclotomic structure 補足。
```

### 5.1 · 一步尺規，只解到二次

- **衝突／預測（直接接 Ch4）：** Ch4 預告尺規的 construction field 會形成 2 的冪塔。先問：一步尺規（取兩個圖形的交點）最多會解到<strong>幾次</strong>方程？
- **可操作模型：** 交點方程檢視器。切三種基本步驟：
  - <strong>線 ∩ 線</strong>：解一次方程 → degree 1（塔不長高）。
  - <strong>線 ∩ 圓</strong>：把線代入圓，得一條<strong>至多二次</strong>方程 → relative degree ∈ {1,2}。
  - <strong>圓 ∩ 圓</strong>：兩圓相減消去二次項，化成線 ∩ 圓 → relative degree 一樣只可能是 1 或 2。
  左邊畫該步驟的幾何，右邊顯示對應方程的次數。
- **視覺因果：** 選步驟 → 幾何 + equation degree 同步；沒有任何一步超過二次。畫面另外明示「解二次」只給 relative degree ≤ 2，不代表每次必乘 2。
- **invariant：** 「每步 degree ≤ 2」不變。
- **回收 Ch4.2：** 線∩線的 degree 1 ＝ 相對次數 1，那一步塔不長高（同 Ch4.2 collapse）。
- **evidence 類型：** <code>GENERAL ARGUMENT</code>（線＝一次、圓＝二次的代數）。
- **符號對應：** 每步 <code>[Kᵢ:Kᵢ₋₁] ∈ {1, 2}</code>。
- **壓縮圖卡：** 「尺規的極限：一步最多解到二次——所以一步最多把世界擴大成一個二次擴張。」
- **擁擠限制：** 本節只建立「每步 ≤ 二次」的局部事實。串成塔、2 的冪留 5.2；不可能留 5.3。

### 5.2 · 二次塔先限制容器，再限制住在裡面的目標

- **衝突／預測：** 三個作圖步驟中只有兩步真的加入新平方根，ambient construction field 的維度是 8 還是 4？接著追問：目標 <code>x</code> 的 field 是否必須等於整個 ambient field？
- **可操作模型：** 逐步加入「新平方根 ×2」或「無新方向 ×1」，右邊 <code>ℚ=K₀⊆⋯⊆Kₘ</code> 同步長高。塔頂把 <code>ℚ(x)</code> 畫成 <code>Kₘ</code> 內的 pocket；console 分開顯示 <code>AMBIENT [Kₘ:ℚ]=2ʳ</code> 與 <code>TARGET [ℚ(x):ℚ]∣2ʳ</code>。
- **視覺因果：** 第一段由 tower law 把 relative degrees 相乘成 ambient degree；第二段沿 <code>ℚ⊆ℚ(x)⊆Kₘ</code> 再用一次 tower law，讓 target degree 以「因數」而非「等號」接到塔高。
- **invariant：** ambient degree 是 2 的冪；target degree 整除 ambient degree，因此也是 2 的冪，但兩者不必相等。
- **回收 Ch4：** 先回收「塔高相乘」，再回收「子擴張 degree 整除塔高」；這兩件事缺一不可。
- **evidence 類型：** <code>GENERAL ARGUMENT</code>（每層 degree ∈ {1,2} + tower law + divisibility）。
- **符號對應：** constructible <code>x</code> ⇒ 存在 <code>Kₘ∋x</code> 使 <code>[Kₘ:ℚ]=2ʳ</code> ⇒ <code>[ℚ(x):ℚ]∣2ʳ</code>。
- **壓縮圖卡：** 「二次塔先限制容器；整除關係再限制住在裡面的目標。」
- **擁擠限制：** 本節只把局部（5.1）串成「2 的冪」的全域結論。三大不可能留 5.3；必要非充分留 5.4。

### 5.3 · 三大古典不可能（同一判準套三次）

- **衝突／預測：** 倍立方、三等分 60°、化圓為方——哪些做得到？先讓學習者猜（多數會以為只是難）。
- **可操作模型：** 三張「不可能卡」，每張套<strong>同一條</strong>判準（Ch4.3：次數必整除 <code>2ᵐ</code> → 必是 2 的冪）：
  - <strong>倍立方</strong>：需要 <code>∛2</code>，minimal poly <code>x³−2</code>，次數 <strong>3</strong> → 不是 2 的冪 → 不可作。
  - <strong>三等分 60°</strong>：需要 <code>cos20°</code>，滿足 <code>8x³−6x−1=0</code>（irreducible），次數 <strong>3</strong> → 不可作。這一個 witness 足以否定「任意角都有通用尺規三等分法」；不暗示每個特定角都無法三等分。
  - <strong>化圓為方</strong>：需要 <code>√π</code>，但 <code>π</code> 是 <strong>transcendental</strong>，根本不是代數數 → 落不進任何有限塔 → 不可作。
- **視覺因果：** 每張卡把「固定目標 → degree / transcendental → 是否通過必要條件」串起來；前兩張是 degree 3、第三張是完全不同的失敗模式。三等分卡持續標示 60°，不縮寫成所有角。
- **invariant：** 「次數不是 2 的冪（或非代數）⇒ 不可作圖」。
- **evidence 類型：** 每張都是 <code>WITNESS</code>（有效反駁：不是 2 的冪 → 不可作）。
- **符號對應：** <code>x³−2</code>、<code>8x³−6x−1</code>（deg 3）、<code>π</code> transcendental。
- **壓縮圖卡：** 「三大不可能不是難，是次數對不上 2 的冪——π 更是連代數數都不是。」
- **擁擠限制：** 本節只套判準三次。逆命題的陷阱留 5.4。

### 5.4 · 綠燈的陷阱：2 的冪是必要非充分

- **衝突／預測：** 「一個數在 ℚ 上次數是 4 = 2²，那它一定作得出來嗎？」先猜。
- **可操作模型：** 「兩個方向」對照。
  - <strong>有效方向（necessary）：</strong> constructible ⇒ 次數是 2 的冪。逆否：次數不是 2 的冪 ⇒ 不可作——這正是 5.3 用的、有效的。deg-3 的 <code>WITNESS</code> 足以反駁。
  - <strong>無效方向（不充分）：</strong> 次數是 2 的冪 ⇏ constructible。反例：<code>x⁴−x−1</code> 的根，次數 <strong>4 = 2²</strong>，卻<strong>不可作圖</strong>（完整理由要看它的對稱不是「二次塔」，留待對稱章）。
- **視覺因果：** 同一個「次數是 2 的冪？」綠燈，在「反駁不可作」時有效、在「宣稱可作」時<strong>無效</strong>；UI 標 <code>NECESSARY CONDITION ONLY</code>，綠燈旁明示「這不是 proof」。
- **invariant：** implication 只有一個方向成立。
- **evidence 類型：** deg-4 反例 ＝ <code>WITNESS + PROOF DEBT</code>（它能推翻逆命題，但「此實根確實不可作」的 symmetry 證書留 Galois 章）；全程 <code>NECESSARY CONDITION ONLY</code>。
- **符號對應：** constructible ⇒ 2ᵐ（成立）；2ᵐ ⇒ constructible（不成立）。
- **壓縮圖卡：** 「『次數是 2 的冪』能<strong>反駁</strong>可作圖，但不能<strong>證明</strong>可作圖——方向只有一邊。」
- **擁擠限制：** 本節只釐清 implication 方向。完整充分條件（二次塔）與對稱理由留展開層與後續章。

### transfer（全章一次受控遷移，callout）

同一必要條件推廣到其它作圖問題：正 <strong>7</strong> 邊形需要的 <code>cos(2π/7)</code> degree 3，不是 2 的冪 → 不可作。正 <strong>17</strong> 邊形需要的 <code>cos(2π/17)</code> degree 8，故只得到「沒有被必要條件擋下」；它確實可作是 Gauss 的正面結果，但需要 Ch13 的 cyclotomic structure 建出二次塔，不能把綠燈本身當 proof。

### Ch5 畫面與實作約束

- 主視覺是「左幾何 / 右塔」同步；幾何只允許線與圓（<code>STRAIGHTEDGE + COMPASS ONLY</code>），此章的長度/距離是實義的，要與前幾章「座標只是選值」區分。
- 塔沿用 Ch4 grid/tower 語言；line∩line 的 ×1 step 用非色彩線索（不長高 + 文字），不只顏色。
- evidence 標籤 <code>GENERAL ARGUMENT / WITNESS / NECESSARY CONDITION ONLY</code> 全程可見；5.4 的綠燈旁必須有「非 proof」標記。
- 三大不可能卡的第三張（π）要明顯標成「非代數」而非「次數 3」，避免失敗模式被抹平。
- 鍵盤可完成核心探索、focus 可見；動態次數/維度用 <code>aria-live</code>。

### Ch5 完成驗收

學習者離開本章後應能：

1. 說明為什麼尺規只造得出 degree 為 2 的冪的 ambient tower：每步只解到至多二次（線一次、圓二次），真正的新平方根層乘 2，其餘乘 1。
2. 把 ambient field <code>Kₘ</code> 與 target field <code>ℚ(x)</code> 分開，利用 <code>[ℚ(x):ℚ]∣[Kₘ:ℚ]=2ʳ</code> 推出 target degree 也是 2 的冪，而不是直接寫成兩者相等。
3. 用「次數必整除 2ʳ」擋下倍立方與三等分 60°（都次數 3），並說出化圓為方是<strong>不同</strong>的失敗模式（π transcendental）。
4. 清楚分辨：「次數不是 2 的冪 ⇒ 不可作」有效；「次數是 2 的冪 ⇒ 可作」<strong>無效</strong>，並能舉 deg-4 反例。
5. 把判準遷移到正 n 邊形：7 直接被擋下；17 只通過必要條件，真正的正面 construction 留待 cyclotomic 章。

若學習者只會背「三大不可能」的結論、或把綠色「2 的冪」誤當可作圖的證明，本章就還不算完成。

---

## Ch6 詳細 storyboard · 從一個根到完整根系（splitting field / normal / separable）

### 接續 Ch3 與 Ch5 的教學

- **主要承接 Ch3：** Ch3 造出 <code>ℚ(∛2)</code>，但它只裝了 <code>x³−2</code> 三個根中的<strong>一個</strong>——另外兩個 <code>ω∛2</code>、<code>ω²∛2</code> 是複數，不在裡面。本章正面回答「加一個根，會不會把全部根帶進來？」（有時會，有時不會）。
- **次要承接 Ch5.4：** 那個「次數 4 卻不可作圖」的反例，其完整證書要查看 splitting field 的 symmetry。這不表示非-normal extension 完全不能談 automorphism；而是要讓 symmetry 完整反映所有 conjugates 與 degree，必須進入 Galois 舞台。
- **回收 Ch4 tower law：** 造 <code>ℚ(∛2, ω)</code>（splitting field）時，維度 <code>3 × 2 = 6</code> 直接用 Ch4。
- **為 Part III 鋪路：** Ch7 會先對所有 extension 定義 automorphism；Ch8 再比較 non-Galois 與 Galois，看到只有 normal + separable 時 symmetry 數量才填滿 degree。

### 擁擠度控管

核心是一條 construction 線與兩條判準軸：<strong>splitting field</strong>（針對一個 polynomial 補齊根）、<strong>normal</strong>（所有 relevant families 都完整）與 <strong>separable</strong>（conjugates 彼此相異）。切 4 節；6.4 不再把 splitting field、normal、separable 畫成三個獨立 requirements，而以 normal / separable 二軸收束 Galois 舞台：

| 節 | 單一 insight | 份量 |
|---|---|---|
| 6.1 | 加一個根，其它親戚<strong>不一定</strong>跟來（√2 帶來 −√2；∛2 帶不來另兩個複根） | 動機現象 |
| 6.2 | splitting field：一直加根到多項式<strong>完全分解</strong>的最小世界 | 核心構造 |
| 6.3 | normal：任一 irreducible 只要有一個根在裡面，<strong>整個家族</strong>都在——沒有「半個家族」 | 核心定義（Part III 要用） |
| 6.4 | normal 管「到齊」、separable 管「彼此不同」；finite extension 兩者同時成立 ⇔ Galois | 二軸診斷 ＋ Part III 橋 |

separability 的技術 mechanics 仍只做輕量 scope（char p 的 inseparable 放展開層）；主流程新增的不是另一套計算，而是 normal / separable 二軸診斷與 Galois 名稱，因此仍維持一節一個 insight。

### 全章設計句

```text
核心 insight：
加一個根，未必把同一條 minimal polynomial 的其它 roots（conjugates）一起帶進來。把某個 polynomial 的全部根裝進來的最小世界叫 splitting field；而「任一 K-irreducible 只要有一個根在裡面、整個家族就都在」叫 normal。Separable 是不同問題：這些 conjugates 是否彼此相異。對 finite extension，normal + separable 才是 Galois，讓 symmetry 能完整對應 degree。

學習者原本可能怎麼誤解：
1. 加一個根就等於把那條方程的所有根都加進來了。
2. 所有擴張都「對稱漂亮」、都含全部根。
3. 「splitting field」只是「再多加幾個符號」，沒有結構意義。
4. splitting field、normal、separable 是三個互不相關的勾勾（其實 finite splitting field 是 normal 的 certificate；真正獨立的兩軸是 normal 與 separable）。
5. 有 automorphism 就一定 Galois，或非 Galois 就不能談 symmetry（兩者都錯；Galois 控制的是 symmetry 是否完整填滿 degree）。

第一個具體問題（直接接 Ch3）：
Ch3 造的 ℚ(∛2) 裝了 x³−2 的哪些根？（只有實根 ∛2；另兩個複根 ω∛2、ω²∛2 不在。）

全章主要視覺模型：
「複平面上的根家族」——先把一條 minimal polynomial 的所有根畫在複平面，看 extension 收進哪些；6.4 再轉成二軸 gate：normal＝conjugates 是否到齊，separable＝是否 distinct，兩道門合併為 Galois。點亮代表 membership，不代表 field 是平面區域。

全章保持不變的東西：
根本身（複平面位置）不變；改變的是「哪個擴張把哪些根納入」。

主例子的 accidental properties：
- 只用 √2（兩根都實、都在 ℚ(√2) 內）會讓「一根帶全家」看似必然 → 主例用 ∛2（帶不來複根）打破。
- 複平面位置是實義的（根真的是那些複數），但「在/不在擴張裡」是 field 成員關係，不是平面區域——ℚ(∛2) 不是「整條實軸」。
- 每個 degree-2 擴張其實都 normal（另一根＝K 內的和減去這根），別把它當一般現象 → 用 degree-3 的 ∛2 顯示失敗。

哪個 non-degenerate state 讓角色真正分開：
ℚ(∛2)（separable 但 NOT normal）對比 ℚ(∛2, ω)（normal + separable = Galois）；讓兩條軸不會因 char 0 的「separable 免費」而視覺上黏成同一件事。

視覺可能造成的假暗示：
複平面幾何是實義（根的位置），但不得暗示「擴張＝平面上某區域」；點亮/熄滅代表 field 成員關係。

evidence 類型：
ℚ(∛2) 缺兩根：WITNESS（指出一個不在裡面的 sibling，且它是複數而 ℚ(∛2)⊂ℝ）。x³−2 builder 是 EXAMPLE，有限次逐根加入是 GENERAL RECIPE。ℚ(∛2) NOT normal：WITNESS；兩個正面 normal cases 由「finite splitting field ⇒ normal」提供 GENERAL CERTIFICATE，不靠單一家族抽查。char 0／finite fields separable：GENERAL ARGUMENT（perfect field）。

特例 detector 與 course convention 如何持續標示 scope：
主線標 CHAR 0 / FINITE（PERFECT），separable 免費；degree-2 always normal 當已知小事實但標明是特例。

正式內容放在哪個展開層：
splitting field 的存在與唯一（up to iso）、normal ⇔ 某 polynomial 的 splitting field（finite extension）、degree-2 always normal、separable extension 的逐元素定義、gcd(f,f′) 與 perfect field、char p inseparable 例（如 𝔽_p(t) 上 xᵖ−t）、Galois ⇔ normal + separable、[ℚ(∛2,ω):ℚ]=6。

最後如何檢查能否遷移：
複根版：x²+1 的兩根 i、−i 都在 ℚ(i)，且 ℚ(i) 是它的 splitting field → normal。Finite-field 版：F_{pⁿ} 是 x^(pⁿ)−x 的 splitting field，且 finite fields perfect → normal + separable = Galois over F_p。
```

### 6.1 · 加一個根，另一個親戚不一定跟來

- **衝突／預測（直接接 Ch3）：** Ch3 造的 <code>ℚ(∛2)</code> 裝了 <code>x³−2</code> 的幾個根？先猜（1／2／3）。
- **可操作模型：** 複平面根家族。切多項式（<code>x²−2</code>、<code>x³−2</code>、<code>x²+1</code>），畫出全部根；再對「只加一個根的世界」把在裡面的根點亮：
  - <code>x²−2</code> → ℚ(√2) 亮兩顆（±√2 都實、都在）。
  - <code>x³−2</code> → ℚ(∛2) 只亮實軸那一顆；<code>ω∛2</code>、<code>ω²∛2</code> 是複數，<code>ℚ(∛2)⊂ℝ</code> → 不在。
  - <code>x²+1</code> → ℚ(i) 亮兩顆（i、−i）。
- **視覺因果：** 同樣「只加一個根」，有的把家族補齊、有的只補半個——差別看得見。
- **invariant：** 根的位置不變；變的是哪些被納入。
- **evidence 類型：** <code>WITNESS</code>（ℚ(∛2) 少了一顆具體的複根 sibling）。
- **符號對應：** 一個根的 <code>K(α)</code> 未必含 <code>m(x)</code> 的全部根。
- **壓縮圖卡：** 「加一個根，未必把它的親戚一起帶來——∛2 進來了，另兩個複根還在門外。」
- **擁擠限制：** 本節只呈現「不一定帶全家」的現象。splitting field 留 6.2、normal 留 6.3。

### 6.2 · splitting field：把全部根裝進來的最小世界

- **衝突／預測：** 想把 <code>x³−2</code> 的三根全裝進來，最少還要加什麼？先猜（再加一個實數／加 ω／加無窮多東西）。
- **可操作模型：** 「加到完全分解」builder。從 ℚ(∛2) 起，<code>x³−2 = (x−∛2)(x²+∛2·x+∛4)</code>；剩下的二次在 ℚ(∛2) 上仍 irreducible → 再 adjoin <code>ω</code>（或第二個根）→ 完全分解成三個一次因式。progress bar 顯示「已分解幾個因式」，複平面三顆全亮。
- **視覺因果：** 每加一個根，多一個一次因式；到全部一次為止，就是 splitting field。
- **回收 Ch4：** <code>[ℚ(∛2, ω):ℚ] = 3 × 2 = 6</code>（tower law）。
- **evidence 類型：** builder 是 <code>EXAMPLE</code>（x³−2）；「對 finite-degree 的剩餘因式逐根加入必終止」是 <code>GENERAL RECIPE</code>。
- **符號對應：** splitting field ＝ 使 <code>f</code> 分解成一次因式的最小擴張；<code>[ℚ(∛2,ω):ℚ]=6</code>。
- **壓縮圖卡：** 「splitting field：一直加根，加到多項式完全散成一次因式為止的最小世界。」
- **擁擠限制：** 本節只建立 splitting field 構造。normal 的一般定義留 6.3。

### 6.3 · normal：進來一個親戚，全家都得進來

- **衝突／預測：** <code>ℚ(∛2)</code> 裝了 ∛2 卻沒裝它的兄弟；<code>ℚ(∛2, ω)</code> 三兄弟都在。哪個「不會只裝半個家族」？先猜。
- **可操作模型：** normal detector。對一個擴張，逐一檢查「有根在裡面的 irreducible，是否整個家族都在」：
  - <code>ℚ(∛2)</code>：<code>x³−2</code> 有根 ∛2，卻不分解（缺兩複根）→ 半個家族 → <strong>NOT normal</strong>（<code>WITNESS</code>）。
  - <code>ℚ(√2)</code>、<code>ℚ(∛2, ω)</code>：畫面各顯示一個完整 family；真正的 universal certificate 是它們分別為 <code>x²−2</code>、<code>x³−2</code> 的 splitting fields，而 finite splitting field ⇒ normal。
- **視覺因果：** 複平面上，normal ⇔ 每個家族要嘛全亮要嘛全暗，沒有「半亮」。
- **invariant：** normal ＝「任一 irreducible 有一根在內 ⇒ 全部根在內」。
- **等價（點到、細節展開層）：** 有限擴張 normal ⇔ 它是某多項式的 splitting field。
- **evidence 類型：** ℚ(∛2) NOT normal ＝ <code>WITNESS</code>；兩個 normal 正例＝<code>GENERAL CERTIFICATE</code>（finite splitting field ⇒ normal），不是 finite sample scan。
- **符號對應：** normal extension；normal ⇔ splitting field（finite）。
- **壓縮圖卡：** 「normal ＝ 沒有半個家族：只要一個親戚進來，全家都在。」
- **擁擠限制：** 本節只建立 normal 定義與 splitting-field 等價。separability 留 6.4。

### 6.4 · 兩道不同的門：normal + separable = Galois

- **單一 insight：** normal 與 separable 回答不同問題，finite extension 必須兩者同時成立才是 Galois。Normal 管 completeness；separable 管 distinctness。
- **衝突／預測：** <code>ℚ(∛2)/ℚ</code> 的三個 conjugates 彼此相異，是否已足以 Galois？答案否：它 separable，但缺兩個 conjugates，所以不 normal。
- **可操作模型：** 二軸 gate。切換 <code>ℚ(∛2)/ℚ</code>、<code>ℚ(∛2,ω)/ℚ</code>、<code>F₈/F₂</code>；左門 normal（到齊／缺席），右門 separable（distinct／repeated），合流 readout 顯示 GALOIS / NOT GALOIS。
- **non-degenerate state：** <code>ℚ(∛2)/ℚ</code> 固定為「separable PASS、normal BLOCKED」，直接證明兩軸不能互代；另以 F₈/F₂ transfer 到 finite fields。
- **evidence 類型：** char 0／finite fields separable 是 <code>GENERAL ARGUMENT</code>（perfect fields）；normal 狀態回收 6.3 的 witness / splitting-field certificate。
- **收束＋Part III 橋：** Automorphism 對 non-Galois extension 仍可定義；Galois 的作用是讓 conjugates 都在、又彼此相異，因此 Ch8 的 symmetry count 才會填滿 extension degree。
- **符號對應：** separable extension、perfect field、Galois ⇔ normal + separable（finite）。
- **壓縮圖卡：** 「normal 管到齊；separable 管不同。兩道門都過，才是 Galois。」
- **擁擠限制：** 本節只建立二軸與 Galois 名稱。automorphism 如何作用留 Ch7，數量等於 degree 留 Ch8；inseparable mechanics 留展開層。

### transfer（全章一次受控遷移，callout）

複根版：<code>x²+1</code> 的兩根 <code>i、−i</code> 都在 <code>ℚ(i)</code>，且它是 splitting field → normal。Finite-field 版：<code>F_{pⁿ}</code> 是 <code>x^(pⁿ)−x</code> 的 splitting field，且 finite fields perfect，所以對 <code>F_p</code> 是 Galois——回收 Ch1/Ch3，預告 Ch12。

### Ch6 畫面與實作約束

- 主視覺是複平面根家族；「在/不在擴張裡」以點亮/熄滅表示 field 成員關係，不暗示擴張＝平面區域。
- normal 的「半個家族」要有非色彩線索（半亮 + 文字「缺 2 顆」），不只顏色。
- splitting field builder 的「因式分解進度」要能步進、重播；<code>ℚ(∛2)⊂ℝ</code> 這類「複根不在實擴張」用文字明說。
- evidence 標籤 <code>EXAMPLE / WITNESS / GENERAL RECIPE / GENERAL CERTIFICATE</code> 可見；scope 標籤 <code>FINITE EXTENSION / CHAR 0 / FINITE FIELDS (PERFECT)</code> 持續顯示。
- 鍵盤可完成核心探索、focus 可見；動態根計數用 <code>aria-live</code>。

### Ch6 完成驗收

學習者離開本章後應能：

1. 說明「加一個根未必帶全家」，並以 <code>ℚ(∛2)</code> 只含一個實根、缺兩複根為例。
2. 描述 splitting field 是「加根到完全分解」的最小世界，並用 tower law 算 <code>[ℚ(∛2,ω):ℚ]=6</code>。
3. 用「沒有半個 family」描述 normal，並區分負面 witness 與正面 splitting-field certificate：看完一個 family 不能自行證明 universal claim。
4. 分開 normal（conjugates 到齊）與 separable（conjugates distinct），用 <code>ℚ(∛2)/ℚ</code> 說明 separable 不推出 normal。
5. 說出 finite extension 中 Galois ⇔ normal + separable；automorphism 在 non-Galois case 仍可定義，但 symmetry count 未必填滿 degree。

若學習者把「加一個根」誤當「加全部根」、或說不出 ℚ(∛2) 為何非 normal，本章就還不算完成。

---

## 章數與範圍決策

採 **14 章**。理由與環課同一原則：章數不是完成度指標，而是「每章一個不可再合併的大概念」。（初稿曾把 finite fields 與 cyclotomic fields 併為一章，密度稽核判定兩者機制不同、各自一整章份量，故拆為 Ch12、Ch13。）

- Part 0（Ch1）建立 field 與「世界封閉不了」的動機。
- Part I（Ch2–4）把擴張變成 vector space、把 adjoining root 接回環課 quotient、把維度接成 tower。
- Part II（Ch5–6）給幾何招牌（constructibility），再把完整根系拆成 normal／separable 兩軸並建立 Galois 舞台。
- Part III（Ch7–9）建立對稱、對稱計數、與全課中心 correspondence。
- Part IV（Ch10–11）把可解性化成群論問題，並在五次收尾回扣群論。
- Part V（Ch12–14）先各用一整章走 finite fields 與 cyclotomic fields 兩族透明世界，再以診斷 capstone 收束。

**刻意不納入主線（避免破壞單一主軸或超出前置）：**

- infinite Galois theory、Krull topology：需要拓撲，超出範圍。
- inseparable extension 的完整處理：只給 scope label，主線維持 perfect field。
- transcendence degree、一般 transcendental extension：只在化圓為方點到。
- Galois cohomology、Kummer theory 的一般化：留待後續課程，本課只用到具體 radical tower。
- module theory 與 PID 結構定理：是另一條連接線（可作為獨立短課），不是 Galois 前置，不塞進本課。

---

## 逐章交付與驗收方式

沿用 `ABSTRACT_ALGEBRA_REWORK_LOOP.md` 的單章 checkpoint：每章實作前先依 `LEARNING_DESIGN.md` §12 交付模板寫出完整 storyboard（核心 insight、學習者誤解、第一個具體問題、一般機制、主例 accidental-property audit、non-degenerate state、主視覺模型、假暗示風險、可操作變數、不變量、預測→回饋→壓縮、evidence 類型、scope label、formal layer、transfer），通過內容審查與 1920×1080 / 鍵盤 / 非色彩 / reduced-motion 驗收後才進下一章。

本文件已把每章收斂到單一 insight、擁擠限制、符號對應與招牌章（Ch5、Ch9、Ch11）的關鍵護欄；其餘各章的逐節 storyboard 於各自 checkpoint 依上述模板展開，不在本規畫階段一次寫死。

### 全課 accidental-property audit 摘要（各章實作時再逐項展開）

- **只用 `ℚ/ℝ/ℂ`** 會讓學習者以為 field 都是 char 0、無限、且「多加就有解」——Ch1 起就用 `Fp` 對照。
- **只用二次擴張**（`√2`、`i`）會讓維度看起來永遠是 2；只用 `αⁿ=c` 又會讓 reduction 看似永遠落回單一槽——Ch2 用 `∛2` 破除固定維度，Ch3 再用 `x³−x−1` 的多槽 reduction 破除更隱微的錯覺。
- **只用 abelian Galois group**（如 `ℤ/2×ℤ/2`）會讓「可解」看起來理所當然——Ch8 起用 `S₃`、Ch11 用 `S₅` 製造非交換與不可解的對照。
- **constructibility 的綠燈** 容易被誤讀成充分條件——Ch5 用 `NECESSARY CONDITION ONLY` 與 degree-3 的 `WITNESS` 明示 evidence 強度。
- **automorphism 的視覺** 若允許任意根配對，會暗示不存在的自由——Ch7 用 decisive witness 限制在同一 minimal polynomial 的根集合內。

---

## 一句話總結

> 群論教「對稱本身」，環論教「兩種 operation 如何共存並被 quotient 壓平」；體與 Galois 把兩者接起來——擴張造出裝得下根的世界，環課的 quotient 造出這些世界，而群論的對稱決定了方程能不能被開方解出。
