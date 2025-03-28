export interface Block {
  height: number;
  hash: string;
}

export type GloveRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unknown';

export type HandType = 'rock' | 'paper' | 'scissors' | 'special' | 'unknown';