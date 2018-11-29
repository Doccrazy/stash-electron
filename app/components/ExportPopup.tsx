import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { valid } from '../actions/fileExport';
import {ExportSettings, StatusType} from '../actions/types/fileExport';
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

export default ({ open, settings = { masterKey: '', repeatMasterKey: '' }, status, statusMessage, onChangeSettings, onExport, onClose }: Props) => (<Modal isOpen={open} toggle={onClose}>
  <ModalHeader toggle={onClose}>Export to KeePass database</ModalHeader>
  <ModalBody>
    <Form>
      <FormGroup>
        <p className="form-text text-muted">All accessible items in the current folder will be exported into a new KeePass database.</p>
        <Alert color="warning">
          Users and permissions will not be exported. This is not a replacement for a repository backup.
        </Alert>
        <Label for="masterKey">Database master key</Label>
        <FocusingInput focused type="password" id="masterKey" invalid={!settings.masterKey}
               value={settings.masterKey || ''} onChange={ev => onChangeSettings({ ...settings, masterKey: ev.target.value })} />
        <StrengthMeter value={settings.masterKey || ''} />
      </FormGroup>
      <FormGroup>
        <Label for="masterKey">Master key (repeat)</Label>
        <Input type="password" id="masterKey" invalid={settings.masterKey !== settings.repeatMasterKey}
               value={settings.repeatMasterKey || ''} onChange={ev => onChangeSettings({ ...settings, repeatMasterKey: ev.target.value })} />
      </FormGroup>
    </Form>
  </ModalBody>
  <ModalFooter>
    <div className={status ? STATUS_COLOR[status] : ''} style={{ flexGrow: 1 }}>{statusMessage}</div>
    {status !== 'success' && <Button color="primary" disabled={status === 'progress' || !valid(settings)} onClick={onExport}>Export</Button>}{' '}
    <Button color="secondary" disabled={status === 'progress'} onClick={onClose}>{status === 'success' ? 'Close' : 'Cancel'}</Button>
  </ModalFooter>
</Modal>);
