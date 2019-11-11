import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { valid } from '../actions/fileExport';
import {ExportSettings, StatusType} from '../actions/types/fileExport';
import withTrans from '../utils/i18n/withTrans';
import StrengthMeter from './shared/StrengthMeter';
import FocusingInput from './tools/FocusingInput';

const STATUS_COLOR = {
  progress: '',
  success: 'text-success',
  error: 'text-danger'
};

export interface Props {
  open: boolean,
  settings: ExportSettings,
  status?: StatusType,
  statusMessage?: string,
  onChangeSettings: (settings: ExportSettings) => void,
  onExport: () => void,
  onClose: () => void
}

export default withTrans<Props>('component.exportPopup')(
  ({ t, open, settings = { masterKey: '', repeatMasterKey: '' }, status, statusMessage, onChangeSettings, onExport, onClose }) => <Modal isOpen={open} toggle={onClose} returnFocusAfterClose={false}>
  <ModalHeader toggle={onClose}>{t('.title')}</ModalHeader>
  <ModalBody>
    <Form>
      <FormGroup>
        <p className="form-text text-muted">{t('.info')}</p>
        <Alert color="warning">{t('.backupWarning')}</Alert>
        <Label for="masterKey">{t('.masterKey')}</Label>
        <FocusingInput focused type="password" id="masterKey" invalid={!settings.masterKey}
               value={settings.masterKey || ''} onChange={ev => onChangeSettings({ ...settings, masterKey: ev.target.value })} />
        <StrengthMeter value={settings.masterKey || ''} />
      </FormGroup>
      <FormGroup>
        <Label for="masterKey">{t('.repeatMasterKey')}</Label>
        <Input type="password" id="masterKey" invalid={settings.masterKey !== settings.repeatMasterKey}
               value={settings.repeatMasterKey || ''} onChange={ev => onChangeSettings({ ...settings, repeatMasterKey: ev.target.value })} />
      </FormGroup>
    </Form>
  </ModalBody>
  <ModalFooter>
    <div className={status ? STATUS_COLOR[status] : ''} style={{ flexGrow: 1 }}>{statusMessage}</div>
    {status !== 'success' && <Button color="primary" disabled={status === 'progress' || !valid(settings)} onClick={onExport}>
      {t('action.common.export')}
    </Button>}{' '}
    <Button color="secondary" disabled={status === 'progress'} onClick={onClose}>
      {status === 'success' ? t('action.common.close') : t('action.common.cancel')}
    </Button>
  </ModalFooter>
</Modal>);
