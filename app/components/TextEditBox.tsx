import * as React from 'react';
import { Button, Form, Input, InputGroup, InputGroupButton } from 'reactstrap';

export interface Props {
  placeholder?: string,
  value: string,
  onChange: (value: string) => void,
  onConfirm: () => void,
  onCancel: () => void
}

/**
 * Auto-focusing input with confirm and cancel buttons
 */
export default class TextEditBox extends React.Component<Props, {}> {
  input: HTMLInputElement;

  componentDidMount() {
    if (this.input) {
      this.input.focus();
      this.input.select();
    }
  }

  inputKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.keyCode === 27) {  // esc
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onCancel();
    }
  };

  render() {
    const { placeholder, value, onChange, onConfirm, onCancel } = this.props;
    return (
      <Form onSubmit={onConfirm}>
        <InputGroup>
          <Input
            placeholder={placeholder}
            innerRef={input => { this.input = input; }}
            value={value}
            onChange={ev => onChange(ev.target.value)}
            onKeyDown={this.inputKeyDown}
          />
          <InputGroupButton><Button type="submit" color="success"><i className="fa fa-check" /></Button></InputGroupButton>
          <InputGroupButton><Button color="danger" onClick={onCancel}><i className="fa fa-times" /></Button></InputGroupButton>
        </InputGroup>
      </Form>
    );
  }
}
