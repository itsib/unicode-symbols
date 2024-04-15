import CurrenciesIcon from '../svg/currencies.svg?react'
import ArrowsIcon from '../svg/arrows.svg?react'
import RomanIcon from '../svg/roman.svg?react'
import MathIcon from '../svg/math.svg?react'
import LettersIcon from '../svg/letters.svg?react'
import SuperscriptIcon from '../svg/superscript.svg?react'
import OtherIcon from '../svg/other-signs.svg?react'
import DingbatsIcon from '../svg/dingbats.svg?react'

export const SYMBOLS = [
  {
    id: 'U+20A0',
    name: 'Currencies',
    Icon: CurrenciesIcon,
    ranges: [
      { from: 'U+20A0', to: 'U+20BF' }
    ],
  },
  {
    id: 'U+2150',
    name: 'Numbers',
    Icon: RomanIcon,
    ranges: [
      { from: 'U+2150', to: 'U+215F' },
      { from: 'U+2460', to: 'U+249B' },
      { from: 'U+24EA', to: 'U+24FF' },
      // { from: 'U+2700', to: 'U+27BF' },
    ]
  },
  {
    id: 'U+22A0',
    name: 'Math Operators',
    Icon: MathIcon,
    ranges: [
      { from: 'U+22A0', to: 'U+22FF' },
    ],
  },
  {
    id: 'U+2100',
    name: 'The Letters',
    Icon: LettersIcon,
    ranges: [
      { from: 'U+2100', to: 'U+214F' },
      { from: 'U+249C', to: 'U+24E9' },
    ]
  },
  {
    id: 'U+2070',
    name: 'Superscript & Subscript',
    Icon: SuperscriptIcon,
    ranges: [
      { from: 'U+2070', to: 'U+209C' }
    ]
  },

  {
    id: 'U+2190',
    name: 'Arrows',
    Icon: ArrowsIcon,
    ranges: [
      { from: 'U+2190', to: 'U+21FF' },
      { from: 'U+20D0', to: 'U+20D1' },
      { from: 'U+20D4', to: 'U+20D7' },
      { from: 'U+20E1', to: 'U+20E1' },
      { from: 'U+20EA', to: 'U+20EA' },
      { from: 'U+20EC', to: 'U+20EF' },
    ],
  },
  {
    id: 'U+2600',
    name: 'Other Signs',
    Icon: OtherIcon,
    ranges: [
      { from: 'U+2600', to: 'U+26C5' },
      { from: 'U+26C8', to: 'U+26C8' },
      { from: 'U+26CE', to: 'U+26FF' },
      { from: 'U+20D0', to: 'U+20F0' },
      { from: 'U+2300', to: 'U+23FF' },
      { from: 'U+2500', to: 'U+259F' },
    ],
  },
  {
    id: 'U+2700',
    name: 'Dingbats',
    Icon: DingbatsIcon,
    ranges: [
      { from: 'U+2700', to: 'U+27BF' }
    ],
  },
];