import * as React from 'react';
import PasswordType from './index';

export interface Props {
  fileName: string
}

export default ({ fileName }: Props) => <span>
  <i className="fa fa-key" /> {PasswordType.toDisplayName(fileName)}
</span>;
