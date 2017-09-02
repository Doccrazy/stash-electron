import * as jsonParser from './parser/json';

const TYPES = [
  {
    id: 'password',
    test: fn => fn.endsWith('.pass.json'),
    initialize: () => ({}),
    ...jsonParser
  },
  {
    test: () => true
  }
];

export default function typeFor(entry) {
  return TYPES.find(type => type.test(entry));
}

export function typeById(id) {
  return TYPES.find(type => type.id === id);
}

export function mergeConfig(id, config) {
  const type = typeById(id);
  Object.assign(type, config);
}
