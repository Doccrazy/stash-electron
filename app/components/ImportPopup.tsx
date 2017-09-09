import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';

const STATUS_COLOR = {
  progress: '',
  success: 'text-success',
  error: 'text-danger'
};

export interface Settings {
  filePath?: string,
  masterKey: string,
  keyFile: string
}

export interface Props {
  open: boolean,
  settings: Settings,
  status: 'progress' | 'success' | 'error' | null | undefined,
  statusMessage: string | null,
  onChangeSettings: (settings: Settings) => void,
  onImport: () => void,
  onClose: () => void
}

export default ({ open, settings = { masterKey: '', keyFile: '' }, status, statusMessage, onChangeSettings, onImport, onClose }: Props) => (<Modal isOpen={open} toggle={onClose}>
  <ModalHeader toggle={onClose}>Import Keepass database</ModalHeader>
  <ModalBody>
    <Form>
      <FormGroup>
        <div className="form-text text-muted">All items will be imported into the current folder. Existing items will be overwritten.</div>
        <Label for="file">File</Label>
        <input type="file" id="file" className="form-control-file" accept=".kdbx" onChange={ev => ev.target.files && onChangeSettings({ ...settings, filePath: ev.target.files[0].path })} />
      </FormGroup>
      <FormGroup>
        <Label for="masterKey">Master key (if required)</Label>
        <Input type="password" id="masterKey" value={settings.masterKey} onChange={ev => onChangeSettings({ ...settings, masterKey: ev.target.value })} />
      </FormGroup>
      <FormGroup>
        <Label for="keyFile">Keyfile (if required)</Label>
        <Input type="password" id="keyFile" onChange={ev => ev.target.files && onChangeSettings({ ...settings, keyFile: ev.target.files[0].path })} />
      </FormGroup>
    </Form>
  </ModalBody>
  <ModalFooter>
    <div className={status ? STATUS_COLOR[status] : ''} style={{ flexGrow: 1 }}>{statusMessage}</div>
    {status !== 'success' && <Button color="primary" disabled={status === 'progress'} onClick={onImport}>Import</Button>}{' '}
    <Button color="secondary" disabled={status === 'progress'} onClick={onClose}>{status === 'success' ? 'Close' : 'Cancel'}</Button>
  </ModalFooter>
</Modal>);
