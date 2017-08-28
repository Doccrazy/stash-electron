import React from 'react';
import { Button, Form, FormGroup, Label, Input, InputGroup, InputGroupButton, Row, Col } from 'reactstrap';

export default class PasswordForm extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (this.props.formState.mask !== nextProps.formState.mask && this.passwordInput) {
      this.passwordInput.focus();
      this.passwordInput.select();
    }
  }

  changeRepeatPassword = ev => {
    this.props.onChangeState({ ...this.props.formState, repeatPassword: ev.target.value });
  };

  toggleMask = () => {
    const newState = { ...this.props.formState, mask: !this.props.formState.mask };
    if (newState.mask) {
      newState.repeatPassword = this.props.value.password;
    }
    this.props.onChangeState(newState);
  };

  render() {
    const { value, onChange } = this.props;
    return (
      <Form>
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
              <Col xs="auto"><Button title="Generate password"><i className="fa fa-cog" /></Button></Col>
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
      </Form>
    );
  }
}

PasswordForm.initFormState = content => ({ mask: true, repeatPassword: content ? content.password : '' });

PasswordForm.validate = (content, formState) => {
  if (!content.username && !content.password) {
    return 'Please provide either a username or a password.';
  }
  if (formState.mask && content.password !== formState.repeatPassword) {
    return 'Password and repeated value do not match.';
  }
  return false;
};
