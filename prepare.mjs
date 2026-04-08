/**
 * @typedef {Object} LineData
 * @property {string} codes
 * @property {string[]} join
 * @property {string} name
 * @property {number} options
 * @property {string|undefined} emoji
 */
/**
 * @typedef {(line: string, index: number, isLast: boolean) => string | null | undefined | Symbol} LineTransformer
 */
/**
 * @typedef {Object} LoadFileOptions
 * @property {string} src - Source file URL
 * @property {string} dist - Destination file path
 * @property {LineTransformer} [transform] - Call every line entry, you can return string to override line or return null for skip line write.
 */
/**
 * @typedef {Object} LoadFileContext
 * @property {number} readIndex
 * @property {number} writeIndex
 * @property {boolean} isEnd
 * @property {any} data
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const BLOCKS_URL = 'https://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt'
const UNICODE_DATA_URL = 'https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt'
const EMOJI_URL = 'https://www.unicode.org/Public/UCD/latest/emoji/emoji-test.txt'

const BLOCKS_FILE = path.resolve(process.cwd(), 'src/assets/data/blocks.csv');
const UNICODE_FILE = path.resolve(process.cwd(), 'src/assets/data/unicode.csv');
const EMOJI_FILE = path.resolve(process.cwd(), 'src/assets/data/emoji.csv');

/**
 * Names of blocks namespace
 *
 * @type {{[number]: string}}
 */
const PLANE = {
  [0]: 'Basic Multilingual Plane',
  [0x10000]: 'Supplementary Multilingual Plane',
  [0x20000]: 'Supplementary Ideographic Plane',
  [0x30000]: 'Tertiary Ideographic Plane',
  [0xE0000]: 'Supplementary Special-purpose Plane',
  [0xF0000]: 'Supplementary Private Use Area planes',
  [0x100000]: 'Supplementary Private Use Area planes'
}

/**
 * A mapping of these status values to RGI Emoji Qualification property values
 * @type {{[string]: string}}
 */
const QUALIFICATION = {
  'component': 'co',
  'fully-qualified': 'fq',
  'minimally-qualified': 'mq',
  'unqualified': 'un'
}

/**
 * Convert number to hex string
 * @param {number} code integer number
 * @returns {string}
 */
function toHex(code) {
  return code.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Convert hex to int
 * @param {string} hex
 * @return {number}
 */
function toInt(hex) {
  if (!hex) {
    throw new Error('No code given.');
  }
  const parsed = parseInt(hex.trim(), 16);
  if (parsed == null || isNaN(parsed)) {
    throw new Error('Code parse error.');
  }
  return parsed;
}

/**
 * Load and save file
 *
 * @param {LoadFileOptions} options
 * @return {Promise<void>}
 */
function loadDataFile(options) {
  const { src, dist, transform } = options || {}

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dist, 'utf8')

    https.get(src, async (res) => {
      res.setEncoding('utf8');

      if (res.statusCode !== 200) {
        return reject(new Error(res.statusMessage))
      }

      let tail = ''

      /** @type {LoadFileContext} */
      const context = {
        readIndex: -1,
        writeIndex: 0,
        isEnd: false
      }

      /** @type {(line: string, , isEnd: boolean) => void} */
      const writeFile = (line, isEnd) => {
        context.readIndex += 1
        context.isEnd = isEnd

        if (transform) {
          const transformed = transform(line, context)
          if (transformed != null) {
            writer.write(transformed + '\n');
            context.writeIndex += 1
            return
          } else if (transformed === null) {
            return
          }
        }

        writer.write(line + '\n');
      }

      for await (const chunk of res) {
        const lines = chunk.toString().split('\n')
        if (tail) {
          lines[0] = tail + lines[0]
          tail = ''
        }

        tail = lines.pop();
        for (let i = 0; i < lines.length; i++) {
          writeFile(lines[i], false)
        }
      }

      writeFile(tail, true)

      writer.end()
      resolve()
    })
  })
}

/**
 *
 * @see {https://www.unicode.org/reports/tr44/#GC_Values_Table} General Category
 * @param line
 * @return {null}
 */
function transformUnicodeData(line) {
  line = line.trim()
  if (!line) {
    return null
  }

  const [codeRaw, nameRaw, categoryRaw,,,,,,,, caseUpMapRaw] = line.split(';')
  const code = parseInt(codeRaw.trim(), 16)
  let name = nameRaw.trim()
  const category = categoryRaw.trim()
  const caseUpMap = caseUpMapRaw.trim()

  if (isNaN(code)) {
    return null
  }

  if (name === '<control>') {
    name = 'CONTROL'

    if (caseUpMap) {
      name += ' ' + caseUpMap
    }
  } else if (name.startsWith('<') && name.endsWith('>')) {
    name = name.replace('<', '').replace(', First>', '').replace(', Last>', '')
  } else if (caseUpMap && caseUpMap !== name) {
    const set = new Set(name.split(' '))

    for (const part of caseUpMap.split(' ')) {
      set.add( part.replace('-', ' ').trim())
    }

    name = Array.from(set).join(' ')
  }

  return `${toHex(code)};${category};${name}`
}

/**
 * Transform blocks file
 * @param line
 * @return {string|null}
 */
function transformBlocks(line) {
  line = line.replace(/#.*/, '').trim()
  if (!line) {
    return null
  }

  const [rangeRaw, blockNameRaw] = line.split(';')
  const [beginRaw, endRaw] = rangeRaw.split('..')

  const begin = parseInt(beginRaw.trim(), 16)
  const end = parseInt(endRaw.trim(), 16)
  const blockName = blockNameRaw.trim()

  if (!isNaN(begin) && !isNaN(end) && blockName) {
    const result = `${toHex(begin)}..${toHex(end)};${blockName}`;
    const plane = PLANE[begin]
    if (plane) {
      return `@@ ${plane}\n${result}`
    }

    return result
  }
  return null
}

/**
 * Transform emoji data file
 * @param {string} line
 * @return {string|null|undefined|Symbol}
 */
function transformEmoji(line) {
  if (line.startsWith('# group:')) {
    return line.replace('# group:', '@@').trim()
  }

  line = line.replace(/^#.*/, '').trim()
  if (!line) {
    return null
  }

  let [codesRaw, qualificationRaw, nameRaw] = line.split(/[;#]/);

  const qualification = QUALIFICATION[qualificationRaw.trim()]

  let name = (nameRaw || '').split(/E\d+\.\d\s/)?.[1] || '';
  name = name.replace(':', ' -');

  const codes = codesRaw.trim().split(' ').map(toInt);
  if (!codes.length) {
    return null
  }
  return `${codes.map(toHex).join(',')};${qualification};${name}`
}

async function start() {
  // Load symbols names
  await loadDataFile({
    src: UNICODE_DATA_URL,
    dist: UNICODE_FILE,
    transform: transformUnicodeData,
  })

  // Load blocks
  await loadDataFile({
    src: BLOCKS_URL,
    dist: BLOCKS_FILE,
    transform: transformBlocks,
  })

  // Load emoji file
  await loadDataFile({
    src: EMOJI_URL,
    dist: EMOJI_FILE,
    transform: transformEmoji,
  })

}

start().catch(console.error);
