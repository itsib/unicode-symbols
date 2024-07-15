import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const SOURCE = path.resolve(process.cwd(), 'src/assets/data/emoji-src.csv');
const DIST = path.resolve(process.cwd(), 'src/assets/data/emoji.csv');

const SKIN_MOD = 0x1F3FF; // 0x1F3FB, 0x1F3FC, 0x1F3FD, 0x1F3FE, 0x1F3FF

const HAIR_MOD = 0x1F9B3; // 0x1F9B0, 0x1F9B1, 0x1F9B2, 0x1F9B3

const JOINER = 0x200D;

const RESTYLE = 0xFE0F;

export function parseCode(raw) {
  if (!raw) {
    return null;
  }
  const parsed = parseInt(raw, 16);
  if (parsed == null || isNaN(parsed)) {
    console.warn(`Parse error`, raw);
    return null;
  }
  return parsed;
}

export function toHex(code) {
  return code.toString(16).toUpperCase();
}

export function parseLine(line, menuId) {
  let [codesRaw, otherRaw] = line.split(';');
  codesRaw = codesRaw.trim();
  if (!codesRaw)  {
    return null;
  }
  // Parse name
  let name = (otherRaw || '').split(/E\d+\.\d\s/)?.[1] || '';
  if (name.startsWith('flag:')) {
    name = name.replace('flag:', 'flag -');
  }
  if (name.startsWith('keycap:')) {
    name = name.replace('keycap:', 'keycap -');
  }


  // Parse codes
  const codes = codesRaw.split(/\s+/).map(parseCode).filter(Boolean);

  return { name, codes }
}

async function start() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST);
  }

  const writer = fs.createWriteStream(DIST, { encoding: 'utf8' });

  const rl = readline.createInterface({
    input: fs.createReadStream(SOURCE, { encoding: 'utf8' }),
    historySize: 10,
    terminal: false,
    crlfDelay: Infinity,
  });

  let prevCode = null;
  let prevSkin = false;
  let prevName = null;
  let prevEmoji = null;

  for await (const line of rl) {
    if (line.startsWith('# group:')) {
      if (prevCode != null) {
        writer.write(`${prevCode};${JSON.stringify(prevSkin)};${prevName};${prevEmoji}\n`);
        prevCode = null;
        prevSkin = false;
        prevName = null;
        prevEmoji = null;
      }


      writer.write(line + '\n');
      continue;
    }

    const data = parseLine(line);
    if (!data || data.codes.length > 2) {
      continue;
    }

    let [primary, secondary] = data.codes;
    const skin = !!secondary && (SKIN_MOD^secondary) <= 4;
    secondary = !secondary || secondary === JOINER || secondary === RESTYLE || (HAIR_MOD^secondary) <= 3 || (SKIN_MOD^secondary) <= 4 ? undefined  : secondary;

    const hex = secondary ? `${toHex(primary)},${toHex(secondary)}` : toHex(primary);

    const emoji = secondary ? String.fromCodePoint(primary, secondary) : String.fromCodePoint(primary);

    if (prevCode == null) {
      prevCode = hex;
      prevSkin = skin;
      prevName = data.name;
      prevEmoji = emoji;
    }

    if (prevCode != null && prevCode !== hex) {
      writer.write(`${prevCode};${JSON.stringify(prevSkin)};${prevName};${prevEmoji}\n`);
      prevCode = null;
      prevSkin = false;
      prevName = null;
      prevEmoji = null;
    }

    prevSkin = prevSkin || skin;
  }

  rl.close();
}

start().catch(console.error);