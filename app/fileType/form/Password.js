// @flow
import React from 'react';
import { Button, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import PwGenerateMenu from './PwGenerateMenu';

type Content = { username?: string, password?: string, url?: string, description?: string };
type FormState = { mask: boolean, repeatPassword?: string };
type Props = {
  name: string,
  onChangeName: string => void,
  value: Content,
  onChange: (Content) => void,
  formState: FormState,
  onChangeState: (FormState) => void
};

export default class PasswordForm extends React.Component<void, Props, void> {
  static initFormState: Content => FormState;
  static validate: (Content, FormState) => string | boolean;
  nameInput: ?HTMLInputElement;
  passwordInput: ?HTMLInputElement;

  componentDidMount() {
    setTimeout(() => {
      if (this.nameInput) {
        this.nameInput.focus();
      }
    });
  }

  componentDidUpdate(prevProps: Props) {
    const maskedInput = this.passwordInput;
    if (this.props.formState.mask !== prevProps.formState.mask && maskedInput) {
      maskedInput.focus();
      maskedInput.select();
    }
  }

  changeRepeatPassword = (ev: SyntheticInputEvent) => {
    this.props.onChangeState({ ...this.props.formState, repeatPassword: ev.target.value });
  };

  setPassword = (password: string) => {
    this.props.onChange({ ...this.props.value, password });
    if (this.props.formState.mask) {
      this.props.onChangeState({ ...this.props.formState, repeatPassword: password });
    }
  };

  toggleMask = () => {
    const newState = { ...this.props.formState, mask: !this.props.formState.mask };
    if (newState.mask) {
      newState.repeatPassword = this.props.value.password;
    }
    this.props.onChangeState(newState);
  };

  render() {
    const { name, onChangeName, value, onChange } = this.props;
    return (
      <div>
        <FormGroup row>
          <Label sm={2} for="name">Title</Label>
          <Col sm={10}>
            <Input
              getRef={c => { this.nameInput = c; }}
              id="name"
              placeholder="Title"
              value={name.substr(0, name.length - 10)}
              onChange={ev => onChangeName(`${ev.target.value}.pass.json`)}
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={2} for="username">Username</Label>
          <Col sm={10}>
            <Input
              id="username"
              placeholder="Username"
              value={value.username}
              onChange={ev => onChange({ ...value, username: ev.target.value })}
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={2} for="password">Password</Label>
          <Col sm={10}>
            <Row>
              <Col><Input
                getRef={c => { this.passwordInput = c; }}
                type={this.props.formState.mask ? 'password' : 'text'}
                id="password"
                placeholder="Password"
                value={value.password}
                onChange={ev => onChange({ ...value, password: ev.target.value })}
              /></Col>
              <Col xs="auto"><Button title="Toggle password masking" active={this.props.formState.mask} onClick={this.toggleMask}><i className="fa fa-ellipsis-h" /></Button></Col>
            </Row>
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={2} for="repeatPassword">Repeat</Label>
          <Col sm={10}>
            <Row>
              <Col><Input
                type="password"
                id="repeatPassword"
                placeholder={this.props.formState.mask ? 'Repeat password' : ''}
                disabled={!this.props.formState.mask}
                value={this.props.formState.mask ? this.props.formState.repeatPassword : ''}
                onChange={this.changeRepeatPassword}
              /></Col>
              <Col xs="auto"><PwGenerateMenu onGenerate={this.setPassword} /></Col>
            </Row>
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={2} for="url">URL</Label>
          <Col sm={10}>
            <Input id="url" placeholder="URL" value={value.url} onChange={ev => onChange({ ...value, url: ev.target.value })} />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={2} for="description">Description</Label>
          <Col sm={10}>
            <Input
              type="textarea"
              id="description"
              placeholder="Description"
              style={{ height: 150 }}
              value={value.description}
              onChange={ev => onChange({ ...value, description: ev.target.value })}
            />
          </Col>
        </FormGroup>
      </div>
    );
  }
}

PasswordForm.initFormState = content => ({ mask: true, repeatPassword: content ? content.password : '' });

PasswordForm.validate = (name, content, formState) => {
  if (name === '.pass.json') {
    return 'Please enter a title.';
  }
  if (!content.username && !content.password) {
    return 'Please provide either a username or a password.';
  }
  if (formState.mask && content.password !== formState.repeatPassword) {
    return 'Password and repeated value do not match.';
  }
  return false;
};
