export interface Session {
  id: string;
  rule: string;
  prize: string;
}

export interface Block {
  index: number;
  hash: string;
}

export type HandType = 'rock' | 'paper' | 'scissors'; 