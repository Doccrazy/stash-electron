import getClassNameForExtension from 'font-awesome-filetypes';
import * as React from 'react';
import { NameProps } from '..';

const DefaultNameLabel = ({ fileName, highlightHtml }: NameProps) => (
  <span>
    <i className={`fa ${getClassNameForExtension(fileName.split('.').pop() || '')}`} />{' '}
    {highlightHtml ? <span dangerouslySetInnerHTML={{ __html: highlightHtml }} /> : fileName}
  </span>
);

export default DefaultNameLabel;
