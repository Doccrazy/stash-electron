import getClassNameForExtension from 'font-awesome-filetypes';
import * as React from 'react';

export interface Props {
  fileName: string
}

export default ({ fileName }: Props) => <span>
  <i className={`fa ${getClassNameForExtension(fileName.split('.').pop() || '')}`} /> {fileName}
</span>;
