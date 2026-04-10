import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MapNode { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface MapEdge { from: string; to: string; label: string; }

const NODES: MapNode[] = [
  { id: 'q-holes', label: 'Q 有洞', x: 200, y: 30, summary: '√2 不是有理數——有理數在數線上有「缺口」（§1.1–1.2）', color: '#aa5a6a' },
  { id: 'sup', label: 'Sup / Inf', x: 80, y: 120, summary: '上確界 = 最小的上界，下確界 = 最大的下界（§1.3）', color: '#c8983b' },
  { id: 'completeness', label: '完備性公理', x: 200, y: 120, summary: 'R 的每個有上界的非空子集都有 sup ∈ R。這是 R 和 Q 的唯一根本差別（§1.4）', color: '#5a7faa' },
  { id: 'archimedean', label: 'Archimedean', x: 60, y: 220, summary: '沒有無限大的實數；Q 在 R 中稠密（§1.5）', color: '#5a8a5a' },
  { id: 'nested', label: '區間套', x: 170, y: 220, summary: '嵌套閉區間的交集恰好一個點（§1.6）', color: '#5a8a5a' },
  { id: 'decimal', label: '十進位展開', x: 280, y: 220, summary: '每個實數有唯一的十進位表示（0.999…=1 除外）；有理 ↔ 循環（§1.7）', color: '#5a8a5a' },
  { id: 'uncountable', label: '不可數性', x: 340, y: 130, summary: 'R 不可數（Cantor 對角論證），但 Q 可數（§1.8）', color: '#8a6aaa' },
  { id: 'cantor', label: 'Cantor 集', x: 340, y: 220, summary: '不可數但測度為零的碎形集合——完備性能創造的「怪物」（§1.9）', color: '#8a6aaa' },
];

const EDGES: MapEdge[] = [
  { from: 'q-holes', to: 'sup', label: '需要定義' },
  { from: 'q-holes', to: 'completeness', label: '填洞' },
  { from: 'sup', to: 'completeness', label: '核心概念' },
  { from: 'completeness', to: 'archimedean', label: '推論' },
  { from: 'completeness', to: 'nested', label: '等價' },
  { from: 'nested', to: 'decimal', label: '基礎' },
  { from: 'completeness', to: 'uncountable', label: '蘊含' },
  { from: 'decimal', to: 'uncountable', label: '對角論證' },
  { from: 'uncountable', to: 'cantor', label: '例子' },
];

@Component({
  selector: 'app-step-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：整章回顧" subtitle="§1.10">
      <p>
        十個小節走下來，我們回答了一個看似簡單的問題：
        <strong>為什麼需要實數？</strong>
      </p>
      <p>
        答案的骨幹是一條邏輯鏈：Q 有洞 → 需要 sup → 完備性公理 →
        一切好性質（Archimedean、區間套、十進位） → 但也帶來驚奇（不可數、Cantor 集）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看每個概念的一句話摘要">
      <svg viewBox="0 0 420 270" class="map-svg">
        <!-- Edges -->
        @for (e of edges; track e.from + e.to) {
          <line [attr.x1]="nodeMap[e.from].x" [attr.y1]="nodeMap[e.from].y"
                [attr.x2]="nodeMap[e.to].x" [attr.y2]="nodeMap[e.to].y"
                stroke="var(--border)" stroke-width="1" />
          <text [attr.x]="(nodeMap[e.from].x + nodeMap[e.to].x) / 2"
                [attr.y]="(nodeMap[e.from].y + nodeMap[e.to].y) / 2 - 4"
                class="edge-label">{{ e.label }}</text>
        }

        <!-- Nodes -->
        @for (n of nodes; track n.id) {
          <g (click)="selected.set(n.id)" class="node-g" [class.active]="selected() === n.id">
            <rect [attr.x]="n.x - 45" [attr.y]="n.y - 14" width="90" height="28"
                  rx="8" [attr.fill]="n.color" fill-opacity="0.15"
                  [attr.stroke]="n.color" stroke-width="1.5" />
            <text [attr.x]="n.x" [attr.y]="n.y + 4" class="node-label"
                  [attr.fill]="n.color">{{ n.label }}</text>
          </g>
        }
      </svg>

      @if (selectedNode()) {
        <div class="summary-box" [style.border-color]="selectedNode()!.color">
          <div class="sb-title" [style.color]="selectedNode()!.color">{{ selectedNode()!.label }}</div>
          <div class="sb-body">{{ selectedNode()!.summary }}</div>
        </div>
      } @else {
        <div class="hint">點一個節點看摘要</div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        這一章建立了實分析的<strong>地基</strong>。所有後續章節——
        數列、級數、連續、微分、積分——都建築在完備性之上。
      </p>
      <p>
        記住這條線：<strong>Q 有洞 → R 填洞（完備性）→ 極限存在 → 分析可以做</strong>。
      </p>
    </app-prose-block>
  `,
  styles: `
    .map-svg { width: 100%; max-width: 500px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .edge-label { font-size: 7px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .node-g { cursor: pointer; }
    .node-label { font-size: 10px; text-anchor: middle; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .node-g:hover rect { stroke-width: 2.5; }
    .node-g.active rect { stroke-width: 3; filter: drop-shadow(0 0 4px rgba(0,0,0,0.15)); }

    .summary-box { padding: 14px; border: 2px solid; border-radius: 10px;
      background: var(--bg-surface); }
    .sb-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .sb-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }

    .hint { text-align: center; font-size: 12px; color: var(--text-muted);
      padding: 14px; }
  `,
})
export class StepMindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly selected = signal<string | null>(null);

  readonly nodeMap: Record<string, MapNode> = {};

  readonly selectedNode = computed(() => {
    const id = this.selected();
    return id ? NODES.find((n) => n.id === id) ?? null : null;
  });

  constructor() {
    for (const n of NODES) this.nodeMap[n.id] = n;
  }
}
