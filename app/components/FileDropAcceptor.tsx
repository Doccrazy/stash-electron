/* eslint-disable no-param-reassign */
import * as React from 'react';

function acceptFiles(ev: React.DragEvent<HTMLElement>) {
  if ([...ev.dataTransfer.types].includes('Files')) {
    console.log('accept');
    ev.preventDefault();
    ev.dataTransfer.effectAllowed = 'copy';
    ev.dataTransfer.dropEffect = 'copy';
  }
}

function mapFiles(ev: React.DragEvent<HTMLElement>) {
  return [...(ev.dataTransfer.files) as any].map((file: File) => file.path);
}

export interface Props {
  children: any,
  onDrop: (files: string[]) => void,
  [propName: string]: any;
}

export default ({ children, onDrop, ...props }: Props) => (<div {...props} onDragEnter={acceptFiles} onDragOver={acceptFiles} onDrop={ev => onDrop(mapFiles(ev))}>
  {children}
</div>);
