import { TarotCard } from '../types';

export const getCardImageUrl = (card: TarotCard) => {
  const baseUrl = "https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/";
  if (card.arcana === 'Major') {
    const num = card.number.toString().padStart(2, '0');
    return `${baseUrl}m${num}.jpg`;
  } else {
    const suitMap: Record<string, string> = {
      Wands: 'w',
      Cups: 'c',
      Swords: 's',
      Pentacles: 'p'
    };
    const suitChar = suitMap[card.suit || 'Wands'];
    const num = card.number.toString().padStart(2, '0');
    return `${baseUrl}${suitChar}${num}.jpg`;
  }
};
