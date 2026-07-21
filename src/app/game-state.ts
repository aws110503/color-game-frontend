import { Injectable, signal } from '@angular/core';

// Shape of the data carried from Lobby (where a round is started) to Play
// (where it's actually shown, memorized, and submitted). Matches exactly
// what Lobby.startRound() builds and what Play.ngOnInit() reads.
export interface ActiveRound {
  roundId: number;
  gridSize: string;
  exposureTime: number;
  targetGrid: string[][];
}

// Holds the in-progress round's data between the Lobby and Play pages.
// A plain signal-based service is enough here (per the spec's own guidance
// on state management) — no NgRx needed for something this simple.
@Injectable({ providedIn: 'root' })
export class GameStateService {
  private _activeRound = signal<ActiveRound | null>(null);

  // Exposed as a read-only signal so components can react to changes,
  // but can't accidentally mutate the state directly from outside this service.
  activeRound = this._activeRound.asReadonly();

  setActiveRound(round: ActiveRound) {
    this._activeRound.set(round);
  }

  // Called once a round is fully finished (after showing results) or abandoned,
  // so a stale round can't accidentally be reused on a later visit to /play.
  clear() {
    this._activeRound.set(null);
  }
}