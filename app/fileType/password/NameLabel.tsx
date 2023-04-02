import * as React from 'react';
import { NameProps } from '..';
import PasswordType from './index';

const PasswordNameLabel = ({ fileName, highlightHtml }: NameProps) => (
  <span>
    <i className="fa fa-key" />{' '}
    {highlightHtml ? <span dangerouslySetInnerHTML={{ __html: highlightHtml }} /> : PasswordType.toDisplayName(fileName)}
  </span>
);

export default PasswordNameLabel;
