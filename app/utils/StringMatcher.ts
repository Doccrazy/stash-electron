import { diacriticsMap } from 'diacritics';

const REPLACE_MAP: { [ch: string]: string } = {
  '_': '-',
  '~': '-',
  '=': '-',
  '`': '"',
  '´': '"',
  '\'': '"',
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
const REPLACE_EXP = new RegExp(`[\u007f-\uffff${Object.keys(REPLACE_MAP).join('').replace(/[\[\]|\\]/g, '\\$&')}]`, 'g');
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
  matches(other: string): boolean
}

export class FuzzyStringMatcher implements StringMatcher {
  private readonly filter: string;

  constructor(filter: string) {
    this.filter = normalize(filter.toLowerCase());
  }

  matches(other: string): boolean {
    return normalize(other.toLowerCase()).includes(this.filter);
  }
}
