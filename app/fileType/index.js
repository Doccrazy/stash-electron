import * as jsonParser from './parser/json';

const TYPES = [
  {
    id: 'password',
    test: fn => fn.endsWith('.pass.json'),
    ...jsonParser
  },
  {
    test: () => true
  }
];

export default function typeFor(entry) {
  return TYPES.find(type => type.test(entry));
}

export function mergeConfig(id, config) {
  const type = TYPES.find(t => t.id === id);
  Object.assign(type, config);
}
