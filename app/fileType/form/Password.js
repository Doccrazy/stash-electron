import React from 'react';
import { Button, Form, FormGroup, Label, Input, InputGroup, InputGroupButton, Row, Col } from 'reactstrap';

export default class PasswordForm extends React.Component {
  state = {
    repeatPassword: this.props.value.password,
    mask: true
  };

  changeRepeatPassword = ev => this.setState({ repeatPassword: ev.target.value });

  toggleMask = () => {
    const newState = { mask: !this.state.mask };
    if (newState.mask) {
      newState.repeatPassword = this.props.value.password;
    }
    return this.setState(newState, () => {
      if (this.passwordInput) {
        this.passwordInput.focus();
        this.passwordInput.select();
      }
    });
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
                type={this.state.mask ? 'password' : 'text'}
                id="password"
                placeholder="Password"
                value={value.password}
                onChange={ev => onChange({ ...value, password: ev.target.value })}
              /></Col>
              <Col xs="auto"><Button title="Toggle password masking" active={this.state.mask} onClick={this.toggleMask}><i className="fa fa-ellipsis-h" /></Button></Col>
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
                placeholder={this.state.mask ? 'Repeat password' : ''}
                disabled={!this.state.mask}
                value={this.state.mask ? this.state.repeatPassword : ''}
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
