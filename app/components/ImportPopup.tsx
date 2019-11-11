import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, CustomInput } from 'reactstrap';
import {ImportSettings, StatusType} from '../actions/types/fileImport';
import withTrans from '../utils/i18n/withTrans';

const STATUS_COLOR = {
  progress: '',
  success: 'text-success',
  error: 'text-danger'
};

export interface Props {
  open: boolean,
  settings: ImportSettings,
  status?: StatusType,
  statusMessage?: string,
  onChangeSettings: (settings: ImportSettings) => void,
  onImport: () => void,
  onClose: () => void
}

export default withTrans<Props>('component.importPopup')(
  ({ t, open, settings = { masterKey: '', keyFile: '' }, status, statusMessage, onChangeSettings, onImport, onClose }) => <Modal isOpen={open} toggle={onClose}>
  <ModalHeader toggle={onClose}>{t('.title')}</ModalHeader>
  <ModalBody>
    <Form>
      <FormGroup>
        <div className="form-text text-muted">{t('.info')}</div>
        <Label for="file">{t('.field.file')}</Label>
        <CustomInput type="file" id="file" accept=".kdbx" label={settings.filePath}
                     onChange={ev => ev.target.files && onChangeSettings({ ...settings, filePath: ev.target.files[0].path })} />
      </FormGroup>
      <FormGroup>
        <Label for="masterKey">{t('.field.masterKey')}</Label>
        <Input type="password" id="masterKey" value={settings.masterKey || ''} onChange={ev => onChangeSettings({ ...settings, masterKey: ev.target.value })} />
      </FormGroup>
      <FormGroup>
        <Label for="keyFile">{t('.field.keyFile')}</Label>
        <CustomInput type="file" id="keyFile" label={settings.keyFile}
                     onChange={ev => ev.target.files && onChangeSettings({ ...settings, keyFile: ev.target.files[0].path })} />
      </FormGroup>
    </Form>
  </ModalBody>
  <ModalFooter>
    <div className={status ? STATUS_COLOR[status] : ''} style={{ flexGrow: 1 }}>{statusMessage}</div>
    {status !== 'success' && <Button color="primary" disabled={status === 'progress'} onClick={onImport}>{t('.action.import')}</Button>}{' '}
    <Button color="secondary" disabled={status === 'progress'} onClick={onClose}>
      {t(status === 'success' ? 'action.common.close' : 'action.common.cancel')}
    </Button>
  </ModalFooter>
</Modal>
);
