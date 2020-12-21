import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap';
import { EntryForm } from '../fileType/Components';
import withTrans from '../utils/i18n/withTrans';

export interface Props {
  open?: boolean;
  isNew?: boolean;
  typeId?: string;
  name?: string;
  parsedContent: any;
  formState: any;
  validationError?: string;
  authInfo?: string;
  onChangeName: (name: string) => void;
  onChange: (content: any) => void;
  onChangeState: (state: any) => void;
  onSave: () => void;
  onClose: () => void;
}

export default withTrans<Props>('component.editPopup')(
  ({
    t,
    open,
    isNew,
    typeId,
    name,
    parsedContent,
    formState,
    validationError,
    authInfo,
    onChangeName,
    onChange,
    onChangeState,
    onSave,
    onClose
  }) => {
    return (
      <Modal size="lg" isOpen={open} toggle={onClose} returnFocusAfterClose={false}>
        <ModalHeader toggle={onClose}>
          {isNew ? t('.create') : t('.edit')}
          {authInfo && <div style={{ fontWeight: 'normal', fontSize: 'medium' }}>{authInfo}</div>}
        </ModalHeader>
        <ModalBody>
          <Form id="editForm" onSubmit={onSave}>
            <EntryForm
              typeId={typeId}
              name={name || ''}
              onChangeName={onChangeName}
              value={parsedContent}
              onChange={onChange}
              formState={formState}
              onChangeState={onChangeState}
            />
          </Form>
        </ModalBody>
        <ModalFooter>
          <div className="text-danger" style={{ flexGrow: 1 }}>
            {validationError}
          </div>
          <Button type="submit" form="editForm" color="primary">
            {t('action.common.save')}
          </Button>{' '}
          <Button form="editForm" color="secondary" onClick={onClose}>
            {t('action.common.cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
);
