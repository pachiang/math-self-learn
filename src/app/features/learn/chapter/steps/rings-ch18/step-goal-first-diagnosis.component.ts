import { Component, computed, signal } from '@angular/core';
import { DIAGNOSIS_PROMPTS, DiagnosisRoute, ROUTE_LABELS } from './rings-ch18-model';

@Component({
  selector: 'app-rings-ch18-goal-first-diagnosis', standalone: true,
  template: `
  <article class="algebra-v3-lesson rings-lesson rings-ch18-lesson">
    <header class="hero"><p class="eyebrow">Rings & Ideals · 18.1</p><h2>陌生問題先問目的，不先從記憶裡猜 theorem</h2><p class="lede">同樣出現quotient或ideal，可能是在建造relation、保護map、描述image、重建coordinates，或檢查multiplication。先找問題要求消失與保留的東西，route才會縮到唯一。</p></header>
    <span class="map-convention">CAPSTONE · QUESTION-FIRST DIAGNOSIS · ONE ACTIVE ROUTE AT A TIME</span>

    <section class="prediction"><div><p class="kicker">目前的問題卡</p><h3>{{ prompt().prompt }}</h3></div><p class="prediction-note">不要先想 theorem 名稱；先選第一個應檢查的 route。</p></section>
    <div class="control-row"><span class="kicker">CHOOSE ROUTE</span>@for(route of routes;track route){<button type="button" [class.active]="selected()===route" (click)="choose(route)">{{ shortLabel(route) }}</button>}<button type="button" (click)="nextPrompt()">NEXT PROBLEM</button><button type="button" (click)="reset()">RESET</button></div>

    <section class="stage stage-grid"><div class="diagnosis-lab">
      <div class="diagnosis-card"><span class="mini-label">CLIENT REQUEST · {{ index()+1 }} / {{ prompts.length }}</span><strong>{{ prompt().prompt }}</strong><span>{{ selected()===null ? 'route 尚未選擇' : correct() ? 'route matched' : 'route mismatch' }}</span></div>
      <div class="diagnosis-interview"><section class="diagnosis-question"><span class="mini-label">FIRST DIAGNOSTIC QUESTION</span><strong>{{ prompt().firstQuestion }}</strong><span>問題的動詞決定需要觀察的invariant。</span></section><div class="diagnosis-arrow">→</div><section class="diagnosis-answer" [class.revealed]="correct()"><span class="mini-label">ACTIVE ROUTE</span><strong>{{ selected()===null ? 'SELECT A ROUTE' : routeLabel(selected()!) }}</strong><span>{{ feedback() }}</span></section></div>
      <div class="route-map-strip">@for(route of routes;track route){<div [class.active]="correct()&&selected()===route">{{ routeLabel(route) }}</div>}</div>
    </div><aside class="console" aria-live="polite"><span class="evidence-badge">{{ correct() ? 'DIAGNOSIS COMPLETE · NOT A PROOF' : 'ROUTE SELECTION' }}</span><h3>{{ correct() ? 'START WITH THE RIGHT OBSERVABLE' : selected()===null ? 'WHAT MUST DISAPPEAR OR SURVIVE?' : 'THIS ROUTE ANSWERS A DIFFERENT QUESTION' }}</h3><p>{{ feedback() }}</p><div class="readout">prompt {{ index()+1 }}/{{ prompts.length }} · route {{ selected() ?? '?' }}</div></aside></section>

    <section class="insight"><span class="insight-icon">?</span><div><strong>Theorem 是 route 的終點；問題想讓什麼消失、保留什麼，才是入口</strong><span>先辨認observable，再選construction、map、paired views或multiplication detector。</span></div></section>
    <div class="next-question"><strong>NEXT QUESTION · 18.2</strong><p>如果需求是一句「讓兩個elements相同」，這句話會被編譯成哪個zero request？</p></div>
    <details><summary>這張 compass 的適用邊界</summary><p>Route selection只是解題的第一步，不是proof。它決定下一個應尋找的evidence：difference、kernel containment、image reachability、paired-map gates或quotient behavior witness。</p></details>
  </article>`,
})
export class RingsCh18GoalFirstDiagnosisComponent {
  readonly prompts=DIAGNOSIS_PROMPTS;readonly routes=Object.keys(ROUTE_LABELS) as DiagnosisRoute[];
  readonly index=signal(0);readonly selected=signal<DiagnosisRoute|null>(null);
  readonly prompt=computed(()=>this.prompts[this.index()]);readonly correct=computed(()=>this.selected()===this.prompt().route);
  routeLabel= (route:DiagnosisRoute)=>ROUTE_LABELS[route];
  shortLabel(route:DiagnosisRoute):string{return ({relation:'RELATION',descent:'MAP SURVIVAL',image:'MAP MEMORY',paired:'PAIRED VIEWS',domain:'NO ZERO CRASH',field:'INVERSE TO 1'} as const)[route];}
  choose(route:DiagnosisRoute):void{this.selected.set(route);}
  feedback():string{if(this.selected()===null)return '先讀需求中的動詞：make equal、descend、remember、reconstruct、avoid zero或invert。';if(this.correct())return `第一站是 ${this.routeLabel(this.prompt().route)}；現在才開始蒐集對應evidence。`;return `${this.routeLabel(this.selected()!)}無法直接回答這張問題卡；回到需求指定的observable。`;}
  nextPrompt():void{this.index.update(v=>(v+1)%this.prompts.length);this.selected.set(null);}
  reset():void{this.index.set(0);this.selected.set(null);}
}
