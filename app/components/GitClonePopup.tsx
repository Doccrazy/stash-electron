import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label } from 'reactstrap';
import * as os from 'os';
import * as path from 'path';
import FileInput from './tools/FileInput';
import FocusingInput from './tools/FocusingInput';
import withTrans from '../utils/i18n/withTrans';

export interface Props {
  open?: boolean;
  working?: boolean;
  valid?: boolean;
  feedback?: string;
  url?: string;
  target?: string;
  onChangeUrl: (url: string) => void;
  onChangeTarget: (target: string) => void;
  onClone: () => void;
  onClose: () => void;
}

export default withTrans<Props>('component.gitClonePopup')(
  ({ t, open, working, valid, feedback, url, target, onChangeUrl, onChangeTarget, onClone, onClose }) => {
    return (
      <Modal
        isOpen={open}
        toggle={() => {
          if (!working) {
            onClose();
          }
        }}
        returnFocusAfterClose={false}
      >
        <ModalHeader
          toggle={() => {
            if (!working) {
              onClose();
            }
          }}
        >
          {t('.title')}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>{t('.field.remoteUrl')}</Label>
              <FocusingInput
                placeholder={t('.field.remoteUrl.placeholder')}
                focused
                valid={valid ? undefined : false}
                disabled={working}
                value={url || ''}
                onChange={(ev) => onChangeUrl(ev.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>{t('.field.targetFolder')}</Label>
              <FileInput
                folder
                dialogTitle={t('.field.targetFolder.dialogTitle')}
                placeholder={t('.field.targetFolder.placeholder', { example: path.join(os.homedir(), 'Workspace') })}
                valid={valid ? undefined : false}
                disabled={working}
                value={target || ''}
                onChange={(ev) => onChangeTarget(ev.target.value)}
              />
              <small className="form-text text-muted">{t('field.targetFolder.info')}</small>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <div className={working ? '' : 'text-danger'} style={{ flexGrow: 1 }}>
            {feedback}
          </div>
          <Button color="primary" onClick={onClone} disabled={!valid || working}>
            {working ? <i className="fa fa-spinner fa-pulse" /> : <i className="fa fa-long-arrow-down" />} {t('action.git.clone')}
          </Button>{' '}
          <Button color="secondary" onClick={onClose} disabled={working}>
            {t('action.common.close')}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
);
