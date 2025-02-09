import { sanitizeUrl } from '../../utils/format';
import { Type, WellKnownField } from '../index';
import * as jsonParser from '../parser/json';

export interface PasswordContent {
  username?: string;
  password?: string;
  url?: string;
  description?: string;
}

const EXTENSION = '.pass.json';

const PasswordType: Required<Type<PasswordContent>> = {
  id: 'password',
  test: (fn) => (fn.endsWith(EXTENSION) ? 1 : null),
  toDisplayName: (fn) => fn.substr(0, fn.length - EXTENSION.length),
  toFileName: (name) => `${name}${EXTENSION}`,
  initialize: () => ({}),
  matches: (content, matcher) =>
    (!!content.username && matcher.matches(content.username)) || (!!content.description && matcher.matches(content.description)),
  isValidKdbxEntry: (fields) => !!fields.Notes || !!fields.UserName || !!fields.Password || !!fields.URL,
  fromKdbxEntry: (fields) => ({
    description: fields.Notes,
    username: fields.UserName,
    password: fields.Password,
    url: fields.URL
  }),
  toKdbxEntry: (content) => ({
    Notes: content.description,
    UserName: content.username,
    Password: content.password,
    URL: content.url
  }),
  readField: (content, field) => {
    switch (field) {
      case WellKnownField.USERNAME:
        return content.username;
      case WellKnownField.PASSWORD:
        return content.password;
      case WellKnownField.URL:
        return content.url;
    }
  },
  toPlainText: (name, content) => {
    let text = `${name}\n\n`;
    if (content.username) {
      text += `Username: ${content.username}\n`;
    }
    if (content.password) {
      text += `Password: ${content.password}\n`;
    }
    if (content.url) {
      text += `URL: ${sanitizeUrl(content.url)}\n`;
    }
    if (content.description) {
      text += `\n${content.description}\n`;
    }

    return text;
  },
  ...jsonParser
};

export default PasswordType;
