import React from 'react';
import getClassNameForExtension from 'font-awesome-filetypes';
import PasswordPanel from './panel/Password';
import DefaultPanel from './panel/Default';
import passwordParser from './parser/password';

const TYPES = [
  {
    test: fn => fn.endsWith('.pass.json'),
    panel: PasswordPanel,
    format: entry => <span><i className="fa fa-key" /> {entry.substr(0, entry.length - 10)}</span>,
    parser: passwordParser
  },
  {
    test: () => true,
    panel: DefaultPanel,
    format: entry => <span><i className={`fa ${getClassNameForExtension(entry.split('.').pop())}`} /> {entry}</span>
  }
];

export default function typeFor(entry) {
  return TYPES.find(type => type.test(entry));
}
