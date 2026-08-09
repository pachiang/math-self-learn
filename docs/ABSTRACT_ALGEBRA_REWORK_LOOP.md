# 抽象代數逐章重作 loop

## 為什麼要改工作方式

目前 Probability v2 有 19 章、102 個獨立 lesson components。每個小節先決定一個具體問題，再為該 insight 寫專屬 state、computed model、SVG／圖表與互動；同章後段會重用前段的視覺語言，但不是把內容塞進一個通用卡片模板。

Abstract Algebra v2 目前有 32 章、116 個 screens，但主要由一個通用 component 和資料 presets 生成。它足以驗證課程順序，卻還沒有 Probability v2 那種「每個概念長出自己的模型」的完成度。

## 從 Probability v2 抽出的品質基準

1. 一個小節只解一個 misconception；標題直接說出觀念轉折。
2. 第一個問題先迫使學習者預測，不能從 UI 樣式偷看到答案。
3. 互動變數就是概念中的變數，而不是任意動畫參數。
4. 畫面同時說清楚「什麼在變」與「什麼保持不變」。
5. 至少有一個動態 readout 會隨操作重新計算，不只切換事先寫好的文案。
6. 同章各節共用一個 mental model，後一節必須使用前一節建立的語言。
7. 反例與邊界不是附註，而是防止錯誤遷移的必要一節或 secondary layer。
8. 公式、定理、證明在直覺模型成立後才出現。
9. 每小節使用專屬 component；只共用無教學判斷的底層工具與視覺 tokens。
10. 完成不是 build 綠燈：還要在 1920×1080 實看、用鍵盤操作、檢查非色彩辨識與 reduced motion。

## 單章 checkpoint

每章嚴格依序走以下 loop；未通過第 7 步，不進下一章。

1. 讀 Probability v2 中最接近的教學案例，記錄它如何把 misconception 變成可操作問題。
2. 重讀本章前一章結尾與下一章開頭，決定本章唯一主線。
3. 逐節寫 storyboard：prediction、操作變數、視覺因果、invariant、transfer、formal layer。
4. 刪除或合併重複 insight；必要時改章節數，不保護既有 screen。
5. 用專屬 Angular components 實作；共用引擎只提供 primitives，不決定畫面敘事。
6. 內容審查：例子正確、術語首次出現有英文、沒有先公式後解釋。
7. 執行 build、route smoke test、1920×1080 screenshot、keyboard、non-color、reduced-motion 驗收。
8. 在下方紀錄 checkpoint，才進下一章。

## 進度

| Chapter                                                    | 狀態        | 本章主線                                                                                            | 驗收紀錄                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ch1 狀態不是動作                                           | passed      | state 是目前配置；action 是整個 state space 上的 mapping                                            | 4 個專屬 components；production build；4 routes 1920×1080；CDP 實測 mapping／builder／structure switch／3-step cycle；native keyboard controls；reduced-motion CSS                                                                                                                                                                                                      |
| Ch2 動作的合成                                             | passed      | 一段 action history 可依序執行，也可壓成一個 composite action                                       | 3 個專屬 components；development／production build；3 routes 1920×1080；CDP 實測 prefix mapping／order counterexample／two-step table recorder；keyboard focus；非色彩文字狀態；reduced-motion                                                                                                                                                                          |
| Ch3 停留、撤銷與資訊                                       | passed      | 可逆世界中的路可以停留、折返與回溯，來源不會永久合併                                                | 4 個專屬 components；development／production build；4 routes 1920×1080；CDP 實測 whole-world identity／two-sided inverse／cancellation side／information fibers；keyboard focus；非色彩 verdict；reduced-motion                                                                                                                                                         |
| Ch4 括號不改變 action chain                                | passed      | associativity 是同一條 ordered tape 的 lossless chunking                                            | 3 個專屬 components；development／production build；3 routes 1920×1080；CDP 實測 bracket frame／regroup-vs-reorder witnesses／pointwise same path；Ch3 proof debts repaid；keyboard focus；non-color text；reduced-motion                                                                                                                                               |
| Ch5 世界必須對操作封閉                                     | passed      | closure 是 set + operation 對所有 input pairs 的 no-escape 承諾                                     | 3 個專屬 components；development／production build；3 routes 1920×1080；CDP 實測 escape pair／set-operation slot swap／sample-vs-counterexample-vs-exhaustion；keyboard focus；non-color verdict；reduced-motion                                                                                                                                                        |
| Ch6 四條條件是一份契約                                     | passed      | group axioms 是四條互不替代的 failure-prevention wires                                              | 3 個專屬 components；development／production build；3 routes 1920×1080；CDP 實測 contract cut／matrix audit／跨 world symbol translation；keyboard focus；non-color verdict；reduced-motion                                                                                                                                                                             |
| Ch7 少數按鈕走遍世界                                       | passed      | generators 是從 identity 展開 reachability 的可重用 action vocabulary                               | 4 個專屬 components；development／production build；4 routes 1920×1080；CDP 實測 BFS reachability／shortest witnesses／two-word evaluation／contract closure wave；keyboard focus；non-color states；reduced-motion                                                                                                                                                     |
| Ch8 Relations 是閉合回路                                   | passed      | relation 是可插入或刪除而不改變 effect 的 closed path equality                                      | 4 個專屬 components；development／production build；4 routes 1920×1080；CDP 實測 loop tape／traceable rewrite／order-swap endpoints／presentation folding；修正 path-label regression；keyboard focus；non-color stamps；reduced-motion                                                                                                                                 |
| Ch9 重複動作形成週期                                       | passed      | element order 是同一 action 從 identity 第一次正回返的時間                                          | 4 個專屬 components；development／production build；4 routes 1920×1080；CDP 實測 first return／orbit-vs-world／cyclic existence scan／dynamic gcd partition；keyboard focus；non-color cycle labels；reduced-motion                                                                                                                                                     |
| Ch10 Isomorphism：同一結構的不同名字                       | passed      | 同構是可逆、無損且保運算的結構翻譯                                                                  | 4 個專屬 components；development／production build；4 routes 1920×1080；CDP 實測 relabel collision／commuting-square witness／three-gate diagnostics／invariant rejection；keyboard focus；non-color verdict text；reduced-motion                                                                                                                                       |
| Ch11 Subgroups：封閉子機器                                 | passed      | subgroup 是 ambient group 內能靠自己完成 operation 與 undo 的子世界                                 | 4 個專屬 components；development／production build；4 routes 1920×1080；CDP 實測 boundary escapes／exhaustive ab⁻¹ scan／S₃ closure waves／inclusion navigation；no horizontal overflow；keyboard focus；non-color state labels；reduced-motion                                                                                                                         |
| Ch12 Cosets：整塊平移 subgroup                             | passed      | coset 是 subgroup 經可逆平移得到的等形 tile                                                         | 4 個專屬 components；development／production build；4 routes 1920×1080；CDP 實測 whole-tile translation／reversible bijection／same-or-disjoint snap／partition sorting；no horizontal overflow；keyboard focus；non-color membership labels；reduced-motion                                                                                                            |
| Ch13 Lagrange：整除來自等大鋪磚                            | passed      | subgroup order 的整除是 coset partition 的計數影子                                                  | 4 個專屬 components；development／production build；4 routes 1920×1080；CDP 實測 delayed counting equation／index lens／element-cycle tiling／one-way divisor filter；no horizontal overflow；keyboard focus；non-color verdict text；reduced-motion                                                                                                                    |
| Ch14 Homomorphism：保結構的壓縮                            | passed      | homomorphism 可合併 elements，但不可改寫 operation                                                  | 3 個專屬 components；development／production build；3 routes 1920×1080；CDP 實測 collision-vs-preservation／36-square universal scan／identity-inverse-power consequences；no horizontal overflow；keyboard focus；non-color SAME／SPLIT 與 verdict text；reduced-motion                                                                                                |
| Ch15 Image 與 kernel：壓縮留下什麼                         | passed      | image 是實際抵達的結構，kernel 是被壓到 identity 的差異                                             | 4 個專屬 components；development／production build；4 routes 1920×1080；CDP 實測 partial-vs-complete image／12-base invisibility scan／nonempty-vs-empty fibers／four injective-surjective combinations；no horizontal overflow；keyboard focus；non-color labels；reduced-motion                                                                                       |
| Ch16 Normal subgroup：座標改變後仍不可見                   | passed      | 可被 quotient 忘掉的差異必須在 conjugation 下保持同一團                                             | 3 個專屬 components＋D₃ 共用運算模型；development／production build；3 routes 1920×1080；CDP 實測 srs=r²／normal-vs-split left-right cosets／18-cell normal與12-cell non-normal scans；no horizontal overflow；keyboard focus；non-color labels；reduced-motion                                                                                                         |
| Ch17 Quotient group：把整桶當成新 element                  | passed      | normality 讓 coset representatives 的選擇不污染新 operation                                         | 4 個專屬 components；development／production build；4 routes 1920×1080；CDP 實測 6→2 coset compression／normal SAME vs non-normal AMBIGUOUS representative swap／canonical projection square／kept-vs-lost information；no horizontal overflow；keyboard focus；non-color verdicts；reduced-motion                                                                      |
| Ch18 First isomorphism theorem：壓縮藍圖                   | passed      | 任意 homomorphism 先按 kernel 分桶，再與 image 無損對齊                                             | 3 個專屬 components；development／production build；3 routes 1920×1080；CDP 實測 collision-kernel-coset 三向同步／4→4 induced bijection／Z12、D3、zero-map factorization；no horizontal overflow；keyboard focus；non-color verdicts；reduced-motion                                                                                                                    |
| Ch19 Permutation：可逆重排是 action                        | passed      | permutation 是對整個有限集合的可逆重新指派，不是靜態排列圖樣                                        | 3 個專屬 components＋permutation 共用模型；development／production build；3 routes 1920×1080；CDP 實測 bijection-vs-hole-collision gate／p∘q vs q∘p endpoints／S3 six-card closure與order swap；no horizontal overflow；keyboard focus；non-color labels；reduced-motion                                                                                                |
| Ch20 Cycles 與 parity：重排的可讀骨架                      | passed      | cycle 分解把 wiring 壓成不相交 closed orbits，parity 是 transposition 表示下不變的二分結構          | 4 個專屬 components＋cycle/permutation 共用模型；development／production build；4 routes 1920×1080；CDP 實測 closed orbit 與 fixed point／`(A B C)(D E)(F)` extraction／`k−1` swap mappings／364-word even-odd scanner；no horizontal overflow；keyboard focus；non-color labels；reduced-motion                                                                        |
| Ch21 Cayley theorem：群成為 permutation group              | passed      | left translation 把 abstract multiplication 變成 faithful permutation action                        | 3 個專屬 components＋D₃ 共用模型；development／production build；3 routes 1920×1080；CDP 實測 6-output bijective wiring／`L_g∘L_h=L_gh` 全六狀態掃描／identity witness 與 6/6 distinct cards；no horizontal overflow；keyboard focus；solid／dashed non-color labels；reduced-motion                                                                                    |
| Ch22 同一群可以操作不同世界                                | passed      | action 是把每個群元素翻譯成觀察世界上的 permutation；換世界會改變可見資訊                           | 4 個專屬 components＋D₃ multi-world/action detector 共用模型；development／production build；4 routes 1920×1080；CDP 實測 external-state translator／6-2-1 visible cards／三種 kernels 與 faithful verdicts／valid-nonfaithful、identity failure、composition failure witnesses；no horizontal overflow；keyboard focus；solid／dashed non-color labels；reduced-motion |
| Ch23 Orbit 與 stabilizer：兩個掃描方向                     | passed      | 固定 point 掃 actors 得 orbit；固定 point 掃 actors 的不動者得 stabilizer，兩者回答不同問題         | 4 個專屬 components＋scene orbit/stabilizer 共用模型；development／production build；4 routes 1920×1080；CDP 實測 vertex／center orbits、vertex／center stabilizers、action-table typed readings、`{e,s}→{e,r²s}` conjugation transport；no horizontal overflow；keyboard focus；solid／dashed non-color labels；reduced-motion                                         |
| Ch24 Orbit–stabilizer：reachability 與 local symmetry 守恆 | passed      | action map 的 fibers 是 stabilizer cosets，因此每個 reachable point 消耗同樣多 actors               | 3 個專屬 components＋D₃ fiber/coset 模型；development／production build；3 routes 1920×1080；CDP 實測三個 equal fibers、`6=3×2`／`6=1×6` conservation、cube 6×4=24 rotation addresses；no horizontal overflow；keyboard focus；pattern／border non-color labels；reduced-motion                                                                                         |
| Ch25 Conjugation：同一動作換觀察座標                       | passed      | `khk⁻¹` 是把 h 搬進新 frame；conjugacy class 是所有 re-framings，center 是對全部 frames 不變的 core | 3 個專屬 components＋D₃/C₄ conjugation model；development／production build；3 routes 1920×1080；CDP 實測 `rsr⁻¹=r²s` coordinate pipeline、rotation/reflection classes、`Z(D₃)={e}`／`Z(C₄)=C₄`；no horizontal overflow；keyboard focus；solid／dashed non-color labels；reduced-motion                                                                                 |
| Ch26 Centralizer 與 class equation                         | passed      | centralizer 是 conjugation stabilizer；class sizes 把 G 按 action type 分包並守恆                   | 3 個專屬 components＋D₃ centralizer/class model；development／production build；3 routes 1920×1080；CDP 實測 `C_G(s)={e,s}`、`3=6÷2` class-size packets、`6=1+2+3` class assembly；no horizontal overflow；keyboard operation／focus；pattern／border non-color labels；reduced-motion                                                                                  |
| Ch27 Burnside：用 fixed points 數 symmetry classes         | passed      | 以 action incidence table double-count fixed pairs，讓 orbit count 浮現為平均 fixed-point 數        | 4 個專屬 components＋C₄ binary-necklace model；development／production build；4 routes 1920×1080；CDP 實測四次 rotation 與 distinct orbit 分離、row totals `16+2+4+2=24`、6 個等重 orbit buckets、`n=6,k=2` 得 14 necklaces／`n=4` 得 6；no horizontal overflow；keyboard focus 3px solid；border／符號／文字 non-color labels；lesson reduced-motion `0.00001s`        |
| Ch28 Direct product：兩個獨立座標組成一個群                | passed      | direct product 是獨立座標網格；每軸各自更新，整體週期由兩軸同步決定                                 | 4 幕互動、數學分支、1920×1080、鍵盤、非色彩線索、dark theme、reduced motion、development／production build 均通過                                                                                                                                                                                                                                                       |
| Ch29 Cauchy theorem                                        | passed      | prime divisor 透過 cyclic packet counting，必然留下 nonidentity p-cycle                             | 5 幕互動、完整 tuple／packet 枚舉、1920×1080、鍵盤、非色彩線索、dark theme、reduced motion、development／production build 均通過                                                                                                                                                                                                                                        |
| Ch30 First Sylow theorem                                   | passed      | coset residue、normalizer quotient 與 lift 強制 p-subgroup 長到 p-part 上限                         | 真實 S₄ 模型、5 幕互動、數學分支、1920×1080、鍵盤／非色彩、dark theme、reduced motion、development／production build 均通過                                                                                                                                                                                                                                             |
| Ch31 Sylow distribution                                    | in progress | maximal p-subgroups 的 conjugacy 與數量限制                                                         | Ch30／Ch32 boundary review passed；5 幕 storyboard locked，尚未實作                                                                                                                                                                                                                                                                                                      |
| Ch32                                                       | pending     | 嚴格逐章處理                                                                                        | —                                                                                                                                                                                                                                                                                                                                                                       |

## Ch1 重作決策

Probability v2 Ch1 的強項不是元件數，而是三節都圍繞「模型權重、單次 outcome、長期 pattern」同一層級區分，且每節都有不同的可操作模型。抽象代數 Ch1 採相同策略，四節只圍繞「state、action、preserved structure」：

- 1.1：隱藏／顯示 labels，親手套用 triangle symmetries；外框相同不代表 action 相同。
- 1.2：從一條 arrow 補完整個 state-space mapping；action 不是局部移動描述。
- 1.3：對同一 square transformation 切換要保留的 structure；symmetry 是相對於 structure。
- 1.4：同步操作 triangle、clock、cards 三個 worlds；表面不同但 action rhythm 相同。

這四節將改為專屬 components，不再由 generic lesson renderer 產生。

## Ch2 重作決策

Ch1 已建立「action 是整個 state space 上的 mapping」。Ch2 只新增一件事：actions 可以依序執行，而整段 history 又能被壓成一個 composite action。Ch3 才正式命名 identity 與 inverse，因此本章不提前把 table patterns 變成定義課。

- 2.1：action-sequence compressor。學習者追加 `r`、`r²`、`s` chips，逐步追蹤 A、B、C，系統以完整 mapping 辨認六個 possible total effects。
- 2.2：robot pose order comparator。固定起點與兩個 actions，只交換順序；兩張 coordinate boards 同時計算 position 與 heading。
- 2.3：Cayley table recorder。cell 起初空白；學習者選 row／column，播放兩步 cycle，確認 net action 後才把結果寫入 table。

對照 Probability v2 Ch5／Ch6：先保留 root-to-leaf history 與 nested operations，再把重複結構壓縮成一個可查詢表示。Ch2 的 table 同樣是 action experiments 的 compression，不是先背的符號方格。

## Ch3 重作決策

Ch2 已讓學習者把 action histories 壓成 composite mappings。Ch3 沿用同一個 state-space model，研究哪些 mappings 允許停留與折返。四節不是四個名詞清單，而是一條「可逆性保留來源資訊」的因果鏈：

- 3.1：whole-world identity scanner。比較 `e`、非空 history `r³`、只固定 A 的 reflection 與 rotation；identity 是總效果，不是「沒有寫 action」，也不是一個 state 碰巧沒動。
- 3.2：two-sided undo tester。選 original action 與 candidate undo，同時檢查「先 original 再 candidate」和反向順序在所有 states 上是否都回原位。
- 3.3：cancellation tape。把 `a⁻¹` 接到兩條等式 paths 的左側或右側；只有與共同 prefix 相鄰的一側能折返，不能把 symbols 當字串擦掉。
- 3.4：information-fiber inspector。比較 reversible shuffle、sort 與 delete；output 的 possible sources 一旦多於一個，就不存在 universal undo。

對照 Probability v2 Ch16：先畫出 source → operation → output pipeline，再以 local compression 解釋 output 為何累積。Ch3 把同一視覺因果用在資訊上：多個 sources 若被壓到同一 output，來源身份便無法恢復。

本章刻意不完整證明 inverse uniqueness 與 cancellation。兩者的 symbol proof 都需要 associativity 重新加括號；本章只在具體 action composition 中建立操作直覺，並把 proof debt 明確交給 Ch4，避免先偷用下一章才要理解的公理。

## Ch4 重作決策

本章只處理一個觀念：associativity 是把同一條 ordered action tape 分成不同 chunks，既不換 action，也不換總效果。三節由具體 chunking 走到性質診斷，再走到 function composition 的原因：

- 4.1：bracket compressor。固定 `+1 → ×2 → square` 的 action order，只切換先壓前兩段或後兩段；raw state path 永遠保留在畫面上。
- 4.2：two-test bench。對 addition、subtraction、string concatenation 分開執行 regroup 與 reorder，讓兩條 boolean 結果由實際 operands 計算，而非由名詞卡片宣告。
- 4.3：pointwise pipeline。拖動任意 input x，同時追蹤兩種 parenthesization；兩側展開後都落在 `h(g(f(x)))`，因此 functions 相等。

Ch3 留下的 proof debt 在 4.3 secondary layer 償還：cancellation 與 inverse uniqueness 都把「重新加括號」標成明確一步，不再讓 associativity 隱形。

## Ch5 重作決策

本章不提前做完整 group detector，只建立 closure 與 universal evidence 的責任：

- 5.1：set-boundary machine。直接調整 input pair、set 與 operation；output 由實際 arithmetic 計算，畫面只判斷這一個 pair 是否 escape，並持續提醒「成功一格不是 proof」。
- 5.2：two-slot closure system。set slot 只提供 `ℤ`、`2ℤ`、`ℚ*`，operation slot 只提供 `+`、`×`；每個組合顯示 general reason 或一個 escape witness，讓 `(set, operation)` 成為不可拆的判斷單位。
- 5.3：evidence scanner。比較 infinite even-addition viewport、positive-subtraction counterexample 與 finite `ℤ₃` complete table；同一個 reveal interaction 會依 universe scope 產生「仍是 sample／已推翻／有限窮舉完成」三種不同結論。

這樣 Ch5 只教一個量詞觀念：closure 是 no-escape 的 universal statement。Ch6 才把 closure 與 associativity、identity、inverse 合併成完整 contract。

## Ch6 重作決策

舊 6.1「四條規則各阻止一種故障」與舊 6.3「拿掉一條失去一種能力」是同一個因果 insight，因此合併；本章由 4 screens 縮成 3 screens：

- 6.1：contract wire board。一次切斷 closure／associativity／identity／inverse 其中一條 wire，state-machine 當場顯示 output escape、bracket fork、missing standby loop 或 broken return arrow，以及因此失去的推理能力。
- 6.2：guided group audit。選 concrete system 後逐項執行四個 tests；每次揭露一份 witness 或 general reason，第一個 failure 已足以拒絕 group，但仍可繼續理解其餘能力。
- 6.3：concrete-to-abstract translator。切換 triangle symmetries、`ℤ₅` addition、nonzero rationals multiplication；點 `G`、`·`、`e`、`a⁻¹` 時只替換 concrete referent，abstract role 保持不變。

Near-group 的 semigroup／monoid 名稱只放 secondary map；主流程只追蹤少了哪條 wire、哪個可靠能力隨之消失。

## Ch7 重作決策

Ch6 已給出完整 group contract；Ch8 將研究「不同 paths 為何能有相同 effect」。Ch7 因此只建立兩個可以帶往後面的模型：從 identity 出發的 reachability，以及 word／effect 的分層。四節雖共用 node network，但操作問題刻意不同：

- 7.1：reachability wave。固定 `Z₈`，選 `+2` 或 `+3` 後逐層套用 generator 與 inverse；frontier、new nodes 與停止條件都由實際 BFS 計算。
- 7.2：generating-set mixer。切換 `Z₆` 中 `+1`、`+2`、`+3`，即時計算 reachable set 與每個 residue 的 shortest witness word；用一顆與多顆按鈕的反例拆掉「數量越多越會生成」的迷思。
- 7.3：two-word evaluator。分別編輯兩條 action histories，保留每一步 path，並把兩者 evaluation 到同一個六格 effect dock；字串不同仍可共享 endpoint。
- 7.4：contract closure wave。從 `Z₈` 的 seed `2` 或 `3` 出發，逐步補入 identity、missing inverse 與 missing composite；每個新 element 都標明是哪條 contract 強迫加入，直到最小穩定世界。

`cyclic group` 與 element order 留在 Ch9；一般 subgroup test 與 lattice 留在 Ch11。Ch7 secondary layer 只正式命名 generating set、word evaluation 與 generated subgroup，避免後章 insight 提前擠入主流程。

## Ch8 重作決策

Ch7 已讓 word 與 effect 分層；Ch9 才會把 repeated action 的「第一次回來」命名為 element order。Ch8 位在兩者之間，只研究 path equality 如何被看見與使用：

- 8.1：relation loop player。逐次執行 triangle rotation，保留完整 path chips 與目前 effect；只有 nonempty path 回到 `e` 時才蓋上 relation stamp。
- 8.2：relation rewrite bench。在 `r³=e` 下，把可見的 `rrr` window 實際折成 `e`，再用 identity law 刪除；word 每次變短，但 effect dock 由運算重新計算並保持不變。
- 8.3：order-swap comparator。translations 與 triangle rotation/reflection 共用兩條同步 lanes；只交換 action order，並以 coordinate 或整個 vertex labeling 判定 endpoints 是否相同。
- 8.4：presentation folder。讓 `r⁰,…,r¹¹` 的 word viewport 分別套用 no finite relation、`r³=e`、`r⁴=e`；同一批 words 動態收進不同 effect buckets，直接呈現 generators 與 relations 的分工。

Element order、fundamental period 與 gcd 公式留在 Ch9；Ch8 只把 relation 當 closed-loop equality、合法 rewrite 與 word-folding rule。

## Ch9 重作決策

- 9.1：first-return counter。切換 90° rotation、120° rotation、integer `+1`，逐次按同一 action；只有第一次正步數回到 identity 才停表，無限例子保留「尚未回返」而不假裝有限測試是證明。
- 9.2：orbit-vs-world lens。固定 `Z₆`，點 element `k` 後實際列出其 repeated-sum orbit，並排顯示 `ord(k)` 與 `|G|=6`。
- 9.3：cyclic scanner。比較 `Z₆` 與 triangle symmetry group 的候選 single buttons；coverage 由 powers 計算，whole-group verdict 使用「存在一顆覆蓋全部」而非「每顆都可以」。
- 9.4：gcd cycle splitter。可調 `n`、`k`，把所有 residues 依 `+k` orbit 分成帶編號 cycles；畫面同步計算 gcd、cycle 數與每條 cycle 長度，公式最後才從可見分割中壓縮出來。

Ch10 的 relabeling／isomorphism 不在本章提前命名；只在 secondary layer 提醒 finite cyclic worlds 與 modulo models 的連結。

## Ch10 重作決策

Ch9 已經讓學習者看見 ℤ₄ 與四次方根有相同的 cyclic 節奏；Ch11 才會開始研究 group 裡可獨立運作的小世界。Ch10 只回答一個問題：什麼時候兩個外表不同的 groups，其實是同一種 structure？四個畫面依序拆開必要條件與解題策略：

- 10.1 `Relabeling board`：同步播放 ℤ₄ 與角度／四次方根標籤，先建立「結構不住在名字裡」。故意撞名 preset 讓 bijection 的無損角色可見，但明說 bijection 尚不等於 isomorphism。
- 10.2 `Commuting-square checker`：同一對 inputs 走「先算再翻」與「先翻再算」兩條路。Natural map 全部 commute；scrambled bijection 產生具體 mismatch witness，將 homomorphism 與一對一配對徹底分開。
- 10.3 `Three-gate diagnostic`：把 injective、surjective、operation-preserving 逐道 reveal。Natural isomorphism、surjective projection、scrambled bijection 分別暴露不同 failure channel，最後才壓縮成 bijective homomorphism。
- 10.4 `Invariant fingerprint detector`：逐列比較 group size、commutativity、element-order multiset。任一 mismatch 立即排除；全部相同只標為 survives tests，不把 necessary conditions 誤教成 sufficient proof。

Subgroup、coset 與 normality 都不進入本章主流程。正式定義、inverse map 證明與 element-order invariant 證明留在 secondary layer，主畫面只承擔可操作的結構翻譯模型。

## Ch11 重作決策

Ch10 的任務是比較兩個完整 worlds；Ch12 才把 subgroup 當模板整塊平移。Ch11 只研究「一個 group 裡哪些 subsets 能自行運作」，不提前出現 coset tiles 或 index counting：

- 11.1 `Subworld boundary machine`：在 ℤ₆ 圈出候選 nodes，親手選 inputs 與 inverse，讓合法候選的 arrows 永遠留在邊界內，非法候選留下具體 escape witness。主 insight 是 subgroup 不等於 subset。
- 11.2 `ab⁻¹ scanner`：對 finite candidates 掃描所有 ordered pairs，逐格看 `a−b` 是否逃出。把 identity、inverse、closure 的三張清單濃縮成一個可追蹤 test，但 proof 固定留在 secondary layer。
- 11.3 `Seed closure wave`：在 S₃ 選 `r`、`f` 或兩者，逐輪顯示 identity、inverse 與 composites 為何被強迫加入。主 insight 是 seeds 唯一決定最小 stable world，不重教 Ch7 的 word mechanics。
- 11.4 `Inclusion lattice navigator`：點 ℤ₆ 的 subgroup nodes，分別標出 contained-by 與 contains paths；線條明標 inclusion，不讓學習者誤讀為 element multiplication 或生成時間。

Union failure、intersection proof、one-step subgroup test 的雙向證明全部放 secondary layer。主流程不談 coset、Lagrange、normal subgroup，確保每頁只承擔一個 insight。

## Ch12 重作決策

Ch11 已建立可自給自足的 subgroup boundary；Ch13 才把等大 tiles 轉成整除公式。Ch12 的四頁只建立平移與 partition 的因果鏈：

- 12.1 `Whole-tile translator`：選 subgroup H 與 shift g，逐點顯示 h↦g+h；所有內部 offsets 同步搬移，不把 g 誤當成只新增一個 element。
- 12.2 `Reversible transport`：逐條 reveal H↔g+H 的 forward／undo arrows，直接看出 translation 不 collision、不 omission，因此 tile 大小不變。
- 12.3 `Overlap snap detector`：比較 a+H、b+H；一旦找到共同 node，兩塊自動對齊為 SAME TILE，否則標成 DISJOINT，不容許 partial overlap。
- 12.4 `Partition sorter`：把 ℤ₁₂ elements 逐一吸入唯一的 ⟨4⟩ translate，最後驗收 no overlap／no leftovers；不在主流程寫 Lagrange counting equation。

Left／right coset 的 non-abelian 差異只作 boundary note，normality 留在 Ch16。相同大小、same-or-disjoint 與 partition 的證明留在 secondary layer。

## Ch13 重作決策

Ch12 已經證成 tiles 等大、互斥且覆蓋；Ch14 才進入允許資訊壓縮的 homomorphism。Ch13 只把既有 partition 讀成數量關係，並嚴格分開 theorem 與 converse：

- 13.1 `Equal-tile counter`：逐塊鋪滿 finite group，只在三項結構條件全亮後顯示 `每塊大小 × 塊數 = 全部大小`，讓整除從畫面長出來。
- 13.2 `Index lens`：在固定 ℤ₁₂ 切換 subgroups，tile size 變大時 distinct coset count 變小；`[G:H]` 只命名 tile count，不塑造成新運算。
- 13.3 `Element-cycle tiler`：先讓 a 生成 ⟨a⟩，再用該 cyclic subgroup 鋪群；把 `ord(a)∣|G|` 明確接回 Ch9 的 first return 與 Ch12 的 tiles。
- 13.4 `Divisor possibility filter`：不整除顯示 REJECTED；整除只顯示 NOT RULED OUT。主畫面不把 necessary condition 偽裝成 existence proof。

完整 Lagrange proof 與 corollary derivation 放 secondary layer。Cauchy theorem 只在 boundary 預告；A₄ 等 converse counterexamples 不提前要求尚未建立的分類技巧。

## Ch14 重作決策

Ch10 已用 commuting square 建立 structure-preserving 的基本語言，但目標是 bijective isomorphism；Ch15 才命名 image、kernel 與 fibers。Ch14 必須新增的直覺是「collision 可以是合法壓縮」，而不是重播 Ch10：

- 14.1 `Compression-vs-corruption lens`：並排比較 parity map 與 absolute-value summary。兩者都 collision；前者的 output operation 可完整預測 input composition，後者存在具體 mismatch。主 insight 是 injectivity 與 structure preservation 為不同軸。
- 14.2 `Universal commuting scanner`：對 finite residue representatives 逐 pair 掃描兩條 pipeline，明確區分 sample pass、all-pairs reason 與 single counterexample。Ch10 的 square 在此轉成 map debugging 工具，而非同構 gate。
- 14.3 `Role consequence conveyor`：從同一 homomorphism law 依序推出 identity、inverse、powers 的 output roles；cycle compression 顯示 image order 可縮短，避免把 homomorphism 誤當 isomorphism。

Image、kernel、injective/surjective diagnostics 留在 Ch15。正式 cancellation proof 與 power induction 放 secondary layer；主流程不提前命名 identity fiber。

## Ch15 重作決策

Ch14 已建立「many-to-one 仍可保 operation」；Ch16 才處理 kernel 為何在所有座標變換下穩定，並由此需要 normality。Ch15 固定使用同一個 homomorphism φ:ℤ₁₂→ℤ₈、φ(n)=2n，避免每頁重新解碼例子，只建立壓縮的兩個可見結構與兩個診斷器：

- 15.1：Reachability spotlight。逐一送入 domain elements，區分 codomain 的「允許輸出」與 image 的「實際可達輸出」；odd targets 保持明確的 UNREACHED 標籤。
- 15.2：Invisible-action tester。選 base x 與 candidate k，比較 φ(x+k) 與 φ(x)；k∈kernel 時，加入 k 對 target 完全不可見。
- 15.3：Fiber shifter。從 output 往回照亮 preimage；每個 nonempty fiber 都是 kernel 的一份平移，unreachable output 的 fiber 為空。
- 15.4：Two-gauge detector。用 kernel 是否只剩 identity 判斷 injective，用 image 是否填滿 codomain 判斷 surjective；兩個 gauges 必須分開讀。

Quotient multiplication、well-definedness 與 canonical projection 留在 Ch17；first isomorphism theorem 留在 Ch18。Normal subgroup 的 conjugation／left-right coset 條件不在本章主流程出現。

## Ch16 重作決策

Ch15 只看一個既有 homomorphism 的 kernel 與 fibers；Ch17 才真的把 cosets 當成新 elements 並定義 quotient multiplication。Ch16 必須回答中間的設計問題：「哪一種 subgroup 可以安全地代表要被遺忘的差異？」全章改用非交換的三角形對稱 D₃；若只用 cyclic／abelian 例子，left/right 與 conjugation 自動對齊，學習者看不到 normality 的工作。

- 16.1：Coordinate-change conveyor。以 sign map D₃→C₂ 的 rotation kernel 示範：不可見 action 經 g·h·g⁻¹ 改寫座標後仍不可見；kernel 因 homomorphism law 必然 normal。
- 16.2：Left/right coset mirror。比較 rotation subgroup 與 single-axis reflection subgroup；同一個 g 在左右分組結果可能 SAME 或 SPLIT，讓「normal = side choice 不影響 bucket」先成為可見現象。
- 16.3：Finite normality scanner。掃描所有 g∈G、h∈H 的 conjugates；一個 ESCAPED cell 足以推翻，完整 STAYS scan 才能驗證 finite candidate。

正式 quotient operation 與 representative independence 留在 Ch17。Conjugation proof 放 secondary layer；主流程不把 normal subgroup 教成需要死背的三個等價定義清單。

## Ch17 重作決策

Ch16 已證明 rotation subgroup R={e,r,r²} 在 D₃ 中 normal，並展示 non-normal mirror subgroup M={e,s} 的左右分岔；Ch18 才把任意 homomorphism 分解成 quotient 與 image。Ch17 只建造一個 quotient，並把 well-definedness 當成核心工程條件：

- 17.1：Coset compressor。把 D₃ 的六個 raw actions 分到 R 與 F 兩桶；quotient element 是整桶，不是任選的一個代表。
- 17.2：Representative swap bench。固定兩個 coset inputs，替換桶內 representatives；R 的 product bucket 不變，而 non-normal M 的同一 nominal product 可分岔。
- 17.3：Canonical projection square。π(g)=gR 只是丟掉桶內 detail；互動驗證 π(ab)=π(a)π(b)，並直接讀出 surjective 與 kernel=R。
- 17.4：Information dashboard。Quotient 保留 rotation/reflection parity，遺忘 exact pose；用問題是否能由 bucket 回答來區分 kept 與 lost information。

First isomorphism theorem 與 quotient-image 對齊留在 Ch18。正式 representative-independence proof 放 secondary layer；主畫面先讓「同一輸入桶不能因代表選法產生不同輸出桶」成為可操作的因果。

## Ch18 重作決策

Ch17 已建好 quotient operation；Ch19 將開啟 permutation 的新 Part。Ch18 是 Part III 收束，只回答任意 homomorphism 的壓縮為何必定等價於「按 kernel 分桶，再無損翻譯到 image」。全章回到 Ch15 的 φ:ℤ₁₂→ℤ₈、φ(n)=2n，讓學習者把既有 image／kernel／fiber 模型重新組裝成 theorem，而不是同時解碼新例子：

- 18.1：Collision fingerprint。選 a、b，同步比較 φ(a)=φ(b)、a−b∈ker φ 與是否落在同一 kernel coset；三種讀法必須同時切換。
- 18.2：Lossless induced map。左側原 map 是 12→4 many-to-one；先壓成四個 kernel cosets 後，induced map G/ker φ→im φ 成為 4→4 bijection，並保留 operation。
- 18.3：Factorization blueprint。以可切換 examples 顯示 G→G/ker φ→im φ↪H 四個角色；kernel 負責所有 collisions，image 排除 unreachable codomain，中央箭頭才是 isomorphism。

定理 statement、induced map well-defined／injective／surjective proof 放 secondary layer。主流程不把 `G/ker φ ≅ im φ` 當孤立公式，也不提前進入 permutation groups。

## Ch19 重作決策

Ch18 已結束 homomorphism／quotient 主線；Ch20 才把 permutation 拆成 cycles、transpositions 與 parity。Ch19 回到 Ch1 的 action-on-states 模型，但新增「有限集合上的所有可逆重新指派」：

- 19.1：Assignment gate。同步顯示 source→destination wires 與每個 destination 的 incoming count；只有每點恰一進一出時 inverse 才存在，contrast map 明確顯示 collision／hole。
- 19.2：Order pipeline。固定兩個可逆 reassignments，交換 `p∘q` 與 `q∘p` 的執行順序；同一 input 的 path 與 endpoint 同步更新，避免把 notation 當左到右文字。
- 19.3：S₃ action deck。攤開三個 objects 的全部六種 bijections；選兩張相乘後，result 必須仍落在 deck，並可定位 identity 與 inverse。

Cycle notation、disjoint-cycle decomposition、transposition parity 全留在 Ch20。正式 `S_n` 定義與 `n!` 計數放 secondary layer；主流程先把 symmetric group 看成完整可逆 action space。

## Ch20 重作決策

Ch19 已把 permutation 建成完整 bijective wiring；Ch21 才讓任意 group left-act on itself。Ch20 只建立讀懂一張 permutation 的內部骨架，順序不可倒置：

- 20.1：Single-orbit tracer。選 seed 並逐步重複套用同一 permutation，直到第一次返回 seed；cycle notation 是 closed path 的壓縮記錄，fixed point 是 length-1 cycle。
- 20.2：Disjoint-orbit extractor。對同一六點 wiring 逐次抽出尚未造訪的 orbit，得到 `(ABC)(DE)(F)`；不同 lanes 不共享 states，因此可獨立執行與交換順序。
- 20.3：Cycle-to-swap machine。改變 cycle length 並逐步展開 anchored transpositions；k-cycle 需要 k−1 個 swaps，composition order 與 endpoint wiring同步顯示。
- 20.4：Parity scanner。枚舉 S₃ 中長度 ≤5 的 transposition words，依 result permutation 分組；同一 result 只出現在全 even 或全 odd 的 length columns，讓 invariant 先由完整 bounded evidence 可見。

Parity 對所有 decompositions 的正式 proof 與 sign homomorphism 放 secondary layer。Cayley theorem、left translation 與 faithful embedding 留在 Ch21。

## Ch21 重作決策

Ch20 已讓學習者能把 permutation 看成可逆 wiring；Ch22 才把同一個群拿去作用在任意集合上，並討論 action 可能遺失哪些群元素。Ch21 只做 Cayley theorem 的一條因果鏈：群乘法本身就能製造 faithful permutations。

1. **Left translation factory**：選一個 `g ∈ D₃`，同步看見六條 `x ↦ gx` wiring。操作的是左乘者 `g`；不變的是每個輸入恰有一個輸出、每個輸出恰有一個來源。主 insight：每個群元素天然製造一張群底層集合上的 permutation。
2. **Multiplication-to-composition bridge**：先預測 `h` 後 `g` 會壓成 `gh` 還是 `hg`，再逐步掃過所有 `x` 比較 `L_g(L_h(x))` 與 `L_{gh}(x)`。主 insight：`g ↦ L_g` 不只列出 permutations，也把原本的 multiplication 原封不動搬成 composition。
3. **Identity witness / Cayley embedding**：比較任意兩張 `L_g`、`L_h`，只把 identity `e` 送進去就得到 `g`、`h`。主 insight：不同群元素不可能製造同一張 left translation，因此抽象群完整嵌入一個 symmetric group。

正式的 cancellation 論證、`L_g^{-1}=L_{g^{-1}}`、homomorphism proof，以及 `G ≅ L(G) ≤ Sym(G)` 放 secondary layer。任意 `G ↷ X`、kernel of an action、faithful／non-faithful actions 與「換觀察世界」全部留在 Ch22。

## Ch22 重作決策

Ch21 只看 left regular action `G ↷ G`，而且它永遠 faithful；Ch23 才固定一個 action，沿著「改變 point」與「改變 group element」兩個方向抽出 orbit／stabilizer。Ch22 專心回答中間缺口：同一個 abstract group 可以被翻譯成不同 state worlds 上的 permutations，而選擇 world 就是在選擇哪些結構可見。

1. **Action translator**：把 `g ∈ D₃` 接到三角形 vertices `X={0,1,2}`，看見 actor 與 acted-on state 是兩種不同物件。操作 `g` 與一個 vertex；不變的是 identity 不動、`gh` 的 action 等於先 `h` 後 `g`。主 insight：group action 是一份 preserving-composition 的翻譯字典 `G → Sym(X)`。
2. **Multi-world lens**：同一個 `g` 同步作用在 vertices、orientation 與 center 三個 worlds；三個面板分別只有 6、2、1 種可辨 actions。主 insight：群沒變，改的是觀察問題；不同 `X` 會顯露或遮蔽不同結構。
3. **Global invisibility scanner**：逐一掃描哪些 `g` 對某個 world 的每個 state 都不動，並把相同 action signatures 聚成 collisions。主 insight：action kernel 是該觀察世界遺失的資訊；faithful 等價於只有 identity 全域不可見。
4. **Action detector**：對四份候選 action recipes 分兩關檢查 identity law 與 composition law，失敗時給出具體 `g,h,x` witness；其中刻意包含 valid-but-nonfaithful recipe。主 insight：action 是否有效取決於結構是否一致，不取決於它是否保留所有群元素。

正式 action axioms、`G → Sym(X)` equivalence、kernel normality 與 faithful criterion 放 secondary layer。Orbit、point stabilizer、orbit partition 及 orbit–stabilizer counting 全留給 Ch23／Ch24。

## Ch23 重作決策

Ch22 比較不同 action worlds，kernel 問的是「哪些 actors 對整個 world 都不可見」；Ch24 才把 action fibers 辨認成 cosets 並推出 orbit–stabilizer 的 size relation。Ch23 固定一個 D₃ action 在「三角形 vertices＋center」上，只建立 point-level 的兩種問題與座標搬運。

1. **Reachability sweep**：選 seed point，依序讓全部 `g∈D₃` 作用並點亮 outputs。vertex seed 只能到三個 vertices，center seed 只能留在 center。主 insight：orbit 是一個 point 在所有 group moves 下的完整可達世界。
2. **Local symmetry filter**：固定 point，掃描每個 actor；只收集 `g·x=x` 的 cards。center 的 stabilizer 是全部 D₃，vertex 的 stabilizer只有 identity 與一個 reflection。主 insight：stabilizer 是保住這個 point 的 local symmetries，不等於對全世界無作用的 kernel。
3. **One table, two readings**：在同一欄 action table 中，orbit mode 收集 output points，stabilizer mode 收集讓 output 回到 seed 的 actor labels。主 insight：兩者使用同一批 experiments，但一個回答「去哪裡」，另一個回答「誰留下來」。
4. **Moving local frame**：用 mover `k` 把 basepoint `x` 搬到 `kx`，同步把每個 fixing actor `h` 變成 `khk⁻¹`。主 insight：同一 orbit 上的 local symmetry 沒有消失，只是跟著 observation point 做 conjugation transport。

Orbit partition、stabilizer subgroup proof 與 `G_{kx}=kG_xk⁻¹` proof 放 secondary layer。Action fibers、cosets、cardinality formula 與 counting 全留給 Ch24。

## Ch24 重作決策

Ch23 已把 orbit 與 stabilizer 分成「destinations」和「fixing actors」兩種讀法；Ch25 才把 conjugation 當成一般 coordinate sandwich，進入 conjugacy classes。Ch24 只回答一個 counting 問題：六個 actors 被 action map 分到 reachable destinations 時，為什麼每包一定一樣大？

1. **Action-fiber sorter**：固定 vertex `x=▲`，把六個 D₃ actors 依 `g·x` 分到三條 output lanes，得到 `{e,s}`、`{r,rs}`、`{r²,r²s}`。選任一 lane 的 representative `k`，看整包等於 `kGₓ`。主 insight：同一 destination 的所有 recipes 正好差一個 stabilizer move，所以 fibers 是 equal-size cosets。
2. **Conservation dashboard**：在 vertex seed（3 lanes×2 cards）與 center seed（1 lane×6 cards）間切換，把同一批 `|G|=6` cards 重新分包。主 insight：reachable destinations 越多，每個 destination 能容納的 invisible local choices 就越少；`|G|=|Orb(x)|·|Gₓ|` 是分裝守恆。
3. **Cube rotation counter**：不列舉 cube 的 rotations；先選 reference face 的 6 個 destinations，再選該 face 到位後的 4 種 twist。每個 `(destination, twist)` 唯一決定一個 rotation。主 insight：orbit–stabilizer 能把難數的 transformations 改寫成「去哪裡 × 到了以後還能怎麼轉」，直接得到 24。

Coset-fiber bijection proof、有限群 cardinality theorem 與 cube uniqueness argument 放 secondary layer。Conjugacy classes、centralizers 與 class equation 留給 Ch25／Ch26。

## Ch25 重作決策

Ch24 只在 transporting stabilizer 時短暫使用 conjugation；Ch26 才把 conjugation stabilizer 命名為 centralizer，並用 orbit–stabilizer 計算 class sizes。Ch25 把 conjugation 本身建立成可操作的 coordinate-change action。

1. **Coordinate sandwich**：選 frame mover `k` 與 action `h`，逐步執行「`k⁻¹` 搬回舊 frame → `h` 做原 action → `k` 搬回新 frame」，同時和單一卡 `khk⁻¹` 對照。主 insight：conjugation 不是任意三次相乘，而是在新 observation frame 重寫同一個 action。
2. **Re-framing orbit collector**：固定 `h`，讓 `k` 跑遍 D₃，收集所有 `khk⁻¹`。得到 identity class、rotation class 與 reflection class。主 insight：conjugacy class 是同一 internal action type 在所有 group frames 下可能呈現的 names，也就是 conjugation action 的 orbit。
3. **Global fixed-core scanner**：比較 D₃ 與 abelian C₄，對每個 `h` 掃過全部 frames `k`；只有對所有 k 都維持 `khk⁻¹=h` 的 cards 進入 center。主 insight：center 是不受任何 re-framing 影響的 global core；nonabelian group 可很小，abelian group 則全部在 center。

Conjugation action proof、conjugacy equivalence relation 與 center subgroup proof放 secondary layer。Centralizer、class-size formula 與 class equation 全留給 Ch26。

## Ch26 重作決策

Ch25 已把 conjugacy class 建成 conjugation orbit、center 建成 global fixed points；Ch27 才以 fixed-point incidence averaging 計數一般 action orbits。Ch26 只把 Ch23–Ch25 的 action tools套到 conjugation action，完成 class-size 與 class-equation 這條 counting 線。

1. **Commuting-frame filter**：固定 `h`，掃過全部 frames `k`；只有 `khk⁻¹=h` 的 cards 通過。主 insight：centralizer `C_G(h)` 正是 h 在 conjugation action 下的 stabilizer，也就是與 h commute 的 frames。
2. **Class-size packetizer**：把六個 frame cards 依 conjugate output 分成 equal fibers；對 `e`、`r`、`s` 分別得到 `1×6`、`2×3`、`3×2`。主 insight：`|Cl(h)|=|G|/|C_G(h)|` 是 orbit–stabilizer 的直接 specialization。
3. **Class-equation assembler**：把 D₃ 的 elements 依 conjugacy classes 拼成 singleton identity、two-rotation packet、three-reflection packet，總和 `6=1+2+3`；標出 singleton packets 正是 center。主 insight：class equation 是把整個群依「同一 action type under re-framing」做 partition accounting。

Centralizer subgroup proof、class-size formula proof 與 class equation 正式版本放 secondary layer。Burnside averaging、一般 fixed-point table 與 necklace counting 全留給 Ch27。

## Ch27 重作決策

Ch26 使用 conjugation action 的 orbit partition；Ch28 轉入 direct products，與 orbit counting 無直接依賴。Ch27 改用 `C₄` rotation 作用在 4-bead binary necklaces，從「16 個 labeled colorings 中有大量 rotation duplicates」出發，只建立 Burnside counting 的一條視覺因果鏈。

1. **Orbit target switch**：點選一個 4-bead coloring，依序旋轉並把重複 pictures 疊成一個 orbit packet。主 insight：當 rotations 視為相同時，要數的不是 16 個 raw objects，而是 6 個 reachable packets。
2. **Fixed-incidence table**：逐 row 揭露四個 rotations 固定了哪些 colorings，得到 row totals `16,2,4,2` 與 24 個 fixed pairs。主 insight：同一批 `(symmetry, object)` incidences 可以按 symmetry rows 計數。
3. **Orbit-bucket rebalance**：把同一批 24 incidences 從 symmetry rows 重排到 6 個 orbit buckets；每個 orbit 無論大小都恰貢獻 `|C₄|=4` incidences。主 insight：平均 fixed count 之所以等於 orbit count，是因為每個 orbit 在 double count 中都有相同總重量。
4. **Necklace cycle counter**：調整 bead count `n` 與 rotation step `k`，看 rotation 將 bead positions 綁成 `gcd(n,k)` 個 cycles；一個 fixed coloring 必須整個 cycle 同色，因此有 `2^gcd(n,k)` 個。主 insight：Burnside 把難數的 necklaces 轉成逐個 symmetry 數容易的 fixed objects，再平均。

Burnside lemma proof、`(1/|G|)Σ|Fix(g)|` 正式式子、cycle-count proof 與一般 q-color necklace formula放 secondary layer。Direct products 留給 Ch28。

驗收結果：四個 routes 在 1920×1080 均無水平 overflow。完整保留四次 rotation experiment 後，`0001` 顯示四個 distinct outputs，而 `0000` 顯示四次相同 output／orbit size 1；fixed-incidence table 得 row totals `16,2,4,2` 與 24 個 fixed cells；重排後 6 個 orbit buckets 各為 4 fixed pairs；cycle counter 對 `n=6,k=2` 得 2 cycles、4 fixed colorings、14 necklaces，切至 `n=4` 得 6 necklaces。鍵盤 focus 為 3px solid outline，資訊不只靠顏色，lesson subtree 在 reduced motion 下最大 transition 為 `0.00001s`。Development 與 production build 均通過；production 只保留專案既有 budget／unused-import warnings。

## Ch28 重作決策

Ch27 已結束 group-action counting；Ch29 將由 group order 的 prime divisor 逼出 element cycle。Ch28 不延續 Burnside，也不預教 Cauchy proof，而是把先前散落的 pair、commuting、element order 與 subgroup 知識收斂成一個核心模型：**direct product 是一張獨立座標網格；每個座標各自更新、各自復原，整體行為由兩軸同步決定。**

舊安排把 direct-product definition、order formula、internal product 與 cyclic criterion 並列成四個名詞主題，容易像四條規則。新安排改成同一張座標網格逐步加深；cyclic criterion 變成同步軌跡的可見結果，internal product 則是最後問「這張網格能否藏在一個既有群裡」。

1. **Product-grid builder**：調整 `m,n`，把 `C_m` 橫軸與 `C_n` 縱軸展成所有 ordered pairs。逐格點選可反查兩個 coordinates。主 insight：`G×H` 不是把兩份清單接起來，而是取每一種可能的 coordinate combination，所以大小相乘。
2. **Independent-axis composer**：在 `C₄×C₃` 選水平 move `a`、垂直 move `b`，交換執行順序並看 token 的兩條折線都抵達 `(x+a,y+b)`；同時顯示每一步只改寫一個 coordinate。主 insight：embedded axis moves `(a,0)` 與 `(0,b)` commute，不是因為原 groups 都 abelian，而是因為它們寫入不同 slots；任意 pair move 可分解成兩軸 moves。
3. **Synchronized-clock tracer**：選 `C_m×C_n` 與一個 pair step，逐步走訪 torus grid，直到兩個 clocks 同時歸零；並把 visited／unvisited cells 以實線、編號與文字區分。主 insight：pair order 是兩個 coordinate return times 的首次同步；當 generator clocks 互質時一條 orbit 才可能掃完整張 grid。`lcm` 公式與 `C_m×C_n` cyclic iff `gcd(m,n)=1` 放在操作後與 secondary layer，不先當口訣。
4. **Hidden-coordinate decoder**：比較三個 concrete candidates：`C₆` 中的 `⟨2⟩,⟨3⟩` 完整形成 `3×2` unique grid；`C₁₂` 的兩個小軸只覆蓋 6/12；`D₃` 的 rotation/reflection axes 雖覆蓋且不重疊，但交換順序會扭曲。三道 gates 分別顯示 no collision、full coverage、no cross-talk。主 insight：在既有群內辨認 direct product，就是確認每個 state 都有唯一 pair coordinates，而且兩軸互不干擾。

Direct product 的 group-axiom verification、projection／embedding homomorphisms、order formula proof、internal direct-product theorem 與 cyclic criterion proof都放 secondary layer。Semidirect product 只在 D₃ failure card 命名為下一種可能結構，不在本章展開；finite abelian group classification 與一般 CRT 留在後續課程。

驗收結果：四個 routes 在 1920×1080 均無水平 overflow。product grid 對 `C₃×C₄` 顯示 12 格，改成 `C₅×C₂` 即更新為 10 格；independent-axis composer 交換執行順序仍到同一 endpoint，且用實線／虛線及文字步驟區分兩條路徑；clock tracer 對 `C₄×C₆` 得首次共同返回 12、覆蓋 12/24，對 `C₂×C₃` 得共同返回 6、覆蓋 6/6，非 generator step 的 coordinate periods 亦正確進入 lcm；hidden-coordinate decoder 的 valid、collision、missing states、twisted axes 四種案例分別觸發預期 gates。鍵盤 focus 為 3px solid outline，成功／失敗均有 PASS／FAIL、邊框型態與文字 witness，不只靠顏色；dark theme 文字與警示色可讀，lesson subtree 在 reduced motion 下最大 transition 為 `0.00001s`。Development 與 production build 均通過；production 僅保留專案既有 warnings。

## Ch29 重作決策

Ch28 已把 element order 讀成 cycle 的 first return；Ch30 才進入 p-groups、nontrivial center 與如何把 order-p seed 擴成最大的 p-power subgroup。舊安排把 Cauchy theorem、p-tuple proof、p-groups、nontrivial center 並列在同章，實際上混合了 existence、orbit counting 與 class equation 三套模型。Ch29 現在只回答一個問題：**為什麼 `p` 是有限群大小的 prime divisor 時，群內不可能完全沒有長度 `p` 的 element cycle？**

1. **Prime-guarantee boundary**：並排比較同為 order 6 的 `C₆` 與 `D₃`。兩者都有 orders 2、3 的 elements，但只有 `C₆` 有 order 6。主 insight：Lagrange 的 converse 對一般 divisor 失敗；Cauchy theorem 保證的是 prime divisor，不是任意 divisor。
2. **Constrained-tuple room**：在 `D₃`、`p=3` 中自由選前兩個 slots，最後一格自動補成讓乘積為 identity 的唯一 element。主 insight：product 為 identity 的 p-tuples 有 `|G|^(p−1)` 個；最後一格不是額外選擇，因此當 `p∣|G|` 時整個 room 的大小是 p 的倍數。
3. **Cyclic-rotation invariant**：選 fixed、mixed、noncommuting tuples，逐格 cyclic shift；每次 shift 後仍在 product-identity room。主 insight：rotation 不是裝飾，而是一個不把 tuple 丟出 room 的 `C_p` action；nonabelian 情況仍成立，但正式 conjugation calculation 放 secondary layer。
4. **Prime-packet sorter**：把 `D₃` 的 36 個 constrained triples 全部按 cyclic rotation 分包，逐包 reveal。每包只能是 singleton 或 triple；沒有 size 2。主 insight：prime-sized action 的 orbit 只有 1 或 p，所有非固定 tuples 都整包消耗 p 個 states。
5. **Fixed-tuple decoder**：移走所有 p-sized packets，singleton 數仍必須是 p 的倍數；identity tuple 只佔一格，所以不可能是唯一 singleton。再把 fixed tuple 解碼成 `(x,…,x)` 與 `x^p=e`，排除 identity 後得到 `ord(x)=p`。主 insight：Cauchy element 是 packet counting 留下的不可消除餘數，不是靠搜尋碰巧找到。

正式 theorem statement、`|X|=|G|^(p−1)` bijection、cyclic shift well-definedness、orbit-size proof 與最後的 order argument 全放 secondary layer。p-group 定義、nontrivial center、Sylow existence 與 subgroup extension 全留給 Ch30；主流程不把正式 proof paragraph 混進每一幕的操作說明。

驗收結果：五個 routes 在 1920×1080 均無水平 overflow。order-6 boundary 對 `C₆` 得 orders 2／3／6 witnesses 分別為 1／2／2 個，對 `D₃` 得 3／2／0 個；constrained-tuple room 的 36 種 free prefixes 全部唯一補成 product `e`；noncommuting、mixed、fixed 三種 triples 的三次 cyclic shifts 全保持 product `e`；36 個 triples 完整分為 11 個 size-3 packets 與 3 個 singleton packets，沒有 size 2。Fixed decoder 對 `D₃,p=3`、`D₃,p=2`、`C₆,p=3`、`C₆,p=2`、`C₈,p=2` 分別得到 fixed counts 3、4、3、2、2 與正確 nonidentity witnesses。鍵盤 focus 為 3px solid outline，Tab 實際移到下一控制項；packet size、MOVING／FIXED、PASS／ABSENT 與實線／虛線／雙框讓資訊不只靠顏色。Light／dark theme 均可讀，lesson subtree 在 reduced motion 下最大 transition 為 `0.00001s`。Development 與 production build 均通過；production 僅保留專案既有 budget／unused-import warnings。

## Ch30 重作決策

Ch29 只保證一顆 order-p seed；Ch31 才研究所有 maximal p-subgroups 為何互相 conjugate，以及它們的數量受哪些限制。Ch30 專心回答中間的 existence gap：**若目前的 p-subgroup 還沒吃滿 `|G|` 中的 p-power，為什麼群的結構一定會暴露一個能再長一層的方向？** 舊安排中的 p-group nontrivial center 是另一條 class-equation 故事，本章移除，不拿它和 normalizer growth 混教。

全章用 `S₄`、`p=2` 的真實 subgroup chain `⟨(12)⟩ < ⟨(12),(34)⟩ < N(⟨(12),(34)⟩)`，sizes 為 `2→4→8`。所有 permutations、cosets、P-actions 與 normalizers 都由模型計算，不手寫一張只在畫面上看似成立的示意圖。

1. **p-part target gauge**：把 `|G|=pⁿm` 拆成 p-budget `pⁿ` 與不屬於 p 的 remainder `m`；比較 `12,p=2`、`18,p=3`、`24,p=2`、`60,p=5`。主 insight：Sylow target 不是整個 group，也不是「目前看起來不能加 generator」，而是 group order 中可容納的最大 p-power。
2. **Coset-orbit packer**：讓目前的 P 左作用在 `G/P`。在 `S₄` 的 size-2 rung，12 個 cosets 分成 fixed singletons 與 size-2 packets；在 size-4 rung，6 個 cosets同樣只留下 p-divisible moving packets。主 insight：若 `|G:P|` 仍被 p 整除，fixed coset 數也被 p 整除；identity coset 已固定，所以一定還有另一個 fixed coset。
3. **Normalizer decoder**：選 fixed 與 moving cosets，逐張比較 `g⁻¹Pg` 是否仍等於 P。主 insight：extra fixed coset 不是偶然靜止；它精確表示一個 P 外部的 coordinate change 仍把 P 保持為自己，也就是 `g∈N_G(P)\P`。
4. **Quotient-seed lifter**：把 fixed cosets辨認成 `N_G(P)/P`。因其大小被 p 整除，套用 Ch29 的 Cauchy theorem 得到 quotient 中的 order-p cycle；再把該 cycle 的 p 個 P-cosets lift 回 subgroup Q。主 insight：quotient 裡新增一個 order-p direction，回到 G 就把 subgroup size 從 `|P|` 精確放大為 `p|P|`。
5. **Sylow growth ladder**：逐步執行 `2→4→8`，每層同步顯示 coset count、fixed count、normalizer quotient 與新 subgroup cards；到 size 8 時 index 3 不再被 2 整除，p-budget 已吃滿。主 insight：每次強迫成長都多一個 p-factor，而有限的 p-budget 保證過程在 `pⁿ` 停下，這就是 first Sylow theorem 的 existence mechanism。

Left-coset action 的 orbit congruence、fixed-coset／normalizer bijection、quotient Cauchy application、subgroup correspondence 與 induction 全放 secondary layer。Sylow conjugacy、`n_p∣m`、`n_p≡1 mod p` 與 constraint solving 全留給 Ch31；p-group center theorem 延後到後續有限群課程，不把旁支硬塞回本章。

驗收結果：S₄ 模型由 24 個 permutations 實際生成。`P₂=⟨(12)⟩` 得 12 cosets、orbit sizes `2,2,2,2,2,1,1`、2 fixed cosets、normalizer size 4；`P₄=⟨(12),(34)⟩` 得 6 cosets、orbit sizes `4,1,1`、2 fixed、normalizer size 8；`P₈=N(P₄)` 得 3 cosets、orbit sizes `2,1`、1 fixed、normalizer size 8。Normalizer decoder 對 identity fixed、external fixed、moving coset 分別輸出已知方向、外部 stable direction、changed subgroup；兩次 quotient lifts 精確為 `2→4`、`4→8`。五個 routes 在 1920×1080 無水平 overflow；FIXED／MOVING、SAME／CHANGED、CURRENT／COMPLETE／LOCKED 與邊框型態提供非色彩線索，dark theme 內容可讀，reduced motion 最大 transition 為 `0.00001s`。Development 與 production build 均通過；production 僅保留專案既有 warnings。

## Ch31 重作決策

Ch30 只證明至少有一個 Sylow p-subgroup；Ch32 才把 representation、map、quotient、action 與 finite-group constraints 組成陌生群診斷流程。Ch31 固定回答「所有 Sylow p-subgroups 在群裡如何分布？」並把三個常被背成清單的結論重排成同一個 action 模型：**先把 Sylow subgroups 當成會被 conjugation 搬動的 points，再從 orbit 與 fixed-point residue 讀出位置與數量限制。**

1. **Sylow landscape builder**：由 Ch30 的 `S₄` Sylow 2-subgroup `P₈` 出發，讓所有 `g∈S₄` 生成 distinct conjugates `gP₈g⁻¹`；重複 cards 自動疊合，最後得到 3 個 subgroup points。主 insight：要研究的不是三份無關 subgroups，而是一個 conjugation landscape。
2. **Coset fixed-point magnet**：令任意 p-subgroup H 作用在 `G/P`。因 `|G:P|=m` 不被 p 整除，必有 fixed coset `gP`，並解碼成 `H≤gPg⁻¹`；若 H 本身也是 Sylow，sizes 相等使 inclusion 變 equality。主 insight：每個 p-subgroup 都能被某個 Sylow conjugate 吸收，所有 Sylows 因而在同一 conjugacy orbit。
3. **Normalizer orbit meter**：在 Sylow landscape 上以 orbit–stabilizer 讀 `n_p=[G:N_G(P)]`；再把 `P≤N_G(P)≤G` 畫成等大 packets，得到 `[G:N(P)]` divides `[G:P]=m`。主 insight：`n_p∣m` 不是額外數論巧合，而是 conjugation orbit 的 size。
4. **Self-action residue**：固定一個 Sylow P，讓 P 自己 conjugate 整個 Sylow set。P 是 fixed point；若另一個 Q 也被全 P normalize，PQ 會形成比 P 更大的 p-subgroup，矛盾。因此其餘 points 全進 p-divisible orbits。主 insight：fixed residue 只有 1，故 `n_p≡1 mod p`。
5. **Sylow constraint solver**：輸入 `|G|` 與 prime p，先列 `n_p∣m` candidates，再以 `n_p≡1 mod p` 過濾；比較 order 12／p=3、order 24／p=2、order 60／p=5、order 21 的兩個 primes。主 insight：Sylow constraints 排除不可能、常能逼出 normal subgroup，但不會無中生有地完成整個 group classification。

Conjugacy proof、fixed-coset inclusion、orbit–stabilizer equation、唯一 fixed Sylow proof 與 normality criterion `n_p=1` 全放 secondary layer。Ch32 才把這些 constraints 和先前 maps／quotients／actions 做策略選擇；主流程不把 Sylow 三定理列成彼此無關的背誦表。
