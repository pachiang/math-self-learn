import { Component, inject, signal } from '@angular/core';
import { ShapeCanvasComponent } from './components/shape-canvas/shape-canvas.component';
import { OperationPanelComponent } from './components/operation-panel/operation-panel.component';
import { CayleyTableComponent } from './components/cayley-table/cayley-table.component';
import { StateTrackerComponent } from './components/state-tracker/state-tracker.component';
import { GroupStateService } from '../../core/services/group-state.service';
import { GROUP_PRESETS, GroupPreset } from '../../core/math/groups';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [
    ShapeCanvasComponent,
    OperationPanelComponent,
    CayleyTableComponent,
    StateTrackerComponent,
  ],
  templateUrl: './explorer.component.html',
  styleUrl: './explorer.component.scss',
})
export class ExplorerComponent {
  private readonly groupState = inject(GroupStateService);

  readonly presets = GROUP_PRESETS;
  readonly activePresetId = signal('d3');

  selectGroup(preset: GroupPreset): void {
    this.activePresetId.set(preset.id);
    this.groupState.setGroup(preset.factory());
  }

  get groupNotation(): string {
    return this.groupState.group().notation;
  }

  get groupDescription(): string {
    return this.groupState.group().description;
  }
}
