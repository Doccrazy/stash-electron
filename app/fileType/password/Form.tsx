import * as React from 'react';
import { Button, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import PasswordType, { PasswordContent } from './index';
import PwGenerateMenu from './PwGenerateMenu';
import { FormProps } from '../index';
import StrengthMeter from '../../components/shared/StrengthMeter';

type FormState = { mask: boolean, repeatPassword?: string };

export default class PasswordForm extends React.Component<FormProps<PasswordContent, FormState>, {}> {
  static initFormState: (content: PasswordContent) => FormState;
  static validate: (name: string, content: PasswordContent, formState: FormState) => string | boolean;
  readonly nameInput = React.createRef<HTMLInputElement>();
  readonly passwordInput = React.createRef<HTMLInputElement>();

  componentWillMount() {
    this.changeRepeatPassword = this.changeRepeatPassword.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.toggleMask = this.toggleMask.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.nameInput.current) {
        this.nameInput.current.focus();
      }
    });
  }

  componentDidUpdate(prevProps: FormProps<PasswordContent, FormState>) {
    const maskedInput = this.passwordInput.current;
    if (this.props.formState.mask !== prevProps.formState.mask && maskedInput) {
      maskedInput.focus();
      maskedInput.select();
    }
  }

  changeRepeatPassword(ev: React.ChangeEvent<HTMLInputElement>) {
    this.props.onChangeState({ ...this.props.formState, repeatPassword: ev.target.value });
  }

  setPassword(password: string) {
    this.props.onChange({ ...this.props.value, password });
    if (this.props.formState.mask) {
      this.props.onChangeState({ ...this.props.formState, repeatPassword: password });
    }
  }

  toggleMask() {
    const newState = { ...this.props.formState, mask: !this.props.formState.mask };
    if (newState.mask) {
      newState.repeatPassword = this.props.value.password;
    }
    this.props.onChangeState(newState);
  }

  render() {
    const { name, onChangeName, value, onChange } = this.props;
    return (
      <div>
        <FormGroup row>
          <Label sm={2} for="name">Title</Label>
          <Col sm={10}>
            <Input
              innerRef={this.nameInput}
              id="name"
              placeholder="Title"
              value={PasswordType.toDisplayName(name)}
              onChange={ev => onChangeName(PasswordType.toFileName(ev.target.value))}
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={2} for="username">Username</Label>
          <Col sm={10}>
            <Input
              id="username"
              placeholder="Username"
              value={value.username || ''}
              onChange={ev => onChange({ ...value, username: ev.target.value })}
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={2} for="password">Password</Label>
          <Col sm={10}>
            <Row>
              <Col>
                <Input
                  innerRef={this.passwordInput}
                  type={this.props.formState.mask ? 'password' : 'text'}
                  id="password"
                  placeholder="Password"
                  value={value.password || ''}
                  onChange={ev => onChange({ ...value, password: ev.target.value })}
                />
                <StrengthMeter value={value.password} />
              </Col>
              <Col xs="auto"><Button outline title="Toggle password masking" tabIndex={-1} active={this.props.formState.mask} onClick={this.toggleMask}><i className="fa fa-ellipsis-h" /></Button></Col>
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
                className={this.props.formState.mask && (this.props.formState.repeatPassword || '') !== (value.password || '') ? 'is-invalid' : undefined}
                placeholder={this.props.formState.mask ? 'Repeat password' : ''}
                disabled={!this.props.formState.mask}
                value={this.props.formState.mask ? this.props.formState.repeatPassword || '' : ''}
                onChange={this.changeRepeatPassword}
              /></Col>
              <Col xs="auto"><PwGenerateMenu onGenerate={this.setPassword} /></Col>
            </Row>
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label sm={2} for="url">URL</Label>
          <Col sm={10}>
            <Input id="url" placeholder="URL" value={value.url || ''} onChange={ev => onChange({ ...value, url: ev.target.value })} />
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
              value={value.description || ''}
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
  if (name === PasswordType.toFileName('')) {
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
