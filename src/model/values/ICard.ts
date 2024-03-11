import { compare } from '../../utils/compare/compare.ts';

/** トランプのカードを表すインターフェイス。 */
export interface ICard {
  /** そのカードのスート。 */
  readonly suit: 'spade' | 'heart' | 'club' | 'diamond' | 'joker';

  /** そのカードのランク。 */
  readonly rank:
    | 'a'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | 'j'
    | 'q'
    | 'k'
    | 'joker';
}

export const compareCard = (a: ICard, b: ICard): number => {
  const compareRankResult = compare(rankToNumber(a.rank), rankToNumber(b.rank));
  if (compareRankResult !== 0) {
    return compareRankResult;
  }
  return compare(suitToNumber(a.suit), suitToNumber(b.suit));
};

const rankToNumber = (rank: ICard['rank']) =>
  (
    ({
      joker: 0,
      a: 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      j: 11,
      q: 12,
      k: 13,
    }) satisfies { [k in ICard['rank']]: number }
  )[rank];

const suitToNumber = (suit: ICard['suit']) =>
  (
    ({ spade: 0, heart: 1, club: 2, diamond: 3, joker: 4 }) satisfies {
      [k in ICard['suit']]: number;
    }
  )[suit];
