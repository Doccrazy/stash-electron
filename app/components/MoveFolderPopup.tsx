import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PathLabel from './PathLabel';

export interface Props {
  open?: boolean,
  sourcePath: string[],
  targetPath: string[],
  canMove?: boolean,
  canMerge?: boolean,
  onMove: () => void,
  onMerge: () => void,
  onClose?: () => void
}

export default ({ open, sourcePath, targetPath, canMove, canMerge, onMove, onMerge, onClose }: Props) => (
  <Modal isOpen={open} toggle={onClose}>
    <ModalHeader toggle={onClose}>Confirm {canMove || !canMerge ? 'moving' : 'merging'} folder</ModalHeader>
    <ModalBody>
      {canMove && <p>
        Are you sure you want to move folder <PathLabel path={sourcePath} /> to <PathLabel path={targetPath} />?<br/>
        This may change the folder's access rights. However, overridden permissions of subfolders will not be modified.
      </p>}
      {!canMove && <p className="text-warning">
        Move not possible: Folder or entry already exists (try merging into subfolder instead).
      </p>}
      {canMerge && <p>
        {canMove && <span>
          If you choose to <em>merge</em> the folders instead, the items of <PathLabel path={sourcePath} /> will
          be recursively integrated into <PathLabel path={targetPath} />, overwriting possible duplicates.
        </span>}
        {!canMove && <span>
          Are you sure you want to merge folder <PathLabel path={sourcePath} /> into <PathLabel path={targetPath} />?
        </span>}
        <br/>
        Merging requires full access to both folder trees.
      </p>}
      {!canMerge && <p className="text-warning">
        Merge not possible: Full access to both folder trees is required.
      </p>}
    </ModalBody>
    <ModalFooter>
      {canMerge && <Button autoFocus={!canMove} color="warning" onClick={onMerge}><i className="fa fa-code-fork" /> Merge</Button>}{' '}
      {canMove && <Button autoFocus color="primary" onClick={onMove}><i className="fa fa-arrow-left" /> Move</Button>}{' '}
      <Button autoFocus={!canMove && !canMerge} color="secondary" onClick={onClose}>Cancel</Button>
    </ModalFooter>
  </Modal>
);
