import { diacriticsMap } from 'diacritics';

const REPLACE_MAP: { [ch: string]: string } = {
  _: '-',
  '~': '-',
  '=': '-',
  '`': '"',
  '´': '"',
  "'": '"',
  ',': '.',
  ';': ':',
  '{': '(',
  '[': '(',
  '<': '(',
  '}': ')',
  ']': ')',
  '>': ')',
  '|': '!',
  '\\': '/'
};
const REPLACE_EXP = new RegExp(
  `[\u007f-\uffff${Object.keys(REPLACE_MAP)
    .join('')
    .replace(/[[\]|\\]/g, '\\$&')}]`,
  'g'
);
const REPL_DIA_MAP = {
  ...diacriticsMap,
  ...REPLACE_MAP
};

function replacer(c: string): string {
  return REPL_DIA_MAP[c] || c;
}

function normalize(input: string): string {
  return input.replace(REPLACE_EXP, replacer);
}

export interface StringMatcher {
  matches(other: string): boolean;
}

function escapeHtml(unsafe: string) {
  return unsafe.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightSubstring(original: string, processed: string, subStr: string): { matches: boolean; highlight?: string } {
  if (original.length !== processed.length) {
    return { matches: processed.includes(subStr) };
  }

  const matches = [];
  let index = processed.indexOf(subStr);
  if (index < 0) {
    return { matches: false };
  }
  while (index !== -1) {
    matches.push(index);
    index = processed.indexOf(subStr, index + 1);
  }
  let highlightedStr = '';
  let lastIndex = 0;
  for (const match of matches) {
    highlightedStr += escapeHtml(original.slice(lastIndex, match));
    highlightedStr += `<em>${escapeHtml(original.slice(match, match + subStr.length))}</em>`;
    lastIndex = match + subStr.length;
  }
  highlightedStr += escapeHtml(original.slice(lastIndex));
  return { matches: true, highlight: highlightedStr };
}

export class FuzzyStringMatcher implements StringMatcher {
  private readonly filter: string;

  constructor(filter: string) {
    this.filter = FuzzyStringMatcher.prepare(filter);
  }

  static prepare(other: string): string {
    return normalize(other.toLowerCase());
  }

  matches(other: string): boolean {
    return FuzzyStringMatcher.prepare(other).includes(this.filter);
  }

  matchAndHighlight(other: string): { matches: boolean; highlight?: string } {
    return highlightSubstring(other, FuzzyStringMatcher.prepare(other), this.filter);
  }

  matchesPrepared(preparedOther: string): boolean {
    return preparedOther.includes(this.filter);
  }
}
