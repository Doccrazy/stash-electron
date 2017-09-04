/* eslint-disable no-param-reassign */
import React from 'react';

function acceptFiles(ev) {
  if ([...ev.dataTransfer.types].includes('Files')) {
    console.log('accept');
    ev.preventDefault();
    ev.dataTransfer.effectAllowed = 'copy';
    ev.dataTransfer.dropEffect = 'copy';
  }
}

function mapFiles(ev) {
  return [...ev.dataTransfer.files].map(file => file.path);
}

export default ({ children, onDrop, ...props }) => (<div {...props} onDragEnter={acceptFiles} onDragOver={acceptFiles} onDrop={ev => onDrop(mapFiles(ev))}>
  {children}
</div>);
