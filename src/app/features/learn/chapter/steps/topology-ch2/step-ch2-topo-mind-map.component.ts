import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }
const NODES: MN[] = [
  { id: 'cont', label: '連續映射', x: 220, y: 30, summary: '開集原像是開集。不需要距離。三版定義等價。', color: 'var(--accent)' },
  { id: 'ex', label: '例子', x: 80, y: 100, summary: '離散上一切連續。密著上只有常數連續。拓撲決定連續。', color: '#c8983b' },
  { id: 'homeo', label: '同胚', x: 220, y: 100, summary: '連續+雙射+逆連續。拓撲的「同構」。甜甜圈=咖啡杯。', color: '#c8983b' },
  { id: 'inv', label: '拓撲不變量', x: 370, y: 100, summary: '連通、緊緻、Hausdorff、π₁、χ。區分空間的工具。', color: '#5a7faa' },
  { id: 'prod', label: '積拓撲', x: 60, y: 190, summary: 'X×Y。基底=U×V。讓投影連續的最粗拓撲。', color: '#5a8a5a' },
  { id: 'quot', label: '商拓撲', x: 190, y: 190, summary: '黏合。線段→圓、正方形→環面/Mobius。', color: '#5a8a5a' },
  { id: 'haus', label: 'Hausdorff', x: 340, y: 190, summary: '兩點可用開集分離。保證極限唯一。度量空間都是。', color: '#aa5a6a' },
  { id: 'maps', label: '開/閉映射', x: 120, y: 270, summary: '開集/閉集的像。同胚=連續+雙射+開。', color: '#8a6aaa' },
  { id: 'emb', label: '嵌入', x: 300, y: 270, summary: '同胚到像。X「住在」Y裡面。Whitney嵌入定理。', color: '#8a6aaa' },
];
const EDGES: ME[] = [
  { from: 'cont', to: 'ex' }, { from: 'cont', to: 'homeo' }, { from: 'homeo', to: 'inv' },
  { from: 'ex', to: 'prod' }, { from: 'homeo', to: 'quot' }, { from: 'inv', to: 'haus' },
  { from: 'prod', to: 'maps' }, { from: 'haus', to: 'emb' },
];

@Component({
  selector: 'app-step-ch2-topo-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：連續映射與同胚" subtitle="§2.10">
      <p><strong>連續 → 例子/同胚 → 不變量 → 積/商/Hausdorff → 開閉映射/嵌入</strong></p>
    </app-prose-block>
    <app-challenge-card prompt="點節點看摘要">
      <svg viewBox="0 0 440 310" class="map-svg">
        @for (e of edges; track e.from+e.to) {
          <line [attr.x1]="nm[e.from].x" [attr.y1]="nm[e.from].y" [attr.x2]="nm[e.to].x" [attr.y2]="nm[e.to].y" stroke="var(--border)" stroke-width="1.5" />
        }
        @for (n of nodes; track n.id) {
          <g class="node" [class.active]="active()===n.id" (click)="active.set(n.id)">
            <rect [attr.x]="n.x-58" [attr.y]="n.y-14" width="116" height="28" rx="8"
              [attr.fill]="active()===n.id?n.color:'var(--bg-surface)'" [attr.stroke]="n.color" stroke-width="2"/>
            <text [attr.x]="n.x" [attr.y]="n.y+4" text-anchor="middle" [attr.fill]="active()===n.id?'white':n.color" font-size="9.5" font-weight="600">{{n.label}}</text>
          </g>
        }
      </svg>
      @if (activeSummary()) { <div class="summary">{{activeSummary()}}</div> }
    </app-challenge-card>
  `,
  styles: `
    .map-svg{width:100%;display:block;margin-bottom:12px}.node{cursor:pointer}.node:hover rect{filter:brightness(1.1)}
    .summary{padding:12px;border-radius:8px;background:var(--bg-surface);border:1px solid var(--border);font-size:13px;text-align:center;color:var(--text);font-family:'JetBrains Mono',monospace}
  `,
})
export class StepCh2TopoMindMapComponent {
  readonly nodes=NODES;readonly edges=EDGES;readonly active=signal('cont');
  readonly nm:Record<string,MN>={};
  readonly activeSummary=computed(()=>NODES.find(n=>n.id===this.active())?.summary??'');
  constructor(){for(const n of NODES)this.nm[n.id]=n;}
}
