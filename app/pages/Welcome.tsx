import * as React from 'react';
import { Button, Form, FormGroup, Label, Input, InputGroup, InputGroupButton } from 'reactstrap';
import { Link } from 'react-router-dom';
import SettingsBrowseDirButton from '../containers/SettingsBrowseDirButton';
import SettingField from '../containers/SettingField';
import * as styles from './Welcome.scss';
import PrivateKeyStatus from '../containers/PrivateKeyStatus';
import GitInitializer from '../containers/welcome/GitInitializer';
import SettingsBrowseFileButton from '../containers/SettingsBrowseFileButton';
import ActionButton from '../containers/ActionButton';
import { openGenerate } from '../actions/privateKey';

export default () => (<div className={`${styles.body} h-100 d-flex`}>
  <div className="container h-100 d-flex flex-column">
    <div style={{ flexGrow: 1 }}>
      <h1 className="text-center mt-4">Welcome to Stash</h1>
      <div className="text-center mb-5">
        <small className="text-muted">The friendly secret storage made for teams</small>
      </div>
      <p className="mb-4">
        Before you can begin storing your passwords and other secrets securely and sharing them with your team,
        Stash needs some information to get you set up.
      </p>
      <Form>
        <div className="row">
          <div className="col-md-6">
            <h2 className="text-center mb-3"><i className="fa fa-warning text-warning" /> Repository location</h2>
            <p>
              The <b>Stash repository</b> is a simple file system folder where all your secrets will be
              stored in strongly encrypted files that only authorized team members can decrypt.
            </p>
            <FormGroup>
              <Label>Where do you want your repository to be stored?</Label>
              <InputGroup>
                <SettingField field="repositoryPath" instantSave />
                <InputGroupButton>
                  <SettingsBrowseDirButton field="repositoryPath" title="Select repository path"><i className="fa fa-folder" /></SettingsBrowseDirButton>
                </InputGroupButton>
              </InputGroup>
            </FormGroup>
            <GitInitializer />
          </div>
          <div className="col-md-6">
            <h2 className="text-center mb-3"><i className="fa fa-warning text-warning" /> Private encryption key</h2>
            <p>
              The <b>private key</b> is your personal asymmetric encryption key that protects access to your secrets.<br/>
              You may either reuse an existing private key (e.g. SSH, Putty, Github), or generate a new keypair.
            </p>
            <p>
              For added security, you should always <b>protect your key</b> with a passphrase, and <b>never share</b> the private
              part with anyone.
            </p>
            <FormGroup className="d-flex justify-content-between">
              <SettingsBrowseFileButton field="privateKeyFile" title="Browse for private key file" instantSave>
                <i className="fa fa-folder-open" /> Load existing key
              </SettingsBrowseFileButton>
              <ActionButton action={openGenerate}><i className="fa fa-cog" /> Generate new keypair</ActionButton>
            </FormGroup>
            <FormGroup>
              <Label>Selected private key file</Label>
              <SettingField field="privateKeyFile" readOnly />
              <small className="form-text"><PrivateKeyStatus /></small>
            </FormGroup>
            <FormGroup>
              <Label check>
                <Input type="checkbox" /> Add me to the repository's known users, so others may grant me access
              </Label>
            </FormGroup>
          </div>
        </div>
      </Form>
    </div>
    <div className="d-flex justify-content-between pb-4">
      <Link to="/" className="btn btn-light">Skip</Link>
      <Button color="success" >Start using Stash</Button>
    </div>
  </div>
</div>);
