import AnimalsIcon from '../assets/images/animals.svg?react';
import ArrowsIcon from '../assets/images/arrows.svg?react';
import SpecialCharacterIcon from '../assets/images/special-character.svg?react';
import PictogramsIcon from '../assets/images/pictograms.svg?react';
import FoodIcon from '../assets/images/food.svg?react';
import LettersIcon from '../assets/images/letters.svg?react';
import MathIcon from '../assets/images/math.svg?react';
import NumbersIcon from '../assets/images/numbers.svg?react';
import OtherIcon from '../assets/images/other-signs.svg?react';
import SmilesIcon from '../assets/images/smiles.svg?react';
import FinanceIcon from '../assets/images/finance.svg?react';
import InterfaceIcon from '../assets/images/interface.svg?react';
import { CategoryIcons } from '../types';

export const SYMBOLS: CategoryIcons[] = [
  {
    id: 'smiles-people',
    name: 'Smiles & People',
    color: true,
    Icon: SmilesIcon,
    chars: [
      { type: 'range', start: 0x1f600, end: 0x1f64f },
      { type: 'range', start: 0x1F440, end: 0x1F450 },
      { type: 'range', start: 0x1F464, end: 0x1F483 },
      { type: 'range', start: 0x1F486, end: 0x1F487 },
      { type: 'single', code: 0x1F57A, name: 'Dancing man' },
      { type: 'single', code: 0x1F574, name: 'Agent' },
      { type: 'single', code: 0x1F575, name: 'Detective' },
      { type: 'single', code: 0x1F3C2, name: 'Snowboarder' },
      { type: 'single', code: 0x1F3C3, name: 'Runner' },
      { type: 'single', code: 0x1F385, name: 'Santa' }, //
      { type: 'single', code: 0x1F590, name: 'Palm with fingers raised' },
      { type: 'range', start: 0x1F595, end: 0x1F596 },
      { type: 'single', code: 0x1F5A4, name: 'Black Heard' },
    ],
  },
  {
    id: 'animals-nature',
    name: 'Animals & Nature',
    Icon: AnimalsIcon,
    color: true,
    chars: [
      { type: 'range', start: 0x1F331, end: 0x1F344 },
      { type: 'range', start: 0x1F400, end: 0x1F43F },
      { type: 'range', start: 0x1F577, end: 0x1F578 },
    ],
  },
  {
    id: 'food-drink',
    name: 'Food & Drink',
    Icon: FoodIcon,
    color: true,
    chars: [
      { type: 'range', start: 0x1F32D, end: 0x1F330 },
      { type: 'range', start: 0x1F345, end: 0x1F37F },
      { type: 'single', code: 0x1F382, name: 'Cake' }
    ],
  },
  {
    id: 'interface',
    name: 'Interface',
    Icon: InterfaceIcon,
    color: true,
    chars: [
      { type: 'range', start: 0x1F4BD, end: 0x1F4CB },
      { type: 'range', start: 0x1F4DD, end: 0x1F4F6 },
      { type: 'range', start: 0x1F500, end: 0x1F524 },
      { type: 'range', start: 0x1F532, end: 0x1F53D },
      { type: 'single', code: 0x1F579, name: 'Joystick' },
      { type: 'single', code: 0x1F4BB, name: 'Computer' },
      { type: 'single', code: 0x1F525, name: 'Fire' },
      { type: 'single', code: 0x1F587, name: 'Paper clips' },
      { type: 'single', code: 0x1F5A5, name: 'Monitor' },
      { type: 'single', code: 0x1F5A8, name: 'Printer' },
      { type: 'single', code: 0x1F5B1, name: 'Mouse' },
      { type: 'single', code: 0x1F5B2, name: 'Red Button' },
      { type: 'single', code: 0x1F5BC, name: 'Wall Picture' },
      { type: 'single', code: 0x1F5C2, name: 'Folder' },
      { type: 'single', code: 0x1F5C3, name: 'Card Box' },
      { type: 'single', code: 0x1F5C4, name: 'Closed Box' },
      { type: 'single', code: 0x1F5D1, name: 'Backed' },
      { type: 'range', start: 0x1F5D2, end: 0x1F5D3 },
      { type: 'range', start: 0x1F5DC, end: 0x1F5DD }
    ],
  },
  {
    id: 'letters',
    name: 'The Letters',
    Icon: LettersIcon,
    color: false,
    chars: [
      { type: 'range', start: 8448, end: 8527 },
      { type: 'range', start: 9372, end: 9449 },
    ]
  },
  {
    id: 'numbers',
    name: 'Numbers',
    Icon: NumbersIcon,
    color: false,
    chars: [
      { type: 'range', start: 8528, end: 8543 },
      { type: 'range', start: 9312, end: 9371 },
      { type: 'range', start: 9450, end: 9471 },
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    Icon: FinanceIcon,
    color: true,
    chars: [
      { type: 'range', start: 0x1F4B0, end: 0x1F4B9 },
      { type: 'single', code: 0x1F3DB, name: 'Stock Market' },
      { type: 'single', code: 0x1F3E6, name: 'Bank' },
      { type: 'single', code: 0x1F3E7, name: 'ATM' },
      { type: 'divider' },
      { type: 'range', start: 8352, end: 8383 },
    ],
  },
  {
    id: 'math-operators',
    name: 'Math Operators',
    Icon: MathIcon,
    color: false,
    chars: [
      { type: 'range', start: 8864, end: 8959 },
    ],
  },
  {
    id: 'arrows',
    name: 'Arrows',
    Icon: ArrowsIcon,
    color: false,
    chars: [
      { type: 'range', start: 8592, end: 8703 },
      { type: 'range', start: 8400, end: 8401 },
      { type: 'range', start: 8404, end: 8407 },
      { type: 'single', code: 8417, name: 'Superscript right-left arrow' },
      { type: 'single', code: 8426, name: 'Overlapping arrow to the left' },
      { type: 'range', start: 8428, end: 8431 },
    ],
  },
  {
    id: 'symbols-pictograms',
    name: 'Symbols & Pictograms',
    Icon: PictogramsIcon,
    color: true,
    chars: [
      { type: 'range', start: 0x1F300, end: 0x1F32C, skip: [0x1F322, 0x1F323] },
      { type: 'range', start: 0x1F380, end: 0x1F381 },
      { type: 'range', start: 0x1F383, end: 0x1F3FF, skip: [0x1F394, 0x1F395, 0x1F39C, 0x1F39D, 0x1F3F1, 0x1F3F2, 0x1F398, 0x1F3F6] },
      { type: 'range', start: 0x1F451, end: 0x1F463 },
      { type: 'range', start: 0x1F484, end: 0x1F485 },
      { type: 'range', start: 0x1F488, end: 0x1F4AF },
      { type: 'range', start: 0x1F4BA, end: 0x1F4BC },
      { type: 'range', start: 0x1F4CC, end: 0x1F4DC },
      { type: 'range', start: 0x1F4F7, end: 0x1F4FF, skip: [0x1F4FE] },
      { type: 'range', start: 0x1F525, end: 0x1F531 },
      { type: 'range', start: 0x1F549, end: 0x1F54E },
      { type: 'range', start: 0x1F550, end: 0x1F567 },
      { type: 'single', code: 0x1F56F, name: 'Candle' },
      { type: 'single', code: 0x1F570, name: 'Mantel Clock' },
      { type: 'range', start: 0x1F573, end: 0x1F576 },
      { type: 'range', start: 0x1F58A, end: 0x1F58D },
    ],
  },
  {
    id: 'other-signs',
    name: 'Other Signs',
    Icon: OtherIcon,
    color: false,
    chars: [
      { type: 'range', start: 0x2000, end: 0x4000 },
      // { type: 'range', start: 9728, end: 9925 },
      // { type: 'single', code: 9928, name: 'A thundercloud with rain' },
      // { type: 'range', start: 9934, end: 9983 },
      // { type: 'range', start: 8400, end: 8432 },
      // { type: 'range', start: 8960, end: 9215 },
      // { type: 'range', start: 9472, end: 9631 },
    ],
  },
  {
    id: 'special-character',
    name: 'Special Characters',
    Icon: SpecialCharacterIcon,
    color: false,
    chars: [
      { type: 'special', code: 0x2000, mnemonic: 'NQSP', name: 'En Quad' },
      { type: 'special', code: 0x2001, mnemonic: 'MQSP', name: 'Em Quad' },
      { type: 'special', code: 0x2002, mnemonic: 'ENSP', name: 'En Space' },
      { type: 'special', code: 0x2003, mnemonic: 'EMSP', name: 'Em Space' },
      { type: 'special', code: 0x2004, mnemonic: '3/MSP', name: 'Three-Per-Em Space' },
      { type: 'special', code: 0x2005, mnemonic: '4/MSP', name: 'Four-Per-Em Space' },
      { type: 'special', code: 0x2006, mnemonic: '6/MSP', name: 'Six-Per-Em Space' },
    ],
  },
];