import * as  React from 'react';
import { Form, FormGroup, InputGroup, InputGroupButton, Label } from 'reactstrap';
import SettingField from '../containers/SettingField';
import SaveSettingsButton from '../containers/SaveSettingsButton';
import SettingsBrowseDirButton from '../containers/SettingsBrowseDirButton';
import SettingsBrowseFileButton from '../containers/SettingsBrowseFileButton';
import PrivateKeyStatus from '../containers/PrivateKeyStatus';

export default () => (<div className="container">
  <h1 className="my-4">Application settings</h1>

  <Form>
    <FormGroup>
      <Label>Repository path</Label>
      <InputGroup>
        <SettingField field="repositoryPath" />
        <InputGroupButton>
          <SettingsBrowseDirButton field="repositoryPath" title="Select repository path"><i className="fa fa-folder" /></SettingsBrowseDirButton>
        </InputGroupButton>
      </InputGroup>
    </FormGroup>
    <FormGroup>
      <Label>Private key file (SSH / PEM / PPK)</Label>
      <InputGroup>
        <SettingField field="privateKeyFile" />
        <InputGroupButton>
          <SettingsBrowseFileButton field="privateKeyFile" title="Select private key"><i className="fa fa-folder-open" /></SettingsBrowseFileButton>
        </InputGroupButton>
      </InputGroup>
      <div className="form-text"><PrivateKeyStatus /></div>
    </FormGroup>
    <FormGroup>
      <Label>UI scale / root font size</Label>
      <SettingField field="rootFontSize" />
    </FormGroup>
    <FormGroup className="text-right">
      <SaveSettingsButton color="success">Save</SaveSettingsButton>
    </FormGroup>
  </Form>
</div>);
