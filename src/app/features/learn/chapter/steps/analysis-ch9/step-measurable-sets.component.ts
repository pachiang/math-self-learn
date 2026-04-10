import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-measurable-sets',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="可測集與 σ-代數" subtitle="§9.3">
      <p>
        外測度的問題：m*(A ∪ B) 不一定等於 m*(A) + m*(B)（即使 A、B 不相交）。
        需要篩選「行為良好」的集合。
      </p>
      <p>
        <strong>Carathéodory 條件</strong>：E 是可測的，如果對任何 A ⊂ R：
      </p>
      <p class="formula">
        m*(A) = m*(A ∩ E) + m*(A ∩ Eᶜ)
      </p>
      <p>
        直覺：E 「乾淨地」把任何集合切成兩半，不損失也不增加外測度。
      </p>
      <p>
        所有可測集構成一個 <strong>σ-代數</strong>（對補集、可數聯集、可數交集封閉）。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="σ-代數的三個性質">
      <div class="axioms">
        <div class="ax-card">
          <div class="ax-num">1</div>
          <div class="ax-body">
            <div class="ax-title">包含 ∅ 和 R</div>
            <div class="ax-desc">空集和全空間都是可測的。</div>
          </div>
        </div>
        <div class="ax-card">
          <div class="ax-num">2</div>
          <div class="ax-body">
            <div class="ax-title">對補集封閉</div>
            <div class="ax-desc">E 可測 → Eᶜ 可測。</div>
          </div>
        </div>
        <div class="ax-card">
          <div class="ax-num">3</div>
          <div class="ax-body">
            <div class="ax-title">對可數聯集封閉</div>
            <div class="ax-desc">E₁, E₂, … 可測 → ∪Eₙ 可測。</div>
          </div>
        </div>
      </div>

      <div class="examples">
        <div class="ex-title">哪些集合可測？</div>
        <div class="ex-grid">
          <div class="ex-card ok">
            <div class="ec-name">開集</div>
            <div class="ec-why">開區間的可數聯集</div>
          </div>
          <div class="ex-card ok">
            <div class="ec-name">閉集</div>
            <div class="ec-why">開集的補集</div>
          </div>
          <div class="ex-card ok">
            <div class="ec-name">Gδ 集</div>
            <div class="ec-why">可數多個開集的交</div>
          </div>
          <div class="ex-card ok">
            <div class="ec-name">Fσ 集</div>
            <div class="ec-why">可數多個閉集的聯</div>
          </div>
          <div class="ex-card ok">
            <div class="ec-name">可數集</div>
            <div class="ec-why">測度零 → 可測</div>
          </div>
          <div class="ex-card bad">
            <div class="ec-name">Vitali 集</div>
            <div class="ec-why">不可測！（§9.6）</div>
          </div>
        </div>
      </div>

      <div class="insight">
        好消息：你在實際中遇到的集合<strong>幾乎全部可測</strong>。
        不可測集需要選擇公理才能構造——它們不是「自然出現」的。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>下一節看 Lebesgue 測度滿足的重要性質。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .axioms { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .ax-card { display: flex; gap: 12px; padding: 12px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface); }
    .ax-num { width: 28px; height: 28px; border-radius: 50%; background: var(--accent);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; flex-shrink: 0; }
    .ax-title { font-size: 14px; font-weight: 700; color: var(--text); }
    .ax-desc { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
    .examples { margin-bottom: 14px; }
    .ex-title { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
    .ex-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    @media (max-width: 500px) { .ex-grid { grid-template-columns: 1fr 1fr; } }
    .ex-card { padding: 10px; border: 1px solid var(--border); border-radius: 6px; text-align: center;
      &.ok { background: rgba(90,138,90,0.06); border-color: rgba(90,138,90,0.3); }
      &.bad { background: rgba(160,90,90,0.06); border-color: rgba(160,90,90,0.3); } }
    .ec-name { font-size: 13px; font-weight: 700; color: var(--text); }
    .ec-why { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
    .insight { padding: 12px; text-align: center; font-size: 13px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border);
      strong { color: var(--accent); } }
  `,
})
export class StepMeasurableSetsComponent {}
