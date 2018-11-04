import { Type } from '../index';
import * as jsonParser from '../parser/json';

export interface PasswordContent {
  username?: string
  password?: string
  url?: string
  description?: string
}

const EXTENSION = '.pass.json';

const PasswordType: Required<Type<PasswordContent>> = {
  id: 'password',
  test: fn => fn.endsWith(EXTENSION) ? 1 : null,
  toDisplayName: fn => fn.substr(0, fn.length - EXTENSION.length),
  toFileName: name => `${name}${EXTENSION}`,
  initialize: () => ({}),
  matches: (content, matcher) => (!!content.username && matcher.matches(content.username))
    || (!!content.description && matcher.matches(content.description)),
  fromKdbxEntry: fields => ({
    description: fields.Notes,
    username: fields.UserName,
    password: fields.Password,
    url: fields.URL
  }),
  toKdbxEntry: content => ({
    Notes: content.description,
    UserName: content.username,
    Password: content.password,
    URL: content.url
  }),
  ...jsonParser
};

export default PasswordType;
