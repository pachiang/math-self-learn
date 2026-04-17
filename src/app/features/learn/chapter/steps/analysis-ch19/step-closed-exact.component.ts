import { Component } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-closed-exact',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="閉形式與恰當形式" subtitle="§19.7">
      <p>兩個核心概念：</p>
      <ul>
        <li><strong>閉</strong>（closed）：dω = 0</li>
        <li><strong>恰當</strong>（exact）：ω = dα（某個低一階形式的外微分）</li>
      </ul>
      <p>因為 dd = 0 → <strong>恰當 ⇒ 閉</strong>。但反過來呢？</p>
    </app-prose-block>

    <app-challenge-card prompt="closed vs exact：什麼時候反過來也成立？">
      <div class="chain-box">
        <div class="chain-title">de Rham 複形</div>
        <div class="chain">
          <span class="chain-node">0-forms</span>
          <span class="chain-arrow">→ d →</span>
          <span class="chain-node">1-forms</span>
          <span class="chain-arrow">→ d →</span>
          <span class="chain-node">2-forms</span>
          <span class="chain-arrow">→ d →</span>
          <span class="chain-node">...</span>
        </div>
        <div class="chain-sub">dd = 0 保證 im(d) ⊂ ker(d)，即恰當 ⊂ 閉</div>
      </div>

      <div class="poincare">
        <div class="p-title">Poincare 引理</div>
        <div class="p-body">
          在<strong>可縮空間</strong>（contractible，如 R^n、凸集）上：<br>
          <strong>閉 ⇔ 恰當</strong>。每個閉形式都有「原函數」。
        </div>
        <div class="p-counter">
          但在有洞的空間上（如 R²∖(0,0)）：<br>
          ω = (−y dx + x dy)/(x²+y²) 是閉的（dω = 0），
          但<strong>不恰當</strong>（∮ ω = 2π ≠ 0）。<br>
          <strong>洞阻止了「找原函數」</strong>。
        </div>
      </div>

      <div class="cohomology">
        <strong>de Rham 上同調</strong>：H^k = (閉 k-forms) / (恰當 k-forms)。<br>
        它測量的是空間的「洞」——拓撲不變量。
        H¹(R²∖0) ≅ R（一維，因為繞原點一圈的「角度」是唯一的非恰當閉形式）。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        這裡分析（微分形式）和拓撲（空間的形狀）深刻地交織在一起——
        <strong>de Rham 定理</strong>說：用微分形式算出的上同調 = 用拓撲方法算出的上同調。
        分析 = 拓撲。
      </p>
    </app-prose-block>
  `,
  styles: `
    .chain-box { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface); margin-bottom: 14px; }
    .chain-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .chain { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;
      font-family: 'JetBrains Mono', monospace; font-size: 13px; margin-bottom: 6px; }
    .chain-node { padding: 6px 12px; border-radius: 6px; background: var(--accent-10); color: var(--accent); font-weight: 600; }
    .chain-arrow { color: var(--text-muted); font-weight: 700; }
    .chain-sub { font-size: 11px; color: var(--text-muted); text-align: center; }
    .poincare { margin-bottom: 14px; }
    .p-title { font-size: 14px; font-weight: 700; color: #5a8a5a; margin-bottom: 6px; }
    .p-body { padding: 10px; border-radius: 8px; background: rgba(90,138,90,0.06); border: 1px solid rgba(90,138,90,0.2);
      font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.7; }
    .p-body strong { color: #5a8a5a; }
    .p-counter { padding: 10px; border-radius: 8px; background: rgba(160,90,90,0.06); border: 1px solid rgba(160,90,90,0.2);
      font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .p-counter strong { color: #a05a5a; }
    .cohomology { padding: 12px; border-radius: 8px; background: var(--accent-10); border: 2px solid var(--accent);
      font-size: 12px; text-align: center; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; line-height: 1.8; }
    .cohomology strong { color: var(--accent); }
  `,
})
export class StepClosedExactComponent {}
