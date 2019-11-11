import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PathLabel from './PathLabel';
import withTrans from '../utils/i18n/withTrans';
import Trans from '../utils/i18n/Trans';

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

export default withTrans<Props>('component.moveFolderPopup')(({ t, open, sourcePath, targetPath, canMove, canMerge, onMove, onMerge, onClose }) => (
  <Modal isOpen={open} toggle={onClose} returnFocusAfterClose={false}>
    <ModalHeader toggle={onClose}>{t(`.title.${canMove || !canMerge ? 'move' : 'merge'}`)}</ModalHeader>
    <ModalBody>
      {canMove && <div className="mb-3">
        <Trans id=".confirm.move" markdown source={<PathLabel path={sourcePath} />} target={<PathLabel path={targetPath} />}/>
      </div>}
      {!canMove && <p className="text-warning">
        {t('.warning.cannotMove')}
      </p>}
      {canMerge && <p>
        {canMove && <span>
          <Trans id=".info.merge" markdown source={<PathLabel path={sourcePath} />} target={<PathLabel path={targetPath} />}/>
        </span>}
        {!canMove && <span>
          <Trans id=".confirm.merge" markdown source={<PathLabel path={sourcePath} />} target={<PathLabel path={targetPath} />}/>
        </span>}
        <br/>
        {t('.info.mergePermissions')}
      </p>}
      {!canMerge && <p className="text-warning">
        {t('.warning.cannotMerge')}
      </p>}
    </ModalBody>
    <ModalFooter>
      {canMerge && <Button autoFocus={!canMove} color="warning" onClick={onMerge}><i className="fa fa-code-fork" /> {t('.action.merge')}</Button>}{' '}
      {canMove && <Button autoFocus color="primary" onClick={onMove}><i className="fa fa-arrow-left" /> {t('.action.move')}</Button>}{' '}
      <Button autoFocus={!canMove && !canMerge} color="secondary" onClick={onClose}>{t('action.common.cancel')}</Button>
    </ModalFooter>
  </Modal>
));
