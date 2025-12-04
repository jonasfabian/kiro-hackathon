import { Scoreboard, PlayerRanking, Player } from '../models/types';

export class ScoringEngine {
  private scores: Map<string, number>;
  private players: Map<string, Player>;

  constructor() {
    this.scores = new Map();
    this.players = new Map();
  }

  /**
   * Calculate points based on guess timing
   * Earlier guesses earn more points
   * Formula: basePoints * (timeRemaining / roundDuration)
   * First correct guess gets bonus
   */
  calculatePoints(guessTime: number, roundDuration: number, guessOrder: number): number {
    const basePoints = 1000;
    const timeRemaining = roundDuration - guessTime;
    
    // Time-based scoring: more points for faster guesses
    const timeMultiplier = Math.max(0, timeRemaining / roundDuration);
    let points = Math.floor(basePoints * timeMultiplier);
    
    // Bonus for first correct guess
    if (guessOrder === 1) {
      points += 500;
    } else if (guessOrder === 2) {
      points += 250;
    } else if (guessOrder === 3) {
      points += 100;
    }
    
    return Math.max(points, 100); // Minimum 100 points for correct guess
  }

  updateScore(playerId: string, points: number): void {
    const currentScore = this.scores.get(playerId) || 0;
    this.scores.set(playerId, currentScore + points);
  }

  getScore(playerId: string): number {
    return this.scores.get(playerId) || 0;
  }

  getScoreboard(): Scoreboard {
    const scoreboard: Scoreboard = {};
    this.scores.forEach((score, playerId) => {
      scoreboard[playerId] = score;
    });
    return scoreboard;
  }

  setPlayers(players: Map<string, Player>): void {
    this.players = players;
  }

  getFinalRankings(): PlayerRanking[] {
    const rankings: PlayerRanking[] = [];
    
    this.scores.forEach((score, playerId) => {
      const player = this.players.get(playerId);
      if (player) {
        rankings.push({
          playerId,
          playerName: player.name,
          score,
          rank: 0 // Will be set after sorting
        });
      }
    });
    
    // Sort by score descending
    rankings.sort((a, b) => b.score - a.score);
    
    // Assign ranks
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });
    
    return rankings;
  }

  reset(): void {
    this.scores.clear();
  }
}
