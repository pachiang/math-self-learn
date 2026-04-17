import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface MN { id: string; label: string; x: number; y: number; summary: string; color: string; }
interface ME { from: string; to: string; }

const NODES: MN[] = [
  { id: 'why', label: '為什麼拓撲', x: 220, y: 30, summary: '度量空間太具體。只需要「開集」就能定義連續和收斂。', color: 'var(--accent)' },
  { id: 'axioms', label: '開集公理', x: 80, y: 100, summary: '∅,X ∈ τ。任意聯集。有限交集。三條就夠了。', color: '#c8983b' },
  { id: 'examples', label: '經典例子', x: 220, y: 100, summary: '離散、密著、標準、餘有限。同一集合不同拓撲。', color: '#c8983b' },
  { id: 'closed', label: '閉集', x: 370, y: 100, summary: '開集的補集。任意交、有限聯。開≠非閉。', color: '#5a7faa' },
  { id: 'basis', label: '基底/子基底', x: 60, y: 190, summary: '用少量「生成元」描述整個拓撲。', color: '#5a8a5a' },
  { id: 'metric', label: '度量拓撲', x: 180, y: 190, summary: '度量→拓撲。不同度量可誘導相同拓撲。', color: '#5a8a5a' },
  { id: 'compare', label: '粗/細', x: 310, y: 190, summary: 'τ₁⊂τ₂→τ₂更細。離散最細，密著最粗。', color: '#5a7faa' },
  { id: 'sub', label: '子空間拓撲', x: 130, y: 270, summary: 'τ_A = (U∩A)。「相對開」可能和「絕對開」不同。', color: '#8a6aaa' },
  { id: 'icb', label: '內部/閉包/邊界', x: 320, y: 270, summary: 'int(A)=最大開集在A裡。cl(A)=最小閉集含A。∂A=差。', color: '#8a6aaa' },
];
const EDGES: ME[] = [
  { from: 'why', to: 'axioms' }, { from: 'why', to: 'examples' }, { from: 'examples', to: 'closed' },
  { from: 'axioms', to: 'basis' }, { from: 'axioms', to: 'metric' }, { from: 'closed', to: 'compare' },
  { from: 'basis', to: 'sub' }, { from: 'compare', to: 'icb' },
];

@Component({
  selector: 'app-step-ch1-topo-mind-map',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="心智圖：拓撲空間與開集" subtitle="§1.10">
      <p><strong>動機 → 開集公理 → 例子/閉集 → 基底/度量/比較 → 子空間/內部閉包</strong></p>
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
export class StepCh1TopoMindMapComponent {
  readonly nodes=NODES;readonly edges=EDGES;readonly active=signal('why');
  readonly nm:Record<string,MN>={};
  readonly activeSummary=computed(()=>NODES.find(n=>n.id===this.active())?.summary??'');
  constructor(){for(const n of NODES)this.nm[n.id]=n;}
}
