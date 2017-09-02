import React from 'react';
import { Button, Form, Input, InputGroup, InputGroupButton } from 'reactstrap';

/**
 * Auto-focusing input with confirm and cancel buttons
 */
export default class TextEditBox extends React.Component {
  componentDidMount() {
    if (this.input) {
      this.input.focus();
      this.input.select();
    }
  }

  inputKeyDown = ev => {
    if (ev.keyCode === 27) {  // esc
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onCancel();
    }
  };

  render() {
    const { value, onChange, onConfirm, onCancel } = this.props;
    return (
      <Form onSubmit={onConfirm}>
        <InputGroup>
          <Input getRef={input => { this.input = input; }} value={value} onChange={ev => onChange(ev.target.value)} onKeyDown={this.inputKeyDown} />
          <InputGroupButton><Button type="submit" color="success"><i className="fa fa-check" /></Button></InputGroupButton>
          <InputGroupButton><Button color="danger" onClick={onCancel}><i className="fa fa-times" /></Button></InputGroupButton>
        </InputGroup>
      </Form>
    );
  }
}
