/**
 * disable Electron default drag&drop behavior by listening to drop events on the root document
 */

function preventDrop(event: DragEvent) {
  event.dataTransfer!.effectAllowed = 'none';
  event.dataTransfer!.dropEffect = 'none';
  event.preventDefault();
}

document.addEventListener('dragenter', preventDrop);
document.addEventListener('dragover', preventDrop);
document.addEventListener('drop', (event) => event.preventDefault());
