import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MapNode { id: string; label: string; x: number; y: number; summary: string; color: string; ch: number; }
interface MapEdge { from: string; to: string; label: string; }

const NODES: MapNode[] = [
  { id: 'completeness', label: '完備性 (Ch1)', x: 200, y: 25, summary: 'R 的每個有上界非空子集都有 sup。一切的根基。', color: '#5a7faa', ch: 1 },
  { id: 'seq-def', label: '數列定義', x: 60, y: 95, summary: '數列 = 函數 N→R。不是集合，順序和重複都重要。', color: '#c8983b', ch: 2 },
  { id: 'epsilon-n', label: 'ε-N 定義', x: 200, y: 95, summary: '收斂的精確定義：任意 ε 帶子裡最終包含所有項。', color: '#aa5a6a', ch: 2 },
  { id: 'limit-laws', label: '極限運算律', x: 340, y: 95, summary: '和、積、商的極限 = 極限的和、積、商。', color: '#c8983b', ch: 2 },
  { id: 'monotone', label: '單調有界', x: 60, y: 175, summary: '單調+有界 → 收斂。完備性的直接推論。', color: '#5a8a5a', ch: 2 },
  { id: 'bw', label: 'Bolzano-W.', x: 170, y: 175, summary: '有界 → 有收斂子列。用二分法證明。', color: '#5a8a5a', ch: 2 },
  { id: 'cauchy', label: 'Cauchy 列', x: 280, y: 175, summary: 'Cauchy ⟺ 收斂（在 R 中）。不需要知道極限。', color: '#5a8a5a', ch: 2 },
  { id: 'important', label: '重要極限', x: 100, y: 245, summary: 'e = lim(1+1/n)ⁿ，調和級數發散，Newton 法。', color: '#8a6aaa', ch: 2 },
  { id: 'limsup', label: 'lim sup/inf', x: 300, y: 245, summary: '有界數列的「最終天花板」和「最終地板」。', color: '#8a6aaa', ch: 2 },
];

const EDGES: MapEdge[] = [
  { from: 'completeness', to: 'monotone', label: '推論' },
  { from: 'completeness', to: 'cauchy', label: 'R 完備' },
  { from: 'completeness', to: 'bw', label: '區間套' },
  { from: 'seq-def', to: 'epsilon-n', label: '定義收斂' },
  { from: 'epsilon-n', to: 'limit-laws', label: '運算' },
  { from: 'epsilon-n', to: 'limsup', label: '推廣' },
  { from: 'monotone', to: 'important', label: '應用' },
  { from: 'bw', to: 'cauchy', label: '等價' },
];

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
      </p>
    </app-prose-block>

    <app-challenge-card prompt="點節點看摘要，藍色 = Ch1，其他 = Ch2">
      <svg viewBox="0 0 420 280" class="map-svg">
        @for (e of edges; track e.from + e.to) {
          <line [attr.x1]="nodeMap[e.from].x" [attr.y1]="nodeMap[e.from].y"
                [attr.x2]="nodeMap[e.to].x" [attr.y2]="nodeMap[e.to].y"
                stroke="var(--border)" stroke-width="1" />
          <text [attr.x]="(nodeMap[e.from].x + nodeMap[e.to].x) / 2"
                [attr.y]="(nodeMap[e.from].y + nodeMap[e.to].y) / 2 - 4"
                class="edge-label">{{ e.label }}</text>
        }
        @for (n of nodes; track n.id) {
          <g (click)="selected.set(n.id)" class="node-g" [class.active]="selected() === n.id">
            <rect [attr.x]="n.x - 50" [attr.y]="n.y - 14" width="100" height="28"
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
        下一章：<strong>級數</strong>——把無限多項加起來。
        收斂判別法、絕對收斂、重排定理。
      </p>
    </app-prose-block>
  `,
  styles: `
    .map-svg { width: 100%; max-width: 500px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
    .edge-label { font-size: 7px; fill: var(--text-muted); text-anchor: middle;
      font-family: 'JetBrains Mono', monospace; }
    .node-g { cursor: pointer; }
    .node-label { font-size: 9px; text-anchor: middle; font-weight: 700;
      font-family: 'JetBrains Mono', monospace; }
    .node-g:hover rect { stroke-width: 2.5; }
    .node-g.active rect { stroke-width: 3; }

    .summary-box { padding: 14px; border: 2px solid; border-radius: 10px;
      background: var(--bg-surface); }
    .sb-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .sb-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .hint { text-align: center; font-size: 12px; color: var(--text-muted); padding: 14px; }
  `,
})
export class StepCh2MindMapComponent {
  readonly nodes = NODES;
  readonly edges = EDGES;
  readonly selected = signal<string | null>(null);
  readonly nodeMap: Record<string, MapNode> = {};
  readonly selectedNode = computed(() => {
    const id = this.selected();
    return id ? NODES.find((n) => n.id === id) ?? null : null;
  });
  constructor() { for (const n of NODES) this.nodeMap[n.id] = n; }
}
