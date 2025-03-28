import type { HandType, GloveRarity } from '../types/types';

export const GetGloveType = (gloveId: string): HandType | 'special' | 'unknown' => {
    // 0x로 시작하면 앞 두 글자 제거
    const processedId = gloveId.startsWith('0x') ? gloveId.substring(2) : gloveId;
    
    // 첫 번째 글자로 타입 결정
    const typeChar = processedId.charAt(0);
    
    switch (typeChar) {
        case '0':
            return 'rock';
        case '1':
            return 'paper';
        case '2':
            return 'scissors';
        case '3':
            return 'special';
        default:
            return 'unknown';
    }
};

export const GetGloveRarity = (gloveId: string): GloveRarity => {
    // 0x로 시작하면 앞 두 글자 제거
    const processedId = gloveId.startsWith('0x') ? gloveId.substring(2) : gloveId;
    
    // 두 번째 글자로 희귀도 결정
    const rarityChar = processedId.charAt(1);
    
    switch (rarityChar) {
        case '0':
            return 'common';
        case '1':
            return 'uncommon';
        case '2':
            return 'rare';
        case '3':
            return 'epic';
        case '4':
            return 'legendary';
        default:
            return 'unknown';
    }
};
