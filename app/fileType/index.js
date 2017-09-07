import * as jsonParser from './parser/json';

const TYPES = [
  {
    id: 'password',
    test: fn => fn.endsWith('.pass.json'),
    toDisplayName: fn => fn.substr(0, fn.length - 10),
    toFileName: name => `${name}.pass.json`,
    initialize: () => ({}),
    matches: (content, filterLC) => (content.username && content.username.toLowerCase().includes(filterLC))
      || (content.description && content.description.toLowerCase().includes(filterLC)),
    fromKdbxEntry: entry => ({
      description: entry.fields.Notes,
      username: entry.fields.UserName,
      password: entry.fields.Password ? entry.fields.Password.getText() : undefined,
      url: entry.fields.URL
    }),
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
