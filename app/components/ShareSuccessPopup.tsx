import * as React from 'react';
import QRCode from 'react-qr-code';
import { Button, Input, InputGroup, InputGroupAddon, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { EntryNameLabel } from '../fileType/Components';
import Trans from '../utils/i18n/Trans';
import withTrans from '../utils/i18n/withTrans';

interface Props {
  open: boolean;
  entry?: string;
  pasteUrl: string;
  onCopy: () => void;
  onClose: () => void;
}

export default withTrans<Props>('component.shareSuccessPopup')(({ t, open, entry, pasteUrl, onCopy, onClose }) => (
  <Modal isOpen={open} toggle={onClose}>
    <ModalHeader toggle={onClose}>{t('.title')}</ModalHeader>
    <ModalBody>
      <div className="mb-3">
        <Trans id=".info" entry={<EntryNameLabel fileName={entry} />} />
      </div>
      <div className="mb-3 text-center">
        <QRCode value={pasteUrl} size={200} />
      </div>
      <InputGroup>
        <Input type="text" value={pasteUrl} readOnly />
        <InputGroupAddon addonType="append">
          <Button type="button" color="primary" title={t('.action.copy')} onClick={onCopy}>
            <i className="fa fa-copy" />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </ModalBody>
    <ModalFooter>
      <Button color="secondary" onClick={onClose}>
        {t('action.common.close')}
      </Button>
    </ModalFooter>
  </Modal>
));
