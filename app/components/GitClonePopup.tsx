import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label } from 'reactstrap';
import * as os from 'os';
import * as path from 'path';
import FileInput from './tools/FileInput';
import FocusingInput from './tools/FocusingInput';

export interface Props {
  open?: boolean,
  working?: boolean,
  valid?: boolean,
  feedback?: string,
  url?: string,
  target?: string,
  onChangeUrl: (url: string) => void
  onChangeTarget: (target: string) => void
  onClone: () => void
  onClose: () => void
}

export default ({ open, working, valid, feedback, url, target, onChangeUrl, onChangeTarget, onClone, onClose }: Props) => {
  return (<Modal isOpen={open} toggle={() => { if (!working) { onClose(); } }}>
    <ModalHeader toggle={() => { if (!working) { onClose(); } }}>Clone remote git repository</ModalHeader>
    <ModalBody>
      <Form>
        <FormGroup>
          <Label>Remote repository URL</Label>
          <FocusingInput placeholder="ex. https://git.mycompany.com/passwords.git" focused valid={valid ? undefined : false} disabled={working}
                 value={url || ''} onChange={ev => onChangeUrl(ev.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label>Target folder</Label>
          <FileInput folder dialogTitle="Select target folder"
                     placeholder={`ex. ${path.join(os.homedir(), 'Workspace')}`} valid={valid ? undefined : false} disabled={working}
                     value={target || ''} onChange={ev => onChangeTarget(ev.target.value)}/>
          <small className="form-text text-muted">If target folder is not empty, a new subfolder will be created</small>
        </FormGroup>
      </Form>
    </ModalBody>
    <ModalFooter>
      <div className={working ? '' : 'text-danger'} style={{flexGrow: 1}}>{feedback}</div>
      <Button color="primary" onClick={onClone} disabled={!valid || working}>
        {working ? <i className="fa fa-spinner fa-pulse" /> : <i className="fa fa-long-arrow-down" />} Clone
      </Button>{' '}
      <Button color="secondary" onClick={onClose} disabled={working}>Close</Button>
    </ModalFooter>
  </Modal>);
};
