import CurrenciesIcon from '../svg/currencies.svg?react'
import ArrowsIcon from '../svg/arrows.svg?react'
import AnimalsIcon from '../svg/animals.svg?react'
import MathIcon from '../svg/math.svg?react'
import LettersIcon from '../svg/letters.svg?react'
import SuperscriptIcon from '../svg/superscript.svg?react'
import OtherIcon from '../svg/other-signs.svg?react'
import DingbatsIcon from '../svg/dingbats.svg?react'
import NumbersIcon from '../svg/numbers.svg?react'
import SmilesIcon from '../svg/smiles.svg?react'
import FoodIcon from '../svg/food.svg?react'
import { CategoryIcons } from '../types';

export const SYMBOLS: CategoryIcons[] = [
  {
    id: 'RDd28cQb1YHCBPI',
    name: 'Smiles & People',
    color: true,
    Icon: SmilesIcon,
    chars: [
      { start: 128064, end: 128159 },
      { start: 128512, end: 128591 },
    ],
  },
  {
    id: '1bnMzYlh3FC1Wsu',
    name: 'Animals & Nature',
    Icon: AnimalsIcon,
    color: true,
    chars: [
      // { encode: 'UTF-8', start: 4036989056, end: 4036989119 },
      { start: 128000, end: 128063 },
    ],
  },
  {
    id: 'T2OVtTvtGMkScf5',
    name: 'Food & Drink',
    Icon: FoodIcon,
    color: true,
    chars: [
      { start: 127812, end: 127874 },
    ],
  },
  {
    id: 'hZkuqmzMdUISpo9',
    name: 'Dingbats',
    Icon: DingbatsIcon,
    color: true,
    chars: [
      { start: 9984, end: 10175 },
    ],
  },
  // Mono
  {
    id: 'ES3mw6pDVxdo1Mx',
    name: 'The Letters',
    Icon: LettersIcon,
    color: false,
    chars: [
      { start: 8448, end: 8527 },
      { start: 9372, end: 9449 },
    ]
  },
  {
    id: 'kGFo5XcZrKVlXe7',
    name: 'Numbers',
    Icon: NumbersIcon,
    color: false,
    chars: [
      { start: 8528, end: 8543 },
      { start: 9312, end: 9371 },
      { start: 9450, end: 9471 },
    ]
  },
  {
    id: 'THKYGS24Fn01Fev',
    name: 'Currencies',
    Icon: CurrenciesIcon,
    color: false,
    chars: [
      { start: 8352, end: 8383 },
    ],
  },
  {
    id: 'ooiX0xNYdIhzsAc',
    name: 'Arrows',
    Icon: ArrowsIcon,
    color: false,
    chars: [
      { start: 8592, end: 8703 },
      { start: 8400, end: 8401 },
      { start: 8404, end: 8407 },
      { code: 8417, name: 'Superscript right-left arrow' },
      { code: 8426, name: 'Overlapping arrow to the left' },
      { start: 8428, end: 8431 },
    ],
  },
  {
    id: 'w5gCFen6ic2HpmP',
    name: 'Math Operators',
    Icon: MathIcon,
    color: false,
    chars: [
      { start: 8864, end: 8959 },
    ],
  },
  {
    id: 'cEWsKj2hJmBcGEz',
    name: 'Other Signs',
    Icon: OtherIcon,
    color: false,
    chars: [
      { start: 9728, end: 9925 },
      { code: 9928, name: 'A thundercloud with rain' },
      { start: 9934, end: 9983 },
      { start: 8400, end: 8432 },
      { start: 8960, end: 9215 },
      { start: 9472, end: 9631 },
    ],
  },
];