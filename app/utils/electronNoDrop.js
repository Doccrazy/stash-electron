/* eslint-disable no-param-reassign */
/**
 * disable Electron default drag&drop behavior by listening to drop events on the root document
 */

function noDrop(event) {
  event.dataTransfer.effectAllowed = 'none';
  event.dataTransfer.dropEffect = 'none';
  event.preventDefault();
}

document.addEventListener('dragenter', noDrop);
document.addEventListener('dragover', noDrop);
document.addEventListener('drop', event => event.preventDefault());
