import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth';
import { GameStateService } from '../../game-state';
import { PatternDisplay } from '../../components/pattern-display/pattern-display';

type Phase = 'exposure' | 'input' | 'result';

interface RoundResult {
  roundId: number;
  playerScore: number;
  verdict: string;
  dominantMistake: string;
  exactMatchHeatmap: boolean[][];
  familyMatchHeatmap: boolean[][];
}

// Must match PromptBuilder.AVAILABLE_COLORS on the backend exactly — these are also
// valid CSS color keywords, so we can use them directly as background-color values.
const AVAILABLE_COLORS = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'cyan'];

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [RouterLink, PatternDisplay],
  templateUrl: './play.html',
  styleUrls: ['./play.css']
})
export class Play implements OnInit, OnDestroy {
  phase = signal<Phase>('exposure');
  targetGrid: string[][] = [];
  playerGrid = signal<string[][]>([]);
  selectedCell = signal<{ row: number; col: number } | null>(null);
  secondsLeft = signal(0);
  submitting = signal(false);
  errorMessage = signal('');
  result = signal<RoundResult | null>(null);

  colors = AVAILABLE_COLORS;

  private roundId!: number;
  private timerHandle: ReturnType<typeof setInterval> | undefined;
  private apiUrl = 'http://localhost:8080/api/game';

  constructor(
    private http: HttpClient,
    public auth: AuthService,
    private router: Router,
    private gameState: GameStateService
  ) {}

  ngOnInit() {
    const active = this.gameState.activeRound();
    if (!active) {
      // No round in progress — e.g. page refresh, or direct URL navigation
      // without going through Lobby first. Send the player back to start one.
      this.router.navigate(['/lobby']);
      return;
    }

    this.roundId = active.roundId;
    this.targetGrid = active.targetGrid;
    this.secondsLeft.set(active.exposureTime);

    // Blank grid, same dimensions as the target, ready for the player to fill in
    this.playerGrid.set(active.targetGrid.map(row => row.map(() => '')));

    this.timerHandle = setInterval(() => {
      this.secondsLeft.update(s => s - 1);
      if (this.secondsLeft() <= 0) {
        clearInterval(this.timerHandle);
        this.phase.set('input');
      }
    }, 1000);
  }

  ngOnDestroy() {
    // Prevent the timer from firing after the player navigates away mid-exposure
    if (this.timerHandle) clearInterval(this.timerHandle);
  }

  onCellClick(pos: { row: number; col: number }) {
    this.selectedCell.set(pos);
  }

  pickColor(color: string) {
    const sel = this.selectedCell();
    if (!sel) return;

    this.playerGrid.update(grid => {
      const copy = grid.map(row => [...row]); // Immutable update so the signal actually triggers change detection
      copy[sel.row][sel.col] = color;
      return copy;
    });
    this.selectedCell.set(null);
  }

  allCellsFilled = computed(() =>
    this.playerGrid().every(row => row.every(cell => cell !== ''))
  );

  submit() {
    if (!this.allCellsFilled()) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    this.http.post<RoundResult>(`${this.apiUrl}/submit`, {
      roundId: this.roundId,
      playerGrid: this.playerGrid()
    }).subscribe({
      next: (res) => {
        this.result.set(res);
        this.phase.set('result');
        this.submitting.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error ?? 'Erreur lors de la soumission.');
      }
    });
  }

  playAgain() {
    this.gameState.clear();
    this.router.navigate(['/lobby']);
  }
}