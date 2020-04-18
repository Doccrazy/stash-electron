import * as React from 'react';
import PasswordType from './index';

export interface Props {
  fileName: string;
}

const PasswordNameLabel = ({ fileName }: Props) => (
  <span>
    <i className="fa fa-key" /> {PasswordType.toDisplayName(fileName)}
  </span>
);

export default PasswordNameLabel;
