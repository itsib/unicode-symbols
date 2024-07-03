import { CategoryOfSymbols, TSymbol } from '../types';

export function sortSymbols(symbols: CategoryOfSymbols): (TSymbol & { idxFrom: number; idxTo: number })[] {
  if (!symbols.chars.length) {
    return [];
  }

  const chars = [];
  // Normalize objects
  for (let i = 0; i < symbols.chars.length; i++) {
    const _char = symbols.chars[i];
    if (_char.type === 'range') {
      if (_char.end === _char.begin) {
        continue;
      }

      chars.push({
        ..._char,
        begin: Math.min(_char.begin, _char.end),
        end: Math.max(_char.begin, _char.end),
      })
    } else {
      chars.push({ ..._char });
    }
  }

  // Sorting objects
  chars.sort((a, b) =>((a as any).code ?? (a as any).begin) - ((b as any).code ?? (b as any).begin))

  const sorted: (TSymbol & { idxFrom: number; idxTo: number })[] = [];
  let cursor = 0;

  for (let i = 0; i < chars.length; i++) {
    const _char = chars[i];
    let _last = sorted[sorted.length - 1];

    // Handle first symbol
    if (i === 0) {
      const delta = _char.type === 'range' ? _char.end - _char.begin : 0;
      sorted.push({
        ..._char,
        idxFrom: cursor,
        idxTo: cursor + delta,
      });
      cursor += delta;
    }
    // If one set intersects with another set
    else if (_char.type === 'range' && _last.type === 'range' && _char.begin <= _last.end) {
      const intersection = _last.end - _char.begin + 1;
      _last.end = _last.end - intersection;
      _last.idxTo = _last.idxTo - intersection;

      const idxFrom = (cursor - intersection) + 1;
      const idxTo = idxFrom + (_char.end - _char.begin);

      const _current = { ..._char, idxFrom, idxTo };
      sorted.push(_current);

      const diff = cursor - idxTo;
      if (cursor > idxTo) {
        const tail = {
          ..._last,
          begin: (_current.end + 1),
          end: _current.end + diff,
          idxFrom: _current.idxFrom + 1,
          idxTo: cursor,
        };
        sorted.push(tail);
      } else {
        cursor = idxTo;
      }
    }
    // If single symbol intersects with another set
    else if (_char.type !== 'range' && _last.type === 'range' && _char.code <= _last.end) {
      const intersection = _last.end - _char.code + 1;
      _last.end = _last.end - intersection;
      _last.idxTo = _last.idxTo - intersection;

      const idxFrom = (cursor - intersection) + 1;
      const idxTo = idxFrom;

      const _current = { ..._char, idxFrom, idxTo };
      sorted.push(_current);

      const diff = cursor - idxTo;
      if (cursor > idxTo) {
        const tail = {
          ..._last,
          begin: (_current.code + 1),
          end: _current.code + diff,
          idxFrom: _current.idxFrom + 1,
          idxTo: cursor,
        };
        sorted.push(tail);
      } else {
        cursor = idxTo;
      }
    }
    // Normal flow
    else {
      cursor = _last.idxTo + 1;

      const delta = _char.type === 'range' ? _char.end - _char.begin : 0;
      sorted.push({
        ..._char,
        idxFrom: cursor,
        idxTo: cursor + delta,
      });
    }
  }
  return sorted;
}