export interface Session {
  id: string;
  startAt: Date;
  rule: string;
  prize: string;
}

export type HandType = 'rock' | 'paper' | 'scissors'; 