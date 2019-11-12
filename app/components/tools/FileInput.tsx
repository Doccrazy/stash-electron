import { remote } from 'electron';
import * as React from 'react';
import { Button, Input, InputGroup, InputGroupAddon, InputProps } from 'reactstrap';
import OpenDialogOptions = Electron.OpenDialogOptions;

function browse(title: string, folder?: boolean, filters?: OpenDialogOptions['filters'],
                onChange?: React.ChangeEventHandler<HTMLInputElement>, onSelect?: FileInputProps['onSelect']) {
  const promise = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    title,
    filters,
    properties: folder ? ['openDirectory'] : ['openFile', 'showHiddenFiles']
  });

  promise.then(dialogResult => {
    const selectedFiles = dialogResult.filePaths;
    if (selectedFiles && selectedFiles[0] && onChange) {
      onChange({ target: { value: selectedFiles[0] }} as any);
      if (onSelect) {
        onSelect();
      }
    }
  });
}

export interface FileInputProps {
  dialogTitle: string,
  folder?: boolean,
  filters?: OpenDialogOptions['filters'],
  onSelect?: () => void
}

const FileInput = (props: InputProps & FileInputProps) => {
  const {dialogTitle, folder, filters, onSelect, ...inputProps} = props;
  return <InputGroup>
    <Input {...inputProps} />
    <InputGroupAddon addonType="append">
      <Button onClick={() => browse(dialogTitle, folder, filters, props.onChange, onSelect)}><i className={`fa fa-folder${folder ? '' : '-open'}`}/></Button>
    </InputGroupAddon>
  </InputGroup>;
};

export default FileInput;
