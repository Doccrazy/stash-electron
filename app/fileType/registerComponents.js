import React from 'react';
import getClassNameForExtension from 'font-awesome-filetypes';
import { mergeConfig } from './index';
import PasswordPanel from './panel/Password';
import PasswordForm from './form/Password';
import DefaultPanel from './panel/Default';
import DefaultForm from './form/Default';

/**
 * React component registration for file types is kept separate to prevent tight coupling between
 * store and presentation layer, and to enable hot reloading (via import in Root.js)
 */

mergeConfig('password', {
  format: entry => <span><i className="fa fa-key" /> {entry.substr(0, entry.length - 10)}</span>,
  panel: PasswordPanel,
  form: PasswordForm
});

mergeConfig(undefined, {
  format: entry => <span><i className={`fa ${getClassNameForExtension(entry.split('.').pop())}`} /> {entry}</span>,
  panel: DefaultPanel,
  form: DefaultForm
});
