import { Component, computed, signal } from '@angular/core';

interface NetworkNode { value: number; x: number; y: number; }
interface NetworkEdge { from: number; to: number; }

const NODES: readonly NetworkNode[] = Array.from({ length: 8 }, (_, value) => {
  const angle = (Math.PI * 2 * value) / 8 - Math.PI / 2;
  return { value, x: 250 + 150 * Math.cos(angle), y: 180 + 150 * Math.sin(angle) };
});

@Component({
  selector: 'app-algebra-v3-reachability-wave',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch7-lesson">
      <header class="hero"><p class="eyebrow">Abstract Algebra · 7.1</p><h2>Generator 不是主角，是可以重複按的按鈕</h2><p class="lede">固定從 identity 0 出發。選一顆 action button 後，你可以按任意有限次，也可以按它的 inverse；生成（generate）問的是這套 vocabulary 最終能讓你抵達哪些 effects。</p></header>

      <section class="prediction"><p class="kicker">先預測可達範圍</p><h3>在 ℤ₈ 中，只准使用 +2 與它的 inverse，持續走下去會到齊八個 residues 嗎？</h3><div class="choice-row"><button type="button" (click)="prediction.set(false)">不會</button><button type="button" (click)="prediction.set(true)">會</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'每一步都保留 parity；從 0 出發永遠只會落在 even residues。':'對。可達範圍只有 0、2、4、6，重複再久也不會跨進 odd residues。'}}</p>}</section>

      <section class="lab">
        <div class="lab-heading"><div><p class="kicker">Reachability wave</p><h3>每一輪只從目前 frontier 再按一次</h3></div><p>選 generator 後，inverse button 自動跟著出現。逐層展開能看見「重複使用」何時新增 effects、何時只是在已知 nodes 內繞圈。</p></div>
        <div class="generator-picker" role="group" aria-label="選擇模八加法的 generator"><button type="button" [attr.aria-pressed]="generator()===2" (click)="selectGenerator(2)">button +2 · inverse −2</button><button type="button" [attr.aria-pressed]="generator()===3" (click)="selectGenerator(3)">button +3 · inverse −3</button></div>
        <div class="control-row"><button type="button" class="primary" (click)="expandNext()" [disabled]="wave()>=maxWave()">展開下一層</button><button type="button" (click)="finish()" [disabled]="wave()>=maxWave()">展開到停止</button><button type="button" (click)="wave.set(0)" [disabled]="wave()===0">回到 identity</button></div>

        <div class="stage reach-layout">
          <div class="network-board">
            <svg viewBox="0 0 500 360" role="img" [attr.aria-label]="networkLabel()">
              @for(edge of edges();track edge.from){<line class="network-edge" [class.reached]="edgeReached(edge)" [attr.x1]="node(edge.from).x" [attr.y1]="node(edge.from).y" [attr.x2]="node(edge.to).x" [attr.y2]="node(edge.to).y" />}
              @for(item of nodes;track item.value){<g class="network-node" [class.reached]="isReached(item.value)" [class.frontier]="isFrontier(item.value)" [class.origin]="item.value===0"><circle [attr.cx]="item.x" [attr.cy]="item.y" r="25"/><text [attr.x]="item.x" [attr.y]="item.y+5">{{item.value}}</text>@if(isReached(item.value)){<text class="node-status" [attr.x]="item.x" [attr.y]="item.y+42">{{isFrontier(item.value)?'NEW':'REACHED'}}</text>}</g>}
            </svg>
          </div>
          <section class="wave-console" aria-live="polite"><p class="kicker">WAVE {{wave()}} / {{maxWave()}}</p><h4>{{waveReading()}}</h4><div class="wave-meter"><div><span>reachable</span><strong>{{reached().join(', ')}}</strong></div><div><span>still unreachable</span><strong>{{unreached().length ? unreached().join(', ') : 'none'}}</strong></div></div><div><span>本輪 frontier</span><div class="frontier-list">@for(value of frontier();track value){<b>{{value}}</b>}@if(frontier().length===0){<em>沒有新 node</em>}</div></div><div class="reach-verdict">{{verdict()}}</div></section>
        </div>
      </section>

      <aside class="insight-card"><div class="insight-visual" aria-hidden="true"><span>e</span><i>+ reusable moves</i><span>finite paths</span><i>→</i><span>reachable effects</span></div><p><strong>Generator 描述可達性，不描述元素的重要程度。</strong>從 identity 出發，把允許的 actions 與 inverses 排成任意有限 word；所有可能 endpoints 合起來，就是它們生成的世界。</p></aside>

      <section class="transfer"><p class="kicker">搬回 triangle rotations</p><h3>只用 120° rotation r 與 r⁻¹，能抵達三個 rotation effects 嗎？</h3><div class="choice-row"><button type="button" (click)="transfer.set(true)">能</button><button type="button" (click)="transfer.set(false)">不能</button></div>@if(transfer()!==null){<p class="feedback" [class.warning]="!transfer()">{{transfer()?'對。e、r、r² 都是 r 的 finite powers；第三次又回到 e。':'r 本身走到 r，r² 也就是 r⁻¹，再按一次回到 e，三個 rotations 全到齊。'}}</p>}</section>

      <section class="secondary"><p>SECONDARY LAYER</p><details><summary>正式記號：generated subgroup</summary><div>對 subset S⊆G，⟨S⟩ 是所有可寫成 s₁^ε₁ ⋯ sₖ^εₖ 的 effects，其中每個 sᵢ∈S、εᵢ 取 1 或 −1，且 k 可為 0；空 word 給出 identity。</div></details><details><summary>為什麼 reachable set 自動履行 group contract？</summary><div>兩條可達 paths 可以串接，所以 endpoints 對 composition closed；把一條 path 倒序並把每步換成 inverse，就得到回到 identity 的 inverse path；空 path 提供 identity。Associativity 從母群繼承。</div></details><details><summary>邊界：generator 可以是一組 elements</summary><div>「a generator」有時指單一 element；generating set 則可包含多個。兩者都只說可重複使用的 action vocabulary，並不保證走遍整個 G。</div></details></section>
    </article>
  `,
})
export class AlgebraV3ReachabilityWaveComponent {
  readonly prediction=signal<boolean|null>(null); readonly transfer=signal<boolean|null>(null); readonly generator=signal<2|3>(2); readonly wave=signal(0); readonly nodes=NODES;
  readonly levels=computed(()=>this.computeLevels(this.generator()));
  readonly maxWave=computed(()=>this.levels().length-1);
  readonly reached=computed(()=>this.levels().slice(0,this.wave()+1).flat().sort((a,b)=>a-b));
  readonly frontier=computed(()=>this.levels()[this.wave()]??[]);
  readonly unreached=computed(()=>Array.from({length:8},(_,value)=>value).filter(value=>!this.reached().includes(value)));
  readonly edges=computed<readonly NetworkEdge[]>(()=>Array.from({length:8},(_,from)=>({from,to:(from+this.generator())%8})));
  readonly verdict=computed(()=>this.wave()<this.maxWave()?`○ EXPLORING — 還有 ${this.maxWave()-this.wave()} 層尚未展開`:this.reached().length===8?'✓ GENERATES ALL OF ℤ₈ — 每個 node 都可達':'○ STABLE PROPER SUBWORLD — 再按只會重訪已亮 nodes');
  readonly waveReading=computed(()=>this.wave()===0?'先停在 identity；尚未使用任何 action。':this.frontier().length?`剛新增 ${this.frontier().join(', ')}；它們的 shortest words 長度是 ${this.wave()}。`:'這一輪沒有新 node，reachability 已穩定。');
  selectGenerator(value:2|3){this.generator.set(value);this.wave.set(0);} expandNext(){this.wave.update(value=>Math.min(this.maxWave(),value+1));} finish(){this.wave.set(this.maxWave());}
  isReached(value:number){return this.reached().includes(value);} isFrontier(value:number){return this.frontier().includes(value);} node(value:number){return NODES[value];}
  edgeReached(edge:NetworkEdge){return this.isReached(edge.from)&&this.isReached(edge.to);}
  networkLabel(){return `模八加法中使用正負 ${this.generator()}，目前可達 ${this.reached().join('、')}`;}
  private computeLevels(step:number):number[][]{const seen=new Set([0]);const levels:number[][]=[[0]];let frontier=[0];while(frontier.length){const next:number[]=[];for(const value of frontier){for(const delta of [step,-step]){const target=((value+delta)%8+8)%8;if(!seen.has(target)){seen.add(target);next.push(target);}}}if(!next.length)break;levels.push(next.sort((a,b)=>a-b));frontier=next;}return levels;}
}
