import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MapNode {
  id: string; label: string; x: number; y: number;
  summary: string; color: string;
}
interface MapEdge {
  from: string; to: string; label: string;
  explanation: string; // detailed explanation when clicked
  lx?: number; ly?: number; // label offset override
}

const NODES: MapNode[] = [
  { id: 'completeness', label: '完備性 (Ch1)', x: 300, y: 40,
    summary: 'R 的每個有上界非空子集都有 sup。有理數辦不到的事，實數做到了。這是一切的根基——沒有完備性，後面所有收斂定理都會崩潰。',
    color: '#5a7faa' },
  { id: 'seq-def', label: '數列定義', x: 90, y: 140,
    summary: '數列 = 函數 a: N → R，把每個自然數 n 對應到一個實數 aₙ。不是集合——順序重要，值可以重複。它是分析的「基本粒子」。',
    color: '#c8983b' },
  { id: 'epsilon-n', label: 'ε-N 收斂', x: 300, y: 140,
    summary: '收斂的精確定義：∀ε > 0, ∃N, ∀n > N: |aₙ − L| < ε。任意窄的帶子裡最終包含所有項。把「靠近」從直覺變成邏輯。',
    color: '#aa5a6a' },
  { id: 'limit-laws', label: '極限運算律', x: 510, y: 140,
    summary: '和的極限 = 極限的和，積的極限 = 極限的積（分母非零時商也成立）。有了 ε-N 定義才能嚴格證明這些「理所當然」的事。',
    color: '#c8983b' },
  { id: 'monotone', label: '單調有界定理', x: 90, y: 260,
    summary: '單調遞增 + 有上界 → 收斂（反之亦然）。證明只需一行：sup 存在（完備性）→ sup 就是極限。最乾淨的收斂判據。',
    color: '#5a8a5a' },
  { id: 'bw', label: 'Bolzano-W.', x: 260, y: 260,
    summary: '有界數列一定有收斂子列。即使數列本身亂跳不收斂，只要被關在有限範圍裡，就能從中挑出收斂的子序列。',
    color: '#5a8a5a' },
  { id: 'cauchy', label: 'Cauchy 列', x: 430, y: 260,
    summary: '項與項之間越來越近：∀ε, ∃N, ∀m,n > N: |aₘ − aₙ| < ε。在 R 中 Cauchy ⟺ 收斂。最大優勢：不需要事先知道極限是什麼。',
    color: '#5a8a5a' },
  { id: 'important', label: '重要極限', x: 130, y: 380,
    summary: '(1+1/n)ⁿ → e（複利極限），調和級數發散（加得慢但沒有界），巴比倫法 → √2（二次收斂，正確位數翻倍）。理論的試金石。',
    color: '#8a6aaa' },
  { id: 'limsup', label: 'lim sup / inf', x: 430, y: 380,
    summary: '有界不收斂的數列也有 lim sup 和 lim inf——「最終天花板」和「最終地板」。收斂 ⟺ lim sup = lim inf。是極限概念的推廣。',
    color: '#8a6aaa' },
];

const EDGES: MapEdge[] = [
  { from: 'completeness', to: 'monotone', label: '推論',
    explanation: '單調有界定理是完備性的直接推論。證明核心：單調遞增+有上界 → 上確界 sup 存在（完備性！）→ sup 就是極限。如果 R 不完備（像 Q），sup 可能不存在，定理就會失敗。',
    lx: -20, ly: -8 },
  { from: 'completeness', to: 'cauchy', label: 'R 完備 ⟺ Cauchy 收斂',
    explanation: '「R 是完備的」有一個等價說法：R 中每個 Cauchy 列都收斂。這不是巧合——完備性和 Cauchy 收斂其實是同一件事的兩面。在 Q 裡，Cauchy 列可能「收斂到洞裡」（像逼近 √2 的有理數列），所以 Q 不完備。',
    lx: 30, ly: -8 },
  { from: 'completeness', to: 'bw', label: '區間套',
    explanation: 'Bolzano-Weierstrass 的證明用二分法產生嵌套閉區間 [a₁,b₁] ⊃ [a₂,b₂] ⊃ …。完備性（通過區間套定理）保證這些區間有唯一的交點——那個交點就是子列的極限。沒有完備性，交點可能是個「洞」。',
    lx: -40, ly: 5 },
  { from: 'seq-def', to: 'epsilon-n', label: '怎麼定義「靠近」？',
    explanation: '有了數列之後，自然要問：什麼叫「aₙ 趨近 L」？直覺說「越來越靠近」，但這不夠精確——(−1)ⁿ/n 也在靠近 0，但同時在正負之間跳。ε-N 定義用「任意小的誤差帶」捕捉了精確的含義。',
    ly: -10 },
  { from: 'epsilon-n', to: 'limit-laws', label: '可以做運算嗎？',
    explanation: '知道了收斂的定義後，下一步是問：兩個收斂數列相加/相乘，結果還收斂嗎？極限運算律說「是」，而且極限值等於極限的運算。但這需要用 ε-N 語言嚴格證明——不能只靠直覺。',
    ly: -10 },
  { from: 'epsilon-n', to: 'limsup', label: '不收斂怎麼辦？',
    explanation: '不是所有有界數列都收斂（如 (−1)ⁿ）。但即使不收斂，我們仍想描述它的「漸近行為」。lim sup = 最終的天花板，lim inf = 最終的地板。收斂 ⟺ 天花板 = 地板。這推廣了極限的概念，讓每個有界數列都有東西可說。',
    lx: 30, ly: 0 },
  { from: 'monotone', to: 'important', label: '直接應用',
    explanation: '(1+1/n)ⁿ 是單調遞增且有上界（可以證明 < 3）→ 單調有界定理保證它收斂。收斂到的那個值就叫 e。調和級數則是反面教材：單調遞增但沒有上界 → 發散。兩者的對比凸顯了「有界」這個條件有多關鍵。',
    ly: 5 },
  { from: 'bw', to: 'cauchy', label: '在 R 中等價',
    explanation: '三個條件在 R 中等價：① 有界數列有收斂子列（BW）② Cauchy 列收斂（完備性）③ 單調有界收斂。它們各自獨立地刻劃了「R 沒有洞」這件事。在更一般的度量空間裡它們未必等價——但在 R 裡，它們是同一枚硬幣的三面。',
    ly: -10 },
];

type Selection = { type: 'node'; id: string } | { type: 'edge'; idx: number } | null;

@Component({
  selector: 'app-step-ch2-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：Ch1 + Ch2" subtitle="§2.9">
      <p>
        兩章下來的邏輯線：
      </p>
      <p>
        <strong>Q 有洞 → R 填洞（完備性）→ 數列極限存在的保證（單調有界、Cauchy、BW）</strong>
      </p>
      <p>
        完備性不只是「公理」——它是讓所有收斂定理成立的<strong>唯一原因</strong>。
        點<strong>節點</strong>看摘要，點<strong>連線上的文字</strong>看兩個概念之間的關聯。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點或連線文字，看概念摘要和它們之間的邏輯關聯">
      <svg viewBox="0 0 600 430" class="map-svg">
        <!-- Edges (lines) -->
        @for (e of edges; track e.from + e.to; let i = $index) {
          <line [attr.x1]="nm[e.from].x" [attr.y1]="nm[e.from].y"
                [attr.x2]="nm[e.to].x" [attr.y2]="nm[e.to].y"
                [attr.stroke]="isEdgeSelected(i) ? 'var(--accent)' : 'var(--border)'"
                [attr.stroke-width]="isEdgeSelected(i) ? 2.5 : 1.2" />
        }

        <!-- Edge labels (clickable) -->
        @for (e of edges; track e.from + e.to; let i = $index) {
          <g class="edge-g" [class.active]="isEdgeSelected(i)"
             (click)="selectEdge(i, $event)">
            <rect [attr.x]="edgeLabelX(e) - edgeLabelW(e) / 2 - 4"
                  [attr.y]="edgeLabelY(e) - 8"
                  [attr.width]="edgeLabelW(e) + 8" height="16" rx="4"
                  [attr.fill]="isEdgeSelected(i) ? 'var(--accent)' : 'var(--bg-surface)'"
                  [attr.stroke]="isEdgeSelected(i) ? 'var(--accent)' : 'var(--border)'"
                  stroke-width="0.8" fill-opacity="0.9" />
            <text [attr.x]="edgeLabelX(e)" [attr.y]="edgeLabelY(e) + 3"
                  class="edge-label"
                  [attr.fill]="isEdgeSelected(i) ? 'white' : 'var(--text-muted)'">{{ e.label }}</text>
          </g>
        }

        <!-- Nodes -->
        @for (n of nodes; track n.id) {
          <g class="node-g" [class.active]="isNodeSelected(n.id)"
             (click)="selectNode(n.id, $event)">
            <rect [attr.x]="n.x - 60" [attr.y]="n.y - 18" width="120" height="36" rx="10"
                  [attr.fill]="isNodeSelected(n.id) ? n.color : 'var(--bg-surface)'"
                  [attr.stroke]="n.color" stroke-width="2" />
            <text [attr.x]="n.x" [attr.y]="n.y + 4" class="node-label"
                  [attr.fill]="isNodeSelected(n.id) ? 'white' : n.color">{{ n.label }}</text>
          </g>
        }
      </svg>

      <!-- Detail panel -->
      @if (detail()) {
        <div class="detail-box" [class.edge-detail]="detail()!.type === 'edge'"
             [style.border-color]="detailColor()">
          <div class="detail-title" [style.color]="detailColor()">{{ detailTitle() }}</div>
          <div class="detail-body">{{ detailText() }}</div>
        </div>
      } @else {
        <div class="hint">點任何<strong>節點</strong>或<strong>連線文字</strong>看說明</div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        下一章：<strong>級數</strong>——把無限多項加起來。
        收斂判別法、絕對收斂、重排定理。
      </p>
    </app-prose-block>
  `,
  styles: `
    .map-svg { width: 100%; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 14px; background: var(--bg); }

    .node-g { cursor: pointer; }
    .node-label { font-size: 10px; text-anchor: middle; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .node-g:hover rect { stroke-width: 3; filter: brightness(1.05); }
    .node-g.active rect { stroke-width: 3; }

    .edge-g { cursor: pointer; }
    .edge-label { font-size: 7px; text-anchor: middle; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; }
    .edge-g:hover rect { stroke-width: 1.5; filter: brightness(1.1); }
    .edge-g.active rect { stroke-width: 2; }

    .detail-box { padding: 16px; border: 2px solid; border-radius: 12px;
      background: var(--bg-surface); margin-bottom: 8px;
      &.edge-detail { background: var(--accent-10); } }
    .detail-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
    .detail-body { font-size: 13px; color: var(--text-secondary); line-height: 1.8; }

    .hint { text-align: center; font-size: 13px; color: var(--text-muted); padding: 16px;
      border: 1px dashed var(--border); border-radius: 10px; }
    .hint strong { color: var(--accent); }
  `,
})
export class StepCh2MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly nm: Record<string, MapNode> = {};
  readonly detail = signal<Selection>(null);

  constructor() { for (const n of NODES) this.nm[n.id] = n; }

  selectNode(id: string, ev: Event): void {
    ev.stopPropagation();
    this.detail.set({ type: 'node', id });
  }

  selectEdge(idx: number, ev: Event): void {
    ev.stopPropagation();
    this.detail.set({ type: 'edge', idx });
  }

  isNodeSelected(id: string): boolean {
    const d = this.detail();
    return d?.type === 'node' && d.id === id;
  }

  isEdgeSelected(idx: number): boolean {
    const d = this.detail();
    return d?.type === 'edge' && d.idx === idx;
  }

  edgeLabelX(e: MapEdge): number {
    return (this.nm[e.from].x + this.nm[e.to].x) / 2 + (e.lx ?? 0);
  }

  edgeLabelY(e: MapEdge): number {
    return (this.nm[e.from].y + this.nm[e.to].y) / 2 + (e.ly ?? 0);
  }

  edgeLabelW(e: MapEdge): number {
    return Math.max(40, e.label.length * 7);
  }

  readonly detailTitle = computed(() => {
    const d = this.detail();
    if (!d) return '';
    if (d.type === 'node') return NODES.find(n => n.id === d.id)?.label ?? '';
    return EDGES[d.idx].from + ' → ' + EDGES[d.idx].to + '：' + EDGES[d.idx].label;
  });

  readonly detailText = computed(() => {
    const d = this.detail();
    if (!d) return '';
    if (d.type === 'node') return NODES.find(n => n.id === d.id)?.summary ?? '';
    return EDGES[d.idx].explanation;
  });

  readonly detailColor = computed(() => {
    const d = this.detail();
    if (!d) return 'var(--accent)';
    if (d.type === 'node') return NODES.find(n => n.id === d.id)?.color ?? 'var(--accent)';
    return 'var(--accent)';
  });
}
