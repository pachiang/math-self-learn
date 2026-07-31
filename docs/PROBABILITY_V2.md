# Probability v2 課程藍圖

本文件是機率課重建的內容地圖。它描述要建立的 mental models，不代表必須維持固定章數。實作時若一章承擔太多 insight，應繼續拆分。

舊版 `prob-ch*` 僅視為可回收素材，不作為新版敘事或章節順序的依據。

## 課程承諾

完成主線後，學習者應該能：

- 先描述可能世界與資訊，再選公式。
- 分辨 outcome、event、sample space 與 random variable 的層級。
- 看見事件的重量如何因條件資訊而重新分配。
- 分辨 mutually exclusive、independent 與 conditional。
- 把加法、乘法、complement 與 Bayes 視為可能世界上的操作。
- 從生成故事辨認常見 distribution，而不是靠公式外觀背名稱。
- 分辨單次結果、樣本比例、期望值、LLN 與 CLT 各自在說什麼。
- 知道模型假設何時成立、何時不能套用。

## Part I — 建立可能世界

### Ch1 機率不是預言

核心 insight：機率在結果揭曉前描述不確定性；低機率結果發生並不矛盾。

- 70% 下雨而最後沒下雨，預報不一定錯
- 單次 outcome 無法驗證一個 probabilistic forecast
- calibration：許多條件相近的 70% 預測中，事件應約有 70% 發生
- 短期比例可以劇烈波動，長期才逐漸顯出穩定規律

### Ch2 把一次實驗的世界畫完整

核心 insight：event 是完整 outcomes 的集合，不是模糊的結果名稱。

- experiment、outcome / sample point、sample space、event
- 一次硬幣、兩次硬幣、兩顆有順序的骰子
- 建模粒度：同一現象可以有不同 sample space，但必須足以回答問題
- impossible event 與 certain event

### Ch3 機率是重量

核心 insight：結果有幾種名稱，和每種結果有多少 probability mass，是兩件事。

- probability mass / weight
- 等可能只是特殊假設
- 公平與偏置的骰子／袋中不同數量的球
- 非負、總重量為 1、互斥區塊的重量可相加
- 可展開：Kolmogorov axioms

### Ch4 事件的幾何

核心 insight：union、intersection、complement 是在同一可能世界上選取區域。

- union / intersection / complement
- mutually exclusive
- 重疊事件的加法與 double counting
- De Morgan’s laws 的視覺版本
- 可展開：集合符號與一般加法公式

## Part II — 多階段世界

### Ch5 世界如何分岔

核心 insight：加法在合併互斥分支；乘法在沿一條多階段路徑前進。

- tree diagram 與 ordered outcomes
- Cartesian product
- 有放回／不放回
- path probability 與 branch sum

### Ch6 計數是壓縮樹狀圖

核心 insight：permutation 與 combination 是避免展開巨大樹狀圖的工具，不是題目關鍵字公式。

- multiplication principle
- ordering 是否重要
- permutation、combination
- 重複元素
- birthday problem 作為建模案例

### Ch7 從反面看「至少一次」

核心 insight：complement 是換一個更容易描述的事件，不是固定口訣。

- at least / at most / exactly
- 至少一次 vs 一次都沒有
- repeated attempts 與 reliability
- 何時直接分類反而更簡單

## Part III — 資訊如何改變重量

### Ch8 條件機率：世界縮小

核心 insight：知道 B 後，B 外面的世界被裁掉，剩餘重量重新正規化。

- conditional probability
- `A given B` 的方向
- intersection 在新世界中的比例
- 抽球不放回
- 可展開：定義與 multiplication rule

### Ch9 獨立：縮小後比例不變

核心 insight：independence 不是「看起來沒關係」，而是條件資訊沒有改變比例。

- independent vs mutually exclusive
- pairwise vs mutual independence 預告
- repeated trials
- 有放回、不放回與近似獨立

### Ch10 Bayes：從結果反推原因

核心 insight：Bayes’ theorem 是看見結果後，在競爭原因之間重新分配重量。

- prior、likelihood、posterior
- natural frequencies / icon arrays
- base-rate neglect
- false positive
- total probability
- 可展開：Bayes 公式推導

## Part IV — 把 outcomes 映射成數值

### Ch11 Random variable 是測量規則

核心 insight：random variable 不是「自己亂動的數」，而是把每個 outcome 映射到數值的函數。

- mapping diagram
- 同一 sample space 上的不同 random variables
- discrete / continuous
- preimage 與事件

### Ch12 Distribution 是數值世界的重量地圖

核心 insight：distribution 記錄 random variable 的值各自承接多少重量。

- PMF、CDF
- PDF 是密度，不是點的機率
- 區間面積
- normalization

### Ch13 期望值是重量中心

核心 insight：expectation 是整個 distribution 的平衡點，不保證是可能 outcome。

- weighted center
- linearity of expectation
- variance 是離中心的典型平方距離
- covariance
- 可展開：LOTUS

### Ch14 Distribution 來自生成故事

核心 insight：用「資料怎麼生成」辨認 distribution。

- Bernoulli / Binomial：固定次數成功計數
- Geometric：等到第一次成功
- Poisson：區間內稀疏事件計數
- Uniform：區間內等密度
- Exponential：等待下一事件
- Normal：許多小效應相加
- Gamma、Beta、chi-squared 作為延伸地圖

## Part V — 隨機如何產生規律

### Ch15 大數法則

核心 insight：Law of Large Numbers（LLN）談的是樣本平均靠近期望值，不是未來會補償過去。

- 多條 sample paths
- proportion 的波動尺度
- gambler’s fallacy
- convergence 的直覺與適用條件
- 可展開：weak / strong LLN

### Ch16 中央極限定理

核心 insight：Central Limit Theorem（CLT）談的是標準化總和的分布形狀，不是「所有資料都是 Normal」。

- sums of varied distributions
- centering 與 scaling
- LLN vs CLT
- approximation quality 與失效情況
- 可展開：常見版本的條件

## 第一章 storyboard

### Step 1 — 70% 不是預言

```text
核心 insight：
低機率結果發生，和原先的機率判斷並不矛盾。

學習者原本可能怎麼誤解：
70% 下雨卻沒下雨，代表預報「錯了」。

第一個具體問題：
氣象預報說明天下雨機率 70%，結果是晴天。預報錯了嗎？

主要視覺模型：
一條 0–100% 的可能性帶；70% 雨區與 30% 晴區都留在世界裡，揭曉標記落在晴區。

學習者能操作的變數：
先選擇「錯了／不一定」，再揭曉解釋；切換 10、50、100 個相似預測觀察 calibration。

操作時保持不變的東西：
每個案例在揭曉前都被模型評為 70%。

預測 → 回饋 → 壓縮：
先判斷單次結果能否否定預測；再用多個案例看見單次 outcome 與 calibration 的差別。

正式內容放在哪個展開層：
probabilistic forecast、calibration 的較精確說明。

最後如何檢查能否遷移：
API 單次失敗是否足以推翻「成功率 99%」？
```

### Step 2 — 同一個 50%，可以長得非常不同

```text
核心 insight：
機率相同不代表短期序列會長得規律。

學習者原本可能怎麼誤解：
公平硬幣應該交替出現，或每十次都剛好五正五反。

主要視覺模型：
多條由同一個 50% 模型產生的短序列並排，顯示 streak 與不平衡是正常現象。

互動：
先選出「最像公平硬幣」的序列，再揭示三條序列都可能來自同一模型；重新生成可重現的世界。

觀念圖卡：
模型描述生成規則，不指定每一段短序列的外觀。
```

### Step 3 — 規律不是出現在每一條路上

```text
核心 insight：
重複次數增加時，樣本比例通常更靠近理論值，但沒有短期補償機制。

學習者原本可能怎麼誤解：
偏離 50% 後，硬幣「欠」了另一面，所以接下來會自動修正。

主要視覺模型：
多條 cumulative proportion paths 與一個隨 n 變窄的群體分布。

互動：
切換 10／50／200／1000 次，觀察多個世界的比例散布；可重設 seed。

觀念圖卡：
長期穩定來自新資料稀釋舊波動，不是未來替過去還債。

正式內容：
frequency interpretation 與 LLN 預告，嚴格定理留到 Ch15。
```

## 第二章 storyboard

### Step 1 — 一次實驗，三個不同層級

```text
核心 insight：
experiment 是產生結果的規則；outcome 是真正發生的一個完整結果；sample space 是事前所有完整 outcomes 的集合。

學習者原本可能怎麼誤解：
把「擲骰子」「骰到 4」「1 到 6」當成同一層的東西。

第一個具體問題：
骰子尚未落地時，哪些結果仍在世界裡？落地後，又是哪一個東西被選中？

主要視覺模型：
六個 outcome tiles 構成一個可見的 sample space；擲骰時所有格子保持可能，停下後只聚焦其中一格。

互動：
反覆擲骰，觀察 experiment 不變、sample space 不變，只有 outcome 改變。

觀念圖卡：
規則產生世界；世界包含可能結果；實驗最後選中其中一點。
```

### Step 2 — 完整結果必須記完這次實驗

```text
核心 insight：
多階段 experiment 的一個 outcome 必須包含每個階段；丟兩次硬幣時，H 只是部分資訊，HH／HT／TH／TT 才是完整 outcomes。

學習者原本可能怎麼誤解：
因為只看到 H、T 兩種名稱，所以認為丟兩次仍只有兩種結果。

主要視覺模型：
兩層 tree diagram；第一擲的 H/T 分支各自再分成第二擲的 H/T，葉節點形成四個完整 sequences。

互動：
先猜完整 outcomes 數量，再逐層展開樹；點擊葉節點同步高亮它走過的兩段路徑。

觀念圖卡：
outcome 是否完整，要看它能不能回答「整次實驗發生了什麼」。
```

### Step 3 — Event 是替世界畫圈

```text
核心 insight：
event 是 sample space 的 subset；它可以包含零個、一個、多個或全部 outcomes。

學習者原本可能怎麼誤解：
把 event 當成另一個新 outcome，或認為 event 一定包含多個結果。

主要視覺模型：
六個骰子 outcomes 固定排列；切換「偶數」「大於 4」「自己選」，事件只是在同一世界中圈出不同格子。

互動：
使用 presets 或自行點選 outcomes 建立 event；同步顯示集合表示、大小與 impossible／certain 的特殊狀態。

觀念圖卡：
sample space 是整張地圖；outcome 是一個位置；event 是地圖上被圈出的區域。
```

### Step 4 — 地圖要保留問題需要的資訊

```text
核心 insight：
同一個現象可以有不同 sample space；沒有唯一「最詳細」的畫法，但壓縮後不能丟失回答目標問題所需的資訊。

學習者原本可能怎麼誤解：
以為 sample space 是現實世界唯一固定的清單，或越簡單越好。

主要視覺模型：
兩顆骰子的 6×6 ordered-pair grid，與只保留總和 2–12 的 compressed view 同步連動。

互動：
切換「總和是 7」與「第一顆是 6」兩個問題；前者能在兩種地圖回答，後者在總和地圖中已遺失資訊。

觀念圖卡：
好的 sample space 不必記住所有細節，但必須分得出你關心的差異。

正式內容：
sample space 是建模選擇；random variable 作為壓縮映射只作 Ch11 預告。
```

## 第三章 storyboard

### Step 1 — 結果名稱不是結果重量

```text
核心 insight：
sample space 裡有幾種 outcome 名稱，不能決定它們各自的 probability；「紅／藍」兩種結果不等於各占 1/2。

學習者原本可能怎麼誤解：
看到兩種可能就自動各分一半。

第一個具體問題：
袋中有 9 顆紅球、1 顆藍球；sample space 若寫成 {紅, 藍}，藍球 probability 是 1/2 嗎？

主要視覺模型：
球袋中的十顆實體與壓縮後的兩個 outcome 名稱並排；名稱數保持 2，兩邊重量隨球數改變。

互動：
調整紅、藍球數量，觀察 sample space 名稱不變，但 probability bar 立刻重新分配。

觀念圖卡：
「有幾種名稱」回答世界如何分類；「各有多重」才回答 probability。
```

### Step 2 — Probability mass 必須分完

```text
核心 insight：
probability distribution 是把總量 1 分配到所有 outcomes；增加一處重量時，整體必須重新正規化。

學習者原本可能怎麼誤解：
每個 outcome 的 probability 可以互不相關地任意增加，或總和不必等於 1。

主要視覺模型：
六個骰子 outcomes 各有一個 raw weight 柱；上方固定一個總量為 1 的 probability mass bar，同步顯示 normalized probabilities。

互動：
拖動六個 relative weight sliders，或切換 fair／loaded presets；比較 raw weight 與 normalized probability。

操作時保持不變的東西：
所有 normalized probabilities 的總和永遠是 1。

觀念圖卡：
weight 決定相對偏好；normalization 把全部 weight 壓回總量 1。
```

### Step 3 — Equal likelihood 才能數格子

```text
核心 insight：
favorable outcomes / total outcomes 只在 elementary outcomes 等可能時成立；一般情況要加總事件內的 probability mass。

學習者原本可能怎麼誤解：
只要 sample space 有六格，任何三格 event 都一定是 1/2。

主要視覺模型：
同一個六格 sample space 與同一個「偶數」event，並排放在 fair die 和 loaded die 上；格數相同，重量結果不同。

互動：
切換 fair／loaded die，選擇偶數或大於 4；同步比較 counting shortcut 與真正 weight sum。

觀念圖卡：
數格子不是 probability 的定義，而是 equal likelihood 下的 shortcut。
```

### Step 4 — 三條地基規則

```text
核心 insight：
任何 probability model 都必須遵守：重量非負、整個 sample space 總重為 1、互不重疊的區塊可以直接加重。

學習者原本可能怎麼誤解：
把 axioms 當作額外公式，而不是「合法重量系統」的最低條件。

主要視覺模型：
一條固定總長為 1 的重量帶；選取骰子 outcomes 時，不重疊區塊被搬到同一個托盤並保持總長。

互動：
逐條測試非法模型（負重量、總和超過 1）與合法模型；點擊不同 outcomes 組成 event，觀察 event weight 的加總。

觀念圖卡：
probability 是一套守恆的非負重量系統。

正式內容：
Kolmogorov axioms 的有限離散版本；countable additivity 留在展開層。
```

## 第四章 storyboard

### Step 1 — Event operations 是同一張地圖的選取方式

```text
核心 insight：
union、intersection 不是新的 outcomes，而是在同一個 sample space 上用不同規則選取區域。

學習者原本可能怎麼誤解：
把 A∪B、A∩B 當成需要另背的抽象符號，沒有和「或／且」的區域選取連起來。

第一個具體問題：
在 1 到 12 的 outcomes 中，哪些結果屬於「偶數或 3 的倍數」？哪些結果必須兩個條件都符合？

主要視覺模型：
固定的十二格 universe；A 與 B 以一致顏色標記，切換 A、B、A∩B、A∪B 時只改變選取規則。

互動：
切換 selection lens，觀察 outcomes 本身與 A、B 的 membership 保持不變。

觀念圖卡：
union 是至少進入一個區域；intersection 是同時進入兩個區域。

正式內容：
集合符號、元素判定與 subset 記法放在展開層。
```

### Step 2 — 重疊區為什麼要扣回一次

```text
核心 insight：
P(A)+P(B) 在事件重疊時會把 intersection 算兩次；union 只需要每個 outcome 的重量一次。

學習者原本可能怎麼誤解：
看到「A 或 B」就無條件把兩個 probabilities 相加。

主要視覺模型：
一張可展開的 counting receipt：先收下 A 的六份重量，再收下 B 的六份重量，重疊 outcomes 會出現 duplicate 標記。

互動：
先預測 union probability，再切換 naive sum／deduplicated view，看重複重量被退回一次。

觀念圖卡：
加法本身沒有錯；錯的是同一份 probability mass 被付款兩次。

正式內容：
general addition rule 與互斥特例放在展開層。
```

### Step 3 — Complement 是把選取反轉

```text
核心 insight：
complement 保留目前 event 以外的所有 outcomes；De Morgan’s laws 是「先合併再反轉」與「先反轉再換操作」的同一張圖。

學習者原本可能怎麼誤解：
把 complement 當成只會套 1−P(A) 的計算公式，或只記 De Morgan 符號而不懂區域。

主要視覺模型：
左右兩張同步十二格 universe；左邊執行 complement of union／intersection，右邊分別反轉 A、B 後用另一個 operation 合併。

互動：
切換 NOT(A OR B) 與 NOT(A AND B)，逐格比較左右結果完全一致。

觀念圖卡：
否定「至少一個」會變成「兩個都不」；否定「兩個都」會變成「至少一個不」。

正式內容：
complement identity 與 De Morgan’s laws 放在展開層。
```

### Step 4 — Mutually exclusive 只是在問有沒有重疊

```text
核心 insight：
mutually exclusive 是幾何關係：A∩B 為空；它不代表兩個事件「沒有關係」或 independent。

學習者原本可能怎麼誤解：
把 mutually exclusive 與 independent 當成同義詞。

主要視覺模型：
A 固定占據數線上的一段，B 是可左右滑動的三格窗口；交集格數隨位置出現或消失。

互動：
移動 B，先預測兩事件能否同時發生；即時顯示 intersection 與 mutually exclusive 狀態。

觀念圖卡：
mutually exclusive 問「能不能一起發生」；independence 問「知道一件事後，重量比例會不會改變」。

正式內容：
空集合定義、互斥時的加法特例，以及非零互斥事件不獨立的預告放在展開層。
```

## 第五章 storyboard

### Step 1 — 一個完整 outcome 是從 root 走到 leaf 的整條路

```text
核心 insight：
多階段 experiment 的 sample space 不是每一階段的選項清單，而是 tree diagram 上所有完整 root-to-leaf paths。

學習者原本可能怎麼誤解：
丟兩次硬幣仍然只有 H、T 兩種 outcomes，或把第一階段的中途節點當成完整結果。

第一個具體問題：
丟兩次硬幣，為什麼兩個選項經過兩個階段後會形成四個 outcomes？

主要視覺模型：
可逐層展開的 binary tree；中途節點只記錄 partial history，四個 leaves 對應 HH、HT、TH、TT。

互動：
先預測 leaves 數量，再展開第二階段；點擊任一 leaf，高亮它走過的完整 path。

操作時保持不變的東西：
每一階段仍只有 H、T 兩個選項；增加的是 histories 的組合數。

觀念圖卡：
branch 是下一步選項；leaf 才是整次 experiment 的完整 outcome。

正式內容：
Cartesian product 與 ordered pairs／sequences 的表示放在展開層。
```

### Step 2 — 乘法是在同一路徑上連續縮小

```text
核心 insight：
一條 path 的 probability 是每次分岔後保留下來的相對份額連續相乘；乘法描述的是 nested narrowing。

學習者原本可能怎麼誤解：
看到「兩次」就套乘法，卻不知道相乘的兩個數各自以哪個世界為分母。

主要視覺模型：
3 紅 2 藍、不放回抽兩顆的 nested mass strip；先保留第一抽的 3/5，再在剩下四顆中保留第二抽的 2/4。

互動：
選擇 RR／RB／BR／BB path；視覺同步改變第一段寬度、第二段在父區塊內的比例，以及完整 path 的總面積。

觀念圖卡：
沿 path 乘，是因為第二份比例只切割第一步已經留下的世界。

正式內容：
一般 chain rule 的兩階段符號只作預告；conditional probability 的正式定義留到 Ch8。
```

### Step 3 — 放不放回，改變的是下一層的世界

```text
核心 insight：
with replacement 與 without replacement 的 tree 結構相同，但第一抽之後袋中狀態不同，因此第二層 branch weights 可能改變。

學習者原本可能怎麼誤解：
只要抽兩次，每一抽紅球 probability 都固定是原本的 3/5。

主要視覺模型：
第一抽結果、是否放回、第二抽前袋中組成與四個 leaves 的 weights 同步顯示。

互動：
切換第一抽 R／B 與 with／without replacement；觀察第二抽前的球袋及 second-branch probability。

觀念圖卡：
tree 的分支名稱可以相同；生成過程改變時，branch weights 會改變。

正式內容：
用 probability tree 列出兩種模型的四個 leaf weights；independence 名稱留到 Ch9。
```

### Step 4 — Event 會收集 leaves；不同 paths 的重量相加

```text
核心 insight：
event 可以由多條互斥的完整 paths 組成；每條 path 先沿路相乘，再把被 event 收集的 leaf weights 相加。

學習者原本可能怎麼誤解：
把「乘法」與「加法」當成題目關鍵字規則，或直接把不同階段、不同 paths 的數字混在一起。

主要視覺模型：
固定的四葉 probability tree 與 event tray；切換 event 時，符合的 leaves 被搬入 tray 並疊成總重量。

互動：
選擇「剛好一紅」「同色」「第一抽紅」或自行點選 leaves；同步顯示 selected paths 與 branch sum。

觀念圖卡：
沿一條路徑乘；合併幾條互斥路徑加。

正式內容：
sum over disjoint paths 與 law of total probability 的雛形放在展開層。
```

## 第六章 storyboard

### Step 1 — Multiplication principle 是把規則相同的 tree layers 壓成一串選項數

```text
核心 insight：
若每個第一階段 choice 後面都接著同樣數量的第二階段 choices，完整 paths 數量就是各層 branch counts 的乘積。

學習者原本可能怎麼誤解：
看到「有三件事」就把數字相乘，卻沒有確認每個選擇能否和下一層自由配對。

第一個具體問題：
3 件上衣、2 件褲子、2 雙鞋，能組成幾套完整 outfits？

主要視覺模型：
三層 compressed tree；每層只保留 branch count，旁邊同步展開一部分完整 outfit paths。

互動：
調整三層 choice counts，觀察 paths grid 與 total leaves 同步增長。

操作時保持不變的東西：
每一個已走過的 partial path 都會接上下一層的全部 choices。

觀念圖卡：
不是「看到幾個數就乘」；是每條 partial path 都被下一層等量複製。

正式內容：
fundamental counting principle 的一般有限版本放在展開層。
```

### Step 2 — Permutation 保留位置，所以選項數會逐格減少

```text
核心 insight：
排列（permutation）是在 distinct objects 中依序填入有角色的位置；同一批 objects 換位置後仍是不同 outcome。

學習者原本可能怎麼誤解：
把「選三個人」一律當成 combination，沒有先問三個位置是否可交換。

主要視覺模型：
金、銀、銅三個有標籤 slots；填完一格後，可用 objects 少一個，因此 choice counts 形成 n、n−1、n−2。

互動：
調整 objects 數 n 與 slots 數 k；同步查看每格剩餘 choices、ordered paths 數量與少量 sample arrangements。

觀念圖卡：
位置有名字，交換位置就改變 outcome；這是 permutation。

正式內容：
falling factorial 與 n!/(n−k)! 放在展開層。
```

### Step 3 — Combination 把只差順序的 paths 壓成同一 group

```text
核心 insight：
組合（combination）不是另一種神秘計數；它把選到同一批 objects 的 k! 條 ordered paths 合併成一個 unordered group。

學習者原本可能怎麼誤解：
只靠「選、排」中文關鍵字決定公式，或不知道 combination 為什麼要除以 k!。

主要視覺模型：
5 人選 3 人；左邊顯示某個 group 的六種 arrival orders，右邊把它們收進同一 committee bucket。

互動：
點選十個 committees，觀察每個 bucket 背後都有六條 permutations，但成員集合相同。

觀念圖卡：
若交換位置不會產生新 outcome，就把這些 order variants 合併。

正式內容：
binomial coefficient 與 permutation-to-combination 推導放在展開層。
```

### Step 4 — 重複元素會讓不同 labeled paths 顯示成同一排列

```text
核心 insight：
當 objects 外觀相同，底層 labeled paths 仍不同，但觀察層會把交換相同元素的 paths 壓成同一 visible arrangement。

學習者原本可能怎麼誤解：
AAB 有 3! = 6 種可見排列，忽略交換兩個 A 不會改變字串。

主要視覺模型：
A₁、A₂、B 的六條 labeled permutations；關閉 labels 後成對合併成 AAB、ABA、BAA 三個 buckets。

互動：
切換 labeled／visible view，點選 bucket 查看它收進哪些底層 paths。

觀念圖卡：
要除掉的不是「重複字母」，而是交換 indistinguishable objects 所造成的重複描述。

正式內容：
multiset permutation n!/(n₁!⋯nᵣ!) 放在展開層。
```

### Step 5 — Birthday problem：先數更容易描述的世界

```text
核心 insight：
birthday collision 很快變常見，不是因為某人容易撞上指定生日，而是群體中 pair opportunities 快速增加；直接分類所有 collision patterns 很難，no-collision paths 卻有規律。

學習者原本可能怎麼誤解：
23 人只有 23 次撞上「我的生日」的機會，所以相同生日 probability 應很低。

主要視覺模型：
people slider 同步控制 pair count、exact collision curve，以及 no-collision tree 每層 365、364、363… 的 available-day counts。

互動：
先預測 23 人 collision probability，再調整 2–60 人觀察 pairs 與 probability 非線性上升。

觀念圖卡：
先辨認 event 是「任意一對」；當成功情況重疊又混亂，反面世界常有更規則的 tree。

正式內容：
exact complement product、假設與 365-day model 放在展開層；第七章再正式建立 at least once 的 complement strategy。
```

## 第七章 storyboard

### Step 1 — At least、at most、exactly 是在次數軸上選區域

```text
核心 insight：
至少 k 次（at least k）、至多 k 次（at most k）與剛好 k 次（exactly k）不是語文陷阱，而是在 0…n 次的 count axis 上選取不同區域。

學習者原本可能怎麼誤解：
把「至多一次」理解成剛好一次，或忘記「至少一次」包含 2、3…次。

第一個具體問題：
重試 5 次時，「至多 2 次成功」究竟包含哪些 success counts？

主要視覺模型：
0 到 n 的 count tiles；拖動 k 並切換 at least／at most／exactly，符合條件的 tiles 連續亮起。

互動：
調整總次數 n、門檻 k 與語意模式；同步顯示 inequality、自然語句與 selected counts。

觀念圖卡：
at least 是從門檻向右；at most 是從門檻向左；exactly 只留一格。

正式內容：
inequality notation 與 count random variable 的預告放在展開層。
```

### Step 2 — Complement 是把同一個 count axis 的選取整張反轉

```text
核心 insight：
「至少一次成功」之所以常從「一次都沒有」計算，不是固定口訣，而是兩者正好瓜分同一個世界，而且反面只剩單一 count。

學習者原本可能怎麼誤解：
看到「至少」便機械地寫 1−，卻說不出被扣掉的 event 是什麼。

主要視覺模型：
8 條三次試驗 paths；七條含至少一個 S，唯一的 FFF path 在切換 complement 時反相選取。

互動：
先嘗試直接點選所有「至少一次 S」paths，再一鍵反轉成「零次 S」，比較描述成本 7 paths vs 1 path。

觀念圖卡：
complement 不是換題目；它是用反面選取同一個世界，兩邊重量相加永遠是 1。

正式內容：
event complement identity 與三次 binary paths 的加總放在展開層。
```

### Step 3 — Repeated attempts 的 reliability 來自「全部失敗」快速縮小

```text
核心 insight：
在每次成功率固定且 attempts independent 的模型下，至少一次成功會隨次數增加，是因為唯一的 all-failure path weight 反覆乘上 failure rate。

學習者原本可能怎麼誤解：
多試幾次會線性增加成功率，或三次 40% 成功率等於 120%。

主要視覺模型：
failure mass strip 每新增一次 attempt 就再乘 q；其餘 complement 區域即「至少一次成功」。

互動：
調整單次 success probability p 與 attempts n；同步顯示 all-failure mass、at-least-one mass 與逐次縮小軌跡。

觀念圖卡：
reliability 不靠把 p 重複相加；它來自 all-failure path 以 qⁿ 指數縮小。

正式內容：
1−(1−p)ⁿ、模型假設與 independence 預告放在展開層。
```

### Step 4 — 是否用 complement，要比較兩邊的描述成本

```text
核心 insight：
complement 是策略選擇，不是題型規則；應選 paths／count categories 較少、重疊較少、生成規則較整齊的一側計算。

學習者原本可能怎麼誤解：
所有含「至少」「至多」的問題都應使用 complement，或 complement 永遠比較快。

主要視覺模型：
strategy cards 並排顯示 direct event 與 complement 所需處理的 count categories；不同問題切換時成本條同步變化。

互動：
針對「至少一次」「剛好兩次」「至多四次」先選 direct／complement，再揭示哪一側描述更短及原因。

觀念圖卡：
先寫出 event 與它的反面，再選更容易描述的一邊；若反面沒有更簡單，就直接算。

正式內容：
binomial probability 作為後續 distribution 的預告，只在展開層示範 exact-count 計算。
```

## 第八章 storyboard

### Step 1 — 得到條件資訊，就是把 sample space 裁成一個新世界

```text
核心 insight：
條件機率（conditional probability）不是在原 probability 上加一條限制；知道 B 發生後，B 外面的 outcomes 已不再可行，B 內剩餘的 probability mass 必須重新縮放成總量 1。

學習者原本可能怎麼誤解：
把 P(A|B) 當成 P(A) 和 P(B) 的某種符號運算，沒有改變分母的空間感。

第一個具體問題：
公平骰子原本有六個 outcomes；已知點數大於 3 後，「偶數」為什麼從 3/6 變成 2/3？

主要視覺模型：
六格 outcome world 先顯示原始等重格；啟用 condition B 後，1、2、3 被裁掉，4、5、6 三格水平展開填滿同一寬度，其中 4、6 屬於 A。

互動：
拖動「已知至少為幾點」的 condition threshold，切換 before／after view；同步顯示剩餘 outcomes 與 A 在新世界中的比例。

操作時保持不變的東西：
outcome 是否屬於 A 不變；改變的是哪些 outcomes 仍可能，以及比例使用的 denominator。

觀念圖卡：
conditional probability：裁掉不符合資訊的世界，再讓剩餘重量重新合計為 1。

正式內容：
P(A|B)=P(A∩B)/P(B)、P(B)>0 與 renormalization 定義放在展開層。
```

### Step 2 — Given 左右不能交換，因為它指定了不同的新世界

```text
核心 insight：
P(A|B) 與 P(B|A) 的 numerator 都是同一個 intersection，但 denominator 分別是 B 與 A；given 後面的事件決定目前站在哪個世界裡看比例。

學習者原本可能怎麼誤解：
因為 A∩B 沒有方向，便認為 P(A|B)=P(B|A)。

第一個具體問題：
40 人中，20 人學日文、15 人看動畫、其中 10 人兩者皆是；「看動畫者中學日文」與「學日文者中看動畫」會一樣嗎？

主要視覺模型：
固定的 40-person population grid；切換 A given B／B given A 時，intersection tiles 不動，但 condition frame 分別包住 15 或 20 人並放大成新的 100%。

互動：
先預測兩個方向是否相同，再切換 given direction；畫面同步標出 denominator、intersection 與 10/15、10/20。

觀念圖卡：
given 後面是新世界；問號前面是在那個新世界中要量的區域。

正式內容：
兩個 conditional probabilities 的並排定義與 Bayes bridge 僅放在展開層。
```

### Step 3 — Intersection 是在父世界裡再保留一個條件比例

```text
核心 insight：
若 B 占原世界一部分，而 A 在 B 裡又占一部分，A∩B 的總重量就是「先留下 B，再在 B 裡留下 A」的 nested area。

學習者原本可能怎麼誤解：
看到 60% 的流量是 mobile、其中 25% 購買，便把 60% 與 25% 相加，或把 25% 誤當全站購買率。

第一個具體問題：
全站 60% sessions 來自 mobile；mobile sessions 中 25% 完成購買。全站同時是 mobile 且購買的比例是多少？

主要視覺模型：
一個 100% rectangle 先以寬度切出 B，再在 B rectangle 內以高度或填充切出 A；intersection 面積隨兩個 sliders 同步改變。

互動：
調整 B 的原世界占比與 A given B 的內部占比；先預測 intersection，畫面再以 100 個 cells 顯示 nested selection 的實際總量。

觀念圖卡：
conditional percentage 的分母是 B；要回到原世界，就把它乘回 B 的重量。

正式內容：
multiplication rule P(A∩B)=P(B)P(A|B) 與對稱寫法放在展開層。
```

### Step 4 — 不放回抽球：新資訊會改變下一抽真正面對的袋子

```text
核心 insight：
conditional probability 的變化可能來自生成世界真的被改變；不放回時，知道第一抽顏色等於知道第二抽前袋中少了哪顆球。

學習者原本可能怎麼誤解：
第二抽紅球 probability 永遠是最初的 3/5，或只機械地把分母減一卻沒更新 numerator。

第一個具體問題：
3 紅 2 藍不放回抽兩顆；尚未知道第一抽、已知第一抽紅、已知第一抽藍時，第二抽紅球的 probability 各是多少？

主要視覺模型：
三個 information states 共用同一袋球：no information 顯示兩條可能 histories 的加權混合；given R 移除一顆紅球；given B 移除一顆藍球。

互動：
切換 no information／first R／first B，先預測第二抽紅球比例，再觀看袋子與 3/5、2/4、3/4 同步更新。

觀念圖卡：
條件資訊不是備註；它決定哪些 histories 還活著，以及下一步真正面對哪個世界。

遷移：
用「測試結果已知」但不涉及抽球的簡短判斷題，確認能辨認 condition 改的是 denominator，而非只會減球。

正式內容：
tree-based conditional calculation、no-information mixture 與下一章 independence 的橋接放在展開層。
```

## 第九章 storyboard

### Step 1 — Independence 是 conditioned world 中的比例保持不變

```text
核心 insight：
事件 A、B 獨立（independent），意思是知道 B 發生、把世界裁成 B 後，A 在其中的比例仍與原世界完全相同。

學習者原本可能怎麼誤解：
把 independence 理解成「兩件事題目看起來不相關」，或只記得 independent probabilities 可以相乘。

第一個具體問題：
丟兩次公平硬幣；已知第二次是正面後，第一次是正面的 probability 會改變嗎？

主要視覺模型：
HH、HT、TH、TT 四條完整 paths；A=第一次 H。before view 中 A 占 2/4，given second H 後只剩 HH、TH，A 仍占 1/2。

互動：
切換 no information／given second H／given second T；同步比較 A 的 before ratio 與 after ratio。

操作時保持不變的東西：
condition world 會換成不同兩條 paths，但每一塊都保留一條 first H 與一條 first T。

觀念圖卡：
conditional：世界縮小；independent：縮小後，A 的比例不變。

正式內容：
P(A|B)=P(A)、對稱性與 P(A∩B)=P(A)P(B) 的等價條件放在展開層。
```

### Step 2 — Mutually exclusive 與 independent 問的是兩個不同問題

```text
核心 insight：
mutually exclusive 問 A、B 能否同時發生；independent 問得知 B 是否改變 A 的比例。非零互斥事件因 given B 後讓 A 變成 0，反而是強烈 dependent。

學習者原本可能怎麼誤解：
把「不能同時發生」說成「互不影響」，因此把 mutually exclusive 當成 independent。

第一個具體問題：
一顆公平骰子中，A=奇數、B=偶數；兩者沒有 overlap，是否代表 independent？

主要視覺模型：
同一個 before／after ratio checker 在三個 scenarios 間切換：兩次硬幣的 independent overlap、骰子奇偶的 mutually exclusive、骰子偶數與大於 3 的 dependent overlap。

互動：
先選 independent／dependent，再 reveal condition；畫面同時顯示 overlap status 與 A ratio 是否改變。

觀念圖卡：
互斥看 overlap；獨立看 ratio invariant。沒有 overlap 不等於沒有資訊影響。

正式內容：
若 P(A),P(B)>0 且 A∩B 為空，則 P(A|B)=0≠P(A) 的短證明放在展開層。
```

### Step 3 — 不放回通常 dependent；袋子很大時只能說 approximately independent

```text
核心 insight：
with replacement 讓下一抽看見完全相同的組成，因此比例精確不變；without replacement 會改變比例。母體很大時改變可能很小，但「很接近」仍不是 exact independence。

學習者原本可能怎麼誤解：
不放回一律影響很大，或比例只差一點便可宣稱 mathematically independent。

第一個具體問題：
3 red、2 blue 中已知先抽到 red，下一抽 red 從 3/5 變成 2/4；若是 600 red、400 blue，變化還看得出來嗎？

主要視覺模型：
before／after probability bars；population size slider 以固定 60% red 放大袋子，with／without replacement toggle 控制 after ratio。

互動：
選擇 N=5、10、50、100、1000 與 replacement mode，觀察 probability shift 的絕對大小和 exact／approximate badge。

觀念圖卡：
exact independence 是比例完全不變；large population 只能讓 dependence 的影響變小。

正式內容：
finite population correction 的直覺、(R−1)/(N−1) 與極限差異放在展開層。
```

### Step 4 — 相同的單次成功率，不保證 repeated trials 彼此 independent

```text
核心 insight：
independence 是 joint-generation model 的假設，不由每次 marginal success rate 相同自動推出；shared cause 可以讓兩次結果一起成敗。

學習者原本可能怎麼誤解：
兩次嘗試的成功率都是 80%，便直接認定兩次失敗率相乘為 4%。

第一個具體問題：
兩次 API attempts 各自成功率都是 80%；至少一次成功一定是 96% 嗎？

主要視覺模型：
100 個 scenario tiles；independent retries 分成 64 SS、16 SF、16 FS、4 FF，shared outage model 則是 80 SS、20 FF。兩邊每次 marginal 都是 80%，joint pattern 卻不同。

互動：
切換 independent retries／shared outage；同步顯示 marginals、mixed outcomes、both-fail 與 at-least-one success。

觀念圖卡：
相同 marginals 不等於相同 joint distribution；能否相乘取決於生成機制是否讓資訊改變下一次比例。

正式內容：
independent repeated-trial product、common-cause warning，以及 pairwise independent but not mutually independent 的 XOR 三事件預告放在展開層。
```

## 第十章 storyboard

### Step 1 — Reverse conditioning 需要把所有能產生 evidence 的原因放回來

```text
核心 insight：
P(E|H) 描述假設 H 如何產生 evidence E；P(H|E) 則是在已看到 E 後，問 H 在所有可能原因中占多少。方向反轉時，其他也能產生 E 的原因不能消失。

學習者原本可能怎麼誤解：
知道「下雨時草地有 90% 會濕」，便直接說「草地濕時有 90% 是下雨」。

第一個具體問題：
100 個早晨中 20 個下雨；18 個 rainy mornings 草地濕，另外 8 個 dry mornings 也因 sprinkler 而濕。看到 wet lawn 後，rain probability 是多少？

主要視覺模型：
100 個 mornings 先按 rain／no rain 分組，再只留下 26 個 wet evidence survivors；其中 18 個來自 rain、8 個來自 sprinkler。

互動：
切換 forward view P(wet|rain) 與 reverse view P(rain|wet)，同步更換 denominator 與 frame。

觀念圖卡：
likelihood 問「這個原因多會產生 evidence」；posterior 問「所有產生 evidence 的原因中，它占多少」。

正式內容：
P(E|H) 與 P(H|E) 的方向、joint bridge 與 Bayes 名稱放在展開層。
```

### Step 2 — False positive 會與 true positive 一起進入 positive evidence pool

```text
核心 insight：
測試準確度不能單獨決定 positive 後的 probability；rare condition 即使 sensitivity 高，龐大的 healthy population 仍可能產生更多 false positives。

學習者原本可能怎麼誤解：
測試 sensitivity 90%，收到 positive 就有 90% 機率真的有 condition。

第一個具體問題：
1000 人中 prevalence 1%；test sensitivity 90%、false-positive rate 10%。positive 後真的有 condition 的比例是多少？

主要視覺模型：
1000-person icon grid：10 人有 condition，其中 9 true positive；990 人沒有，其中 99 false positive。按 positive filter 後只留下 108 人。

互動：
先預測 posterior，再切換 all population／positive only；可調 prevalence 1%–20%，即時觀察 positive pool 的來源組成。

觀念圖卡：
positive evidence pool = true positives + false positives；posterior 是 true positives 在其中的占比。

正式內容：
sensitivity、specificity、false-positive rate 與 natural-frequency 對應放在展開層；不提供醫療決策建議。
```

### Step 3 — Bayes update 是先乘出 surviving weights，再重新正規化

```text
核心 insight：
Bayes update 分兩階段：prior weight 先被各自 likelihood 篩選，形成 unnormalized evidence weights；再只在 survivors 之間重新縮放為 posterior 100%。

學習者原本可能怎麼誤解：
把 prior、likelihood、posterior 視為三個可互換名詞，或以為 posterior 只由 likelihood 大小決定。

第一個具體問題：
兩個 competing hypotheses 起始 weights 不同，看到同一份 evidence 後，為什麼 likelihood 較高者仍不一定成為 posterior 多數？

主要視覺模型：
H 與 not-H 兩條 weight lanes；prior width 經 likelihood gate 收縮成 evidence-surviving segments，最後兩段平移並重新拉伸成 posterior bar。

互動：
調整 prior P(H)、likelihood P(E|H) 與 alternative likelihood P(E|not H)；同步顯示兩條 surviving weights 與 posterior。

觀念圖卡：
posterior ∝ prior × likelihood；normalize 只是讓所有 evidence-compatible weights 再次合計為 1。

正式內容：
binary Bayes’ theorem、odds form 與 normalization denominator 放在展開層。
```

### Step 4 — Total probability 是把 evidence 的所有來源重量收進同一個 denominator

```text
核心 insight：
當 evidence 可由多個互斥原因產生，P(E) 是所有「原因 prior × 該原因 likelihood」路徑的總和；某原因的 posterior 是它那條 evidence path 占總 evidence pool 的份額。

學習者原本可能怎麼誤解：
只計算目標原因產生 evidence 的 path，忘記 denominator 還要包含其他競爭原因。

第一個具體問題：
系統 traffic 來自 Web 50%、Mobile 30%、API 20%；error rates 分別 2%、5%、10%。看到一筆 error 後，它最可能來自哪裡？

主要視覺模型：
三條 traffic lanes 先按 source prior 分寬，再各自用 error rate 截出 error mass；三段 error mass 被搬入共同 evidence tray 並重新排成 100% posterior。

互動：
切換 source focus，或調整 API error rate；同步顯示各 path weight、total error probability 與 source given error。

觀念圖卡：
total probability 建造 Bayes 的 denominator：把所有能通往 evidence 的互斥 paths 加起來。

正式內容：
law of total probability 與多假設 Bayes formula 放在展開層。
```

## 第十一章 storyboard

### Step 1 — Random variable 是固定的 measurement rule

```text
核心 insight：
隨機變數（random variable）不是一個會自行亂動的數；它是一個固定 mapping，將每個可能 outcome 翻譯成數值。隨機的是哪個 outcome 發生，不是規則本身。

學習者原本可能怎麼誤解：
把 random variable 當作「目前還不知道的普通數」，或以為名稱中的 random 表示 mapping rule 每次會改變。

第一個具體問題：
丟三次硬幣得到 HHT；若 X 的規則是「計算 H 的個數」，X 的輸出是什麼？

主要視覺模型：
八個完整 coin paths 從左側 sample space 進入中央 measurement machine；右側只有 0、1、2、3 四個數值槽。點選任一 path，動畫式連線與 machine readout 同步顯示固定輸出。

學習者能操作的變數：
選擇實際發生的 coin path。

操作時保持不變的東西：
machine rule X = number of H 完全不變。

預測 → 回饋 → 壓縮：
先猜 HHT 的輸出；再讓各種 paths 通過 machine；最後壓縮成「outcome 隨機，measurement rule 固定」。

正式內容放在哪個展開層：
X: Ω→R 的 function 定義、X(ω) notation 與名稱由來。

最後如何檢查能否遷移：
用抽牌 outcome 問「牌面數值」是否也能成為 random variable，而不是再做一次硬幣計數。
```

### Step 2 — 同一個 sample space 可以被不同問題量成不同數值

```text
核心 insight：
sample space 描述世界可能怎麼發生；random variable 描述我們想從每個 outcome 讀出什麼。同一個世界可以同時承載許多不同 measurement rules。

學習者原本可能怎麼誤解：
以為一個 experiment 天生只對應一個 random variable，或把 outcome 本身和測量後的 value 混為一談。

第一個具體問題：
擲兩顆有順序的骰子得到 (2,5)；若 X=點數和、Y=較大點數、Z=是否同點，三台 machine 各輸出什麼？

主要視覺模型：
6×6 ordered dice outcome board 固定不變；切換 Sum／Maximum／Doubles indicator 時，每個 cell 的輸出標籤與等值輪廓重新分組。

學習者能操作的變數：
切換 measurement rule，並點選一個完整 dice outcome。

操作時保持不變的東西：
36 個 ordered outcomes 及其 probability weights。

預測 → 回饋 → 壓縮：
先對 (2,5) 預測三種輸出；再切換 rule 比較整張 board；最後留下「世界不變，問題改變，數值地圖就改變」。

正式內容放在哪個展開層：
三個 functions 的符號寫法，以及 indicator random variable 的 0／1 慣例。

最後如何檢查能否遷移：
詢問同一批顧客紀錄能否同時定義 purchase amount、wait time、paid indicator。
```

### Step 3 — 一個數值背後通常是一整群 outcomes

```text
核心 insight：
事件 X=x 不是數字 x 本身；它是在原 sample space 中所有會被 X 映到 x 的 outcomes。要算其 probability，必須把這整個 preimage 的 weights 合併。

學習者原本可能怎麼誤解：
把 X=2 當作單一 outcome，忘記 HHT、HTH、THH 都能產生同一個 value。

第一個具體問題：
丟三次公平硬幣，X=H 的個數。X=2 在原世界到底包含幾條完整 paths？

主要視覺模型：
八條 paths 與 0、1、2、3 四個 value buckets 之間的匯流圖。選擇 value 後，對應 incoming paths 被框成原世界中的事件，其 weights 流入同一 bucket。

學習者能操作的變數：
選擇 value 0–3，觀察 preimage 與合併後 probability。

操作時保持不變的東西：
原本八條等重 paths 與 mapping rule X=count H。

預測 → 回饋 → 壓縮：
先猜 X=2 是一個還是三個 outcomes；再 reveal incoming paths；最後壓縮成「value 在數值世界，event 活在 outcome world」。

正式內容放在哪個展開層：
preimage {ω∈Ω:X(ω)=x}、P(X=x) 的完整集合寫法。

最後如何檢查能否遷移：
擲兩骰的 sum=7，要求辨認六個 ordered outcomes，而非只回答數字 7。
```

### Step 4 — Discrete 與 continuous 描述的是輸出尺度

```text
核心 insight：
離散（discrete）與連續（continuous）是 random variable 可輸出哪些值的差別，不是 experiment 本身貼死的標籤。同一次 spinner 落點可以被量成精確角度，也可以被分類成 sector。

學習者原本可能怎麼誤解：
只要物理過程連續，所有 random variables 都是 continuous；或認為 continuous 表示「可能值很多」而沒有尺度結構。

第一個具體問題：
同一根 spinner 指針停在 137°；Θ=精確角度與 C=所在象限，各自能輸出哪些值？

主要視覺模型：
可拖曳 angle slider 控制同一 spinner；左側固定顯示實際落點，右側同步顯示 continuous number line 上的 Θ 與四個分離 slots 上的 C。

學習者能操作的變數：
旋轉 spinner 的 angle，切換聚焦 exact angle 或 sector label。

操作時保持不變的東西：
同一個 physical outcome；只有 measurement resolution／rule 不同。

預測 → 回饋 → 壓縮：
先判斷同一 experiment 是否能同時有 discrete 與 continuous variable；拖動後看一邊平滑移動、一邊跨界跳格；最後留下「看 output space，不看故事外觀」。

正式內容放在哪個展開層：
countable output set 的 discrete 定義、interval-valued continuous 直覺，以及真正的 mixed random variable 預告。

最後如何檢查能否遷移：
同一位顧客的精確等待秒數是 continuous，而是否超過 5 分鐘的 indicator 是 discrete。
```

## 第十二章 storyboard

### Step 1 — Distribution 是 mapping 後的重量地圖

```text
核心 insight：
分布（distribution）是 random variable 把原 sample space 的 probability weights 搬到數值世界後形成的地圖；映到同一 value 的 outcomes，其 weights 必須合併。

學習者原本可能怎麼誤解：
把 distribution 當成憑空畫出的統計圖，或只看每個 value 背後有幾條 paths，忘記 paths 可能不等重。

第一個具體問題：
丟三次 biased coin，X=count H。當 P(H) 從 50% 調成 75%，mapping rule 沒變，X 的重量地圖會往哪邊移？

主要視覺模型：
八條 coin paths 帶著由 p 決定的不同 weight，經固定 mapping 匯入 X=0、1、2、3 四個 buckets；左右同步顯示 path weights 與合併後 bucket weights。

學習者能操作的變數：
調整 P(H) 10%–90%，並聚焦某個 output value。

操作時保持不變的東西：
八條完整 paths 與 X=count H 的 mapping rule。

預測 → 回饋 → 壓縮：
先預測 p 增大後 mass 往左或往右移；再看每條 path weight 與 bucket 同步重分配；最後留下「distribution = push weights through X」。

正式內容放在哪個展開層：
pushforward distribution、P(X=x) 的 preimage sum 與 biased independent paths 的乘積。

最後如何檢查能否遷移：
抽卡牌後以 X=牌面點數分類，要求說明同點數的不同花色 weights 如何合併。
```

### Step 2 — PMF 是 discrete values 的 point-mass lookup

```text
核心 insight：
機率質量函數（probability mass function, PMF）替每個 discrete value 記錄它直接承接多少 probability mass；單一點可以有正 probability，所有 bars 的高度總和必須是 1。

學習者原本可能怎麼誤解：
把 histogram 的視覺慣例帶進來，誤以為 PMF bar 的寬度或面積才是 probability；或認為兩骰 sum 的 2 與 7 因為都只是「一個數字」所以等可能。

第一個具體問題：
兩顆公平有序骰子的 sum S，S=2 與 S=7 哪個更可能？

主要視覺模型：
36 個 ordered outcomes 依 sum 聚成 2–12 的垂直 mass stacks；點選 value 後，對應 paths 展開，bar height 與 preimage count 一一對應。

學習者能操作的變數：
選擇 sum value 2–12，切換 compact bars／show incoming outcomes。

操作時保持不變的東西：
36 個等重 outcomes，每個 weight 都是 1/36。

預測 → 回饋 → 壓縮：
先在 2 與 7 間預測；展開後看到 1 path 對 6 paths；最後壓縮成「PMF 的高度就是該 discrete point 的 mass」。

正式內容放在哪個展開層：
p_X(x)=P(X=x)、非負與 Σp_X(x)=1。

最後如何檢查能否遷移：
詢問一顆公平骰子的 even indicator 為何只有 value 0、1，且兩點各承接 1/2。
```

### Step 3 — CDF 是 threshold 左側的累積重量

```text
核心 insight：
累積分布函數（cumulative distribution function, CDF）F(t) 回答「X 不超過 threshold t 的 probability」；threshold 往右移只會納入更多世界，因此 CDF 不可能下降。

學習者原本可能怎麼誤解：
把 CDF 的高度誤認為「剛好等於 t」的 probability，或期待它像 PMF 一樣上下起伏。

第一個具體問題：
兩骰 sum S 的 threshold 放在 7，F(7) 是 P(S=7) 還是 P(S≤7)？

主要視覺模型：
上方 PMF bars 被一條可移動 threshold 掃過；被掃過的 bars 流入 cumulative tank。下方同步畫出 staircase，游標停在目前 F(t)。

學習者能操作的變數：
以 slider 或鍵盤移動 integer threshold 1–12。

操作時保持不變的東西：
原本的 PMF weights；CDF 只是重新回答「累積到哪裡」。

預測 → 回饋 → 壓縮：
先分辨 exact／at most；移動 threshold 看 tank 只增不減；最後留下「CDF = probability to the left」。

正式內容放在哪個展開層：
F_X(t)=P(X≤t)、單調不減、右連續、兩端極限與由 CDF 取區間 probability。

最後如何檢查能否遷移：
用 delivery time 問 F(30)=0.8 的自然語言意義。
```

### Step 4 — PDF 的高度是 density，probability 要看 interval area

```text
核心 insight：
機率密度函數（probability density function, PDF）的高度描述每單位寬度附近塞了多少 probability；continuous variable 的單點沒有寬度，因此單點 probability 為 0，區間下的 area 才是 probability。

學習者原本可能怎麼誤解：
看到 f(5)=0.16 就說 P(X=5)=0.16，或把曲線的 y-value 當成 discrete PMF bar。

第一個具體問題：
等待時間 X 均勻落在 0–10 分鐘，density 是 0.1；那麼 P(X=5) 是否等於 0.1？

主要視覺模型：
0–10 的 uniform density rectangle；兩個 interval handles 選取寬度並直接將 area 分解成 width×height。切到 point mode 時選取寬度收縮為 0，area 同步歸零。

學習者能操作的變數：
調整 interval 左右端點，或切換 interval／exact point。

操作時保持不變的東西：
整體 density rectangle 與總面積 1。

預測 → 回饋 → 壓縮：
先判斷 curve height 是否等於 point probability；收縮選取區間看 area 消失；最後留下「PDF 看高度，probability 看面積」。

正式內容放在哪個展開層：
P(a≤X≤b)=∫_a^b f(x)dx、P(X=x)=0，以及 endpoint 對 continuous probability 無影響。

最後如何檢查能否遷移：
比較「正好 5.000… 分鐘」與「4.5–5.5 分鐘」哪一個能承接正 probability。
```

### Step 5 — Normalization 是總重量守恆，不是高度不得超過 1

```text
核心 insight：
合法 distribution 的總 probability 必須是 1；對 PMF 是 bar heights 相加，對 PDF 是整體 area。PDF 的局部高度可以大於 1，只要支撐區間夠窄、總面積仍為 1。

學習者原本可能怎麼誤解：
套用 probability ≤1 的規則，認為 PDF 任一高度也不能超過 1；或改變 support width 後忘記同步調整 density。

第一個具體問題：
X uniform on [0,0.5] 時 rectangle height 必須是多少，才能讓總 area 等於 1？height=2 是否違法？

主要視覺模型：
可伸縮的 uniform probability rectangle；support width W 改變時，高度自動變成 1/W。旁邊以固定容量的「1 unit mass」顯示 width×height 始終守恆。

學習者能操作的變數：
調整 support width 0.5–10，並可切換錯誤的 fixed-height model 對比漏掉或多出的總 mass。

操作時保持不變的東西：
normalized mode 的總 area 永遠是 1。

預測 → 回饋 → 壓縮：
先判斷 height=2 是否可能；縮窄 support 看 rectangle 變高但 area 不變；最後留下「probability 限制的是總重量，不是 density 的局部高度」。

正式內容放在哪個展開層：
Σp(x)=1、∫f(x)dx=1、density units 與 nonnegative condition。

最後如何檢查能否遷移：
給一個 [0,4] 上高度 0.4 的 rectangle，要求先以 area 1.6 判斷它尚未 normalized，而不是因 0.4≤1 就接受。
```

## 第十三章 storyboard

### Step 1 — Expectation 是重量中心，不一定是 possible outcome

```text
核心 insight：
期望值（expected value / expectation）是把 distribution mass 放在數線上後的 balance point；它概括整張 map，不是下一次最可能出現的數，也不必是 random variable 能取到的 value。

學習者原本可能怎麼誤解：
把「expected」理解成「我預期下一次就會看到」，或認為 expectation 必須等於某個 possible outcome。

第一個具體問題：
一張 ticket 有 90% 得 $0、10% 得 $100；最可能 outcome 是 $0，但它的公平平均價值在哪裡？

主要視覺模型：
0 與 100 的 probability masses 放在一根 number-line seesaw 上；fulcrum 自動移到 weighted balance point。數線上 10 沒有 outcome mass，卻正好平衡左右 torque。

學習者能操作的變數：
調整 jackpot probability 5%–50%，觀察 mass blocks 與 fulcrum 同步移動。

操作時保持不變的東西：
possible payouts 仍只有 0 與 100。

預測 → 回饋 → 壓縮：
先在 0、10、100 中預測 expectation；再看 seesaw 平衡；最後留下「most likely 看最高 mass，expectation 看整體 balance」。

正式內容放在哪個展開層：
E[X]=ΣxP(X=x)、continuous integral 與 LOTUS。

最後如何檢查能否遷移：
公平六面骰 expectation 3.5 雖不是可能點數，仍是 1–6 weights 的中心。
```

### Step 2 — 相同 expectation 不代表 distribution 長得相同

```text
核心 insight：
Expectation 只壓縮出一個 center；兩張 distribution maps 可以共享同一 balance point，卻有完全不同的集中程度與風險。

學習者原本可能怎麼誤解：
知道兩個選項 expectation 相同，就認為它們的 outcomes、穩定性與決策體驗也相同。

第一個具體問題：
A 保證得到 $50；B 有一半 $0、一半 $100。兩者 expectation 是否相同？哪一個更穩定？

主要視覺模型：
兩條同步 number lines：A 的所有 mass 疊在 50；B 的 mass 分居 0、100。共用垂直 balance marker 50，但以不同 span ribbon 顯示散開程度。

學習者能操作的變數：
切換 guaranteed／split risk，或拖動 risk spread 而保持 center 50。

操作時保持不變的東西：
總 mass 1 與 expectation 50。

預測 → 回饋 → 壓縮：
先判斷 equal expectation 是否代表 same gamble；拉開兩端 mass 看 fulcrum 不動；最後留下「center 相同，不代表 shape 相同」。

正式內容放在哪個展開層：
degenerate distribution、mean-preserving spread 與此處尚未定義的 risk measure 預告。

最後如何檢查能否遷移：
比較每天固定 10 requests 與一半 0、一半 20 requests，指出相同 mean 不能描述 workload variability。
```

### Step 3 — Linearity 不需要 independence

```text
核心 insight：
期望值的線性（linearity of expectation）表示對每個 scenario 先做 X+Y 再取 weighted center，等於分別找 X、Y centers 後相加；X、Y 如何 dependent coupling 不會破壞這個關係。

學習者原本可能怎麼誤解：
因為 probability 的乘法常需要 independence，便以為 E[X+Y]=E[X]+E[Y] 也需要 independent。

第一個具體問題：
四個等重 scenarios 中 X values 固定為 0、0、2、2；Y values 為 0、0、3、3。若把 Y rows 重新配對成 3、3、0、0，total distribution 改變後 expectation 會改嗎？

主要視覺模型：
四張 scenario cards 並排顯示 X chip、Y chip 與 X+Y stack。切換 together／opposite coupling 時，Y chips 垂直重排；下方三個 balance readouts 顯示 E[X]、E[Y]、E[X+Y]。

學習者能操作的變數：
切換 positive coupling／negative coupling。

操作時保持不變的東西：
X marginal values、Y marginal values 與各自 expectation。

預測 → 回饋 → 壓縮：
先預測重新配對是否改變 total expectation；看到 total outcomes 從 0/5 變成全為 2/3，但 center 都是 2.5；最後留下「averaging commutes with addition」。

正式內容放在哪個展開層：
E[X+Y]=E[X]+E[Y] 的 finite-sum proof、E[aX+b] 與何處才需要 independence。

最後如何檢查能否遷移：
不用知道各 indicator 是否 independent，也能用 sum of expectations 求一群人中預期成功數。
```

### Step 4 — Variance 是離 center 的平均 squared distance

```text
核心 insight：
變異數（variance）不重新找中心，而是固定 expectation 後，測量 probability mass 離中心有多遠；raw signed deviations 會互相抵消，因此使用 squared distance 讓兩側都貢獻正 spread。

學習者原本可能怎麼誤解：
直接平均 X−μ 來衡量 spread，或把 variance 當成「另一種平均值」而沒看到距離平方與 units 的意義。

第一個具體問題：
一半 mass 在 μ−d、一半在 μ+d。平均 signed deviation 是多少？d 從 1 拉到 4 時，它為何仍然看不出 spread？

主要視覺模型：
中心 μ=5 固定；兩個 mass blocks 對稱移動。上層 signed arrows 一正一負相消，下層把 distance 折成 square tiles，總 area 隨 d² 成長。

學習者能操作的變數：
調整 spread d=0–5。

操作時保持不變的東西：
expectation μ=5、左右各 50% mass。

預測 → 回饋 → 壓縮：
先嘗試平均 signed deviations；拉開 masses 看其永遠為 0；切換 squared view 看 variance 隨 spread 成長；最後留下「variance = average squared distance from μ」。

正式內容放在哪個展開層：
Var(X)=E[(X−μ)²]、E[X²]−μ²、standard deviation 與 units。

最後如何檢查能否遷移：
比較兩組相同 mean 的 delivery times，要求只憑離中心 distances 判斷哪組 variance 較大。
```

### Step 5 — Covariance 是兩個 centered deviations 的平均 signed area

```text
核心 insight：
共變異數（covariance）看 X、Y 是否傾向一起高於或低於各自 mean；每個 point 的 centered horizontal 與 vertical deviations 相乘，得到正、負或零的 signed rectangle。

學習者原本可能怎麼誤解：
把 covariance 當成圖看起來是否接近直線，或認為 covariance=0 就代表 independent。

第一個具體問題：
相對中心而言，右上與左下 points 為何都對 positive covariance 作正貢獻，而右下與左上作負貢獻？

主要視覺模型：
scatter plane 以 E[X]、E[Y] 畫十字中心；選擇 positive／negative／zero pattern，每個 point 與中心形成帶正負紋理的 rectangle，下方 balance bar 平均 signed areas。

學習者能操作的變數：
切換 positive、negative、zero covariance datasets，並點選 point 查看其 signed contribution。

操作時保持不變的東西：
crosshair 代表各變數自己的 center；判號規則固定為 centered deviations 的乘積。

預測 → 回饋 → 壓縮：
先用 quadrant 預測 contribution sign；切換 pattern 看平均 signed area；最後留下「same-direction deviations positive，opposite-direction negative」。

正式內容放在哪個展開層：
Cov(X,Y)=E[(X−μX)(Y−μY)]、E[XY]−E[X]E[Y]、units 與 zero covariance 不推出 independence 的反例。

最後如何檢查能否遷移：
用溫度與暖氣用量的 negative pattern，要求從相對 means 的方向解釋符號，而不是背情境關鍵字。
```

## 第十四章 storyboard

### 本章不是 distribution zoo

第十四章只保留一台會重複輸出 Yes／No 的實驗機。八個小節不是依序背四個 distribution 的名稱，而是逐次改變：

1. 如何把一次結果記錄成數字；
2. 實驗要重複固定次數，還是等到某件事發生才停止；
3. 保留完整順序，還是只留下成功次數；
4. 每次機會是否相同、彼此是否獨立。

因此 Bernoulli、Binomial、Geometric、Negative Binomial 是同一個 probability world 在不同「觀察鏡頭」下留下的 measurements。全章逐步長出第一條 distribution family map：

```text
Repeated Bernoulli trials
├─ fixed n + count successes ──→ Binomial
└─ stop at success
   ├─ first success ───────────→ Geometric
   └─ r-th success ────────────→ Negative Binomial
```

### Step 1 — Bernoulli 是把一個 Yes／No 問題編碼成 1／0

```text
核心 insight：
Bernoulli trial 不是「硬幣公式」，而是一次只有目標發生／未發生的實驗；把目標結果編成 1、另一個編成 0，才能讓之後的「成功總數」直接由加法得到。

學習者原本可能怎麼誤解：
以為 Bernoulli 只適用於 50/50 的硬幣，或把 success 理解成道德上的成功，而不是研究者指定的 target event。

第一個具體問題：
一筆付款有 72% 成功。若我們關心「付款成功」，這次 outcome 要如何變成可以相加的數字？

主要視覺模型：
一台單次 Yes／No generator；p 決定左右兩扇出口寬度，按下 RUN 後 marker 落到 1 或 0。改變 target 可看到 success 只是標籤，不必是較可能或較好的結果。

學習者能操作的變數：
調整 success chance p，並切換 payment／defect 情境。

操作時保持不變的東西：
一次 trial 只有兩個互補 outcomes，兩邊 probability 合計為 1。

預測 → 回饋 → 壓縮：
先判斷 72% 是否代表公平硬幣；再調 p 看出口改變但 1/0 encoding 不變；最後留下「Bernoulli = one binary question, not necessarily 50/50」。

正式內容放在哪個展開層：
X∈{0,1}、P(X=1)=p、P(X=0)=1−p、E[X]=p、Var(X)=p(1−p)。

最後如何檢查能否遷移：
伺服器是否逾時可視為 Bernoulli trial；只要先說清楚 1 代表 timeout 還是正常回應。
```

### Step 2 — 重複 n 次後，真正的 outcomes 是完整序列

```text
核心 insight：
固定重複 n 次 Bernoulli trials 時，樣本空間先由所有有順序的 0/1 sequences 組成；「成功幾次」是稍後才套上的 measurement，不是原始 outcome。

學習者原本可能怎麼誤解：
看到三次 trials 就直接說 outcomes 只有 0、1、2、3，因而漏掉 HHT、HTH、THH 是不同歷史。

第一個具體問題：
三次付款結果中的 110、101、011 都有兩次成功；它們是同一個 outcome，還是三個會被同一 measurement 合併的 outcomes？

主要視覺模型：
可調深度的 binary path tree；每走一步 append 1 或 0，終點顯示完整 sequence 與 path weight。

學習者能操作的變數：
調整 n=1–5、p，hover／focus 一條 path。

操作時保持不變的東西：
每一層都是同一個 p 的 trial，sequence order 被完整保留。

預測 → 回饋 → 壓縮：
先猜 n=3 有幾個完整 outcomes；展開 tree 看 2³ 個 leaves；最後留下「先生成 sequence，再決定要量什麼」。

正式內容放在哪個展開層：
Ω={0,1}ⁿ、independent path probability 與 product rule。

最後如何檢查能否遷移：
要求指出 010 與 100 為何是不同 outcomes，卻可有相同 success count。
```

### Step 3 — Binomial 是把許多序列壓縮成一個 count

```text
核心 insight：
二項分布（Binomial distribution）不是另一台隨機機器；它是對固定 n 次 Bernoulli sequence 套用 X=成功總數後，將相同 count 的 path weights 收進同一個 bucket。

學習者原本可能怎麼誤解：
只背 C(n,k)p^k(1−p)^(n−k)，看不到 combination 在數哪些 paths，也看不到每條 path 為何同重。

第一個具體問題：
n=4 時，bucket X=2 的重量為什麼不是只算 1100 這一條 path？

主要視覺模型：
左側列出全部 2ⁿ sequences；按 success count 排序後，cards 動畫流入右側 0…n buckets。選定 k 時只高亮 C(n,k) 條 paths。

學習者能操作的變數：
選擇 bucket k，並調整 p。

操作時保持不變的東西：
sequence space 不變；改變的是每條 path 的 weight 與 buckets 的總重量。

預測 → 回饋 → 壓縮：
先猜 X=2 有幾條 histories；再把六條 cards 收進同一 bucket；最後留下「Binomial probability = paths per bucket × weight per path」。

正式內容放在哪個展開層：
P(X=k)=C(n,k)pᵏ(1−p)ⁿ⁻ᵏ 與 C(n,k) 的組合解釋。

最後如何檢查能否遷移：
不用公式，先列出三次 trials 中 exactly two successes 的三條 histories。
```

### Step 4 — n 與 p 是生成規則，不是 curve 樣式旋鈕

```text
核心 insight：
p 改變每一步偏向哪個出口，因此把 count 的 center 拉向 np；n 增加可累積的機會，也改變 count scale 與相對集中程度。PMF shape 是生成機制的後果，不是需要背的圖形名稱。

學習者原本可能怎麼誤解：
靠「鐘形、右偏、左偏」辨認 Binomial，或看到 mean=np 就誤以為 X 通常一定等於 np。

第一個具體問題：
把 p 從 0.2 拉到 0.8，哪一個 count bucket 會成為新的重量中心？若 n 變大，count 的絕對 spread 與 success proportion 的 spread 是否做同一件事？

主要視覺模型：
即時計算的 Binomial PMF bars；上方保留 n 個小 Bernoulli cells，下方標出 balance point np 與 one-standard-deviation ribbon。

學習者能操作的變數：
調整 n=2–30、p=0.05–0.95，並可切換 count X 與 proportion X/n 的橫軸。

操作時保持不變的東西：
固定 n、same p、independence、只計 success count 的生成假設。

預測 → 回饋 → 壓縮：
先預測 p 或 n 的影響；再比較 count／proportion view；最後留下「參數描述生成世界，shape 只是其投影」。

正式內容放在哪個展開層：
E[X]=np、Var(X)=np(1−p)，以及由 indicators 與 linearity 得到 mean。

最後如何檢查能否遷移：
解釋 n=100、p=0.7 的 np=70 是 balance point，不是保證正好 70 次。
```

### Step 5 — 四個條件少一個，就不應自動叫 Binomial

```text
核心 insight：
Binomial model 需要固定 trial 數 n、每次 binary、同一 success chance p、trials independent。資料最後同樣是一個 count，不代表生成機制符合 Binomial。

學習者原本可能怎麼誤解：
只要題目出現「成功幾次」就套 Binomial，忽略 p 漂移、不放回造成 dependence、共享環境造成 correlation 或提早停止。

第一個具體問題：
五筆付款都可能成功或失敗，但尖峰時段 p 逐筆下降；最後仍得到成功總數，為什麼不再是標準 Binomial？

主要視覺模型：
assumption console 有四盞指示燈；切換 changing p、shared outage、stop early、more than two outcomes，讓對應電路斷開並在 sequence machine 上顯示具體後果。

學習者能操作的變數：
選擇四種破壞情境。

操作時保持不變的東西：
輸出仍可能被記為某種 count，藉此隔離「資料型態」與「生成模型」的差異。

預測 → 回饋 → 壓縮：
先判斷 count 是否足以保證 Binomial；逐一破壞假設看警示；最後留下「先問世界如何生成，再挑 distribution」。

正式內容放在哪個展開層：
Bernoulli indicators iid 的說法、Poisson-binomial 作為 unequal p 的旁支，以及抽樣不放回的 hypergeometric 預告。

最後如何檢查能否遷移：
判斷一副牌不放回抽十張、計算紅牌數，哪個 Binomial 條件失效。
```

### Step 6 — Geometric：不先決定做幾次，而是等到第一次成功

```text
核心 insight：
幾何分布（Geometric distribution）仍使用相同的 independent Bernoulli generator；改變的只有 stopping rule：固定目標為第一次 success，trial count T 變成 random。

學習者原本可能怎麼誤解：
把 Geometric 當成無關的新公式，或混淆 T 是 failures 數還是包含成功那次的 trials 數。

第一個具體問題：
若 sequence 是 0001，等待第一次 success 的 T 是 3 還是 4？

主要視覺模型：
一條會延長的 trial tape；failures 讓 playhead 繼續前進，第一個 1 使 STOP gate 落下。下方每個可能 T 的 bar 由「前面全 fail、最後 success」拼成。

學習者能操作的變數：
調整 p，或逐格揭開預先固定的 sequence。

操作時保持不變的東西：
每次 trial 的 p 與 independence；只有觀察何時停止。

預測 → 回饋 → 壓縮：
先判斷 0001 的 T；逐格前進看 STOP；最後留下「Geometric = failures…then first success」。

正式內容放在哪個展開層：
P(T=t)=(1−p)ᵗ⁻¹p、support {1,2,…}，以及另一種從 0 開始計 failures 的 convention。

最後如何檢查能否遷移：
把 retry-until-success 的 API request 映成 T，說清楚 T 是否包含成功 request。
```

### Step 7 — Memorylessness：已經失敗多久，不會改變下一段等待機制

```text
核心 insight：
在 same p、independent trials 下，已知前 m 次全失敗，只是把 tape 前段剪掉；從現在開始等待第一次 success 的未來分布與一開始相同。這稱為 memorylessness。

學習者原本可能怎麼誤解：
認為「已經連敗很多次，下一次應該更容易成功」，把人類的補償直覺誤套到固定 p 的模型。

第一個具體問題：
公平硬幣已連續五次反面，第六次正面的 chance 變大了嗎？還要再等至少三次的 conditional chance 是否取決於已經等了五次？

主要視覺模型：
長 tape 左側 m 個 failures 被剪成灰色 history；按下 RESET VIEW 後，未來的 probability bars 與一條全新 tape 完全疊合。

學習者能操作的變數：
調整已經等待的 m 與未來門檻 s。

操作時保持不變的東西：
p 固定且 trials independent；若切換 fatigue mode 使 p 改變，疊合立刻失敗。

預測 → 回饋 → 壓縮：
先回答連敗是否讓下一次補償；比較兩張 tail bars；最後留下「history can be discarded only because the mechanism did not change」。

正式內容放在哪個展開層：
P(T>m+s | T>m)=P(T>s) 的推導，以及 memoryless discrete distribution 的特殊性。

最後如何檢查能否遷移：
指出零件老化使 failure chance 隨時間改變時，為何不能使用 memorylessness。
```

### Step 8 — 等第 r 次成功：同一條 tape 上串接多段等待

```text
核心 insight：
負二項分布（Negative Binomial distribution）把 stopping target 從 first success 改為 r-th success；一條 path 可切成 r 段「等到下一次 success」的 Geometric waits，因此它是 family map 的自然延伸。

學習者原本可能怎麼誤解：
被名稱中的 negative 誤導，或把「固定 n 問 success count」與「固定 r 問何時達標」混成同一問題。

第一個具體問題：
客服要累積第 3 筆成交才下班。固定的是今天打幾通電話，還是 success target？真正 random 的量是什麼？

主要視覺模型：
trial tape 上 success markers 像 checkpoints；r slider 移動終點 checkpoint，並用不同色段拆出每一次 success 前的等待。旁邊與 Binomial 的 fixed-n frame 並列。

學習者能操作的變數：
調整 r=1–4、p，並選取一條 sequence 查看分段。

操作時保持不變的東西：
same p、independent Bernoulli trials；只改停止所需的 success 數。

預測 → 回饋 → 壓縮：
先分辨 fixed n 與 fixed r；看 tape 在第 r 個 1 停下；最後留下「Binomial 固定時間窗、數成功；Negative Binomial 固定成功目標、數時間」。

正式內容放在哪個展開層：
P(T_r=t)=C(t−1,r−1)pʳ(1−p)ᵗ⁻ʳ、最後一格為 success 的組合解釋，以及 sum of r independent Geometric waits。

最後如何檢查能否遷移：
看到「第 5 位顧客購買出現在第幾位訪客」時，先指出固定量與 random quantity，再選模型。
```
