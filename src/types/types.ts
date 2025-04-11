export interface Block {
  height: number;
  hash: string;
}

export enum ActionName {
  PICK_UP = 'pickUp',
  PICK_UP_MANY = 'pickUpMany',
  REGISTER_MATCHING = 'registerMatching',
  CANCEL_MATCHING = 'cancelMatching',
  JOIN_SESSION = 'joinSession',
  SUBMIT_MOVE = 'submitMove',
  REGISTER_GLOVE = 'registerGlove',
  CREATE_SESSION = 'createSession',
  CREATE_USER = 'createUser',
  REFILL_ACTION_POINT = 'refillActionPoint'
}

export type GloveRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unknown';

export type HandType = 'rock' | 'paper' | 'scissors' | 'special' | 'unknown';