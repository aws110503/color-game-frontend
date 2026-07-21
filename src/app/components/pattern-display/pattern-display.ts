import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pattern-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pattern-display.html',
  styleUrls: ['./pattern-display.css']
})
export class PatternDisplay {
  @Input() grid: string[][] = [];
  @Input() mode: 'exposure' | 'input' | 'result' = 'exposure';
  @Input() selectedCell: { row: number; col: number } | null = null;
  @Input() exactHeatmap: boolean[][] | null = null;
  @Input() familyHeatmap: boolean[][] | null = null;

  @Output() cellClick = new EventEmitter<{ row: number; col: number }>();

  // Map color names to CSS classes
  private colorClassMap: Record<string, string> = {
    'red': 'cell-red',
    'blue': 'cell-blue',
    'green': 'cell-green',
    'yellow': 'cell-yellow',
    'orange': 'cell-orange',
    'purple': 'cell-purple',
    'pink': 'cell-pink',
    'cyan': 'cell-cyan'
  };

  getCellClass(row: number, col: number): string {
    const classes: string[] = [];
    
    if (this.mode === 'input' && this.selectedCell?.row === row && this.selectedCell?.col === col) {
      classes.push('selected');
    }
    
    if (this.mode === 'result' && this.exactHeatmap && this.familyHeatmap) {
      if (this.exactHeatmap[row]?.[col]) {
        classes.push('exact-match');
      } else if (this.familyHeatmap[row]?.[col]) {
        classes.push('family-match');
      } else if (this.grid[row]?.[col]) {
        classes.push('wrong');
      }
    }
    
    return classes.join(' ');
  }

  onCellClick(row: number, col: number) {
    if (this.mode === 'input') {
      this.cellClick.emit({ row, col });
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}