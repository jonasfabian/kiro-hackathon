import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player, Scoreboard } from '../../models/types';

interface PlayerScore {
  playerId: string;
  playerName: string;
  score: number;
  avatar: string;
}

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss'
})
export class ScoreboardComponent implements OnChanges {
  @Input() players: Player[] = [];
  @Input() scores: Scoreboard = {};
  
  playerScores: PlayerScore[] = [];

  ngOnChanges(): void {
    this.updatePlayerScores();
  }

  private updatePlayerScores(): void {
    this.playerScores = this.players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      score: this.scores[player.id] || 0,
      avatar: player.avatar
    })).sort((a, b) => b.score - a.score);
  }
}
