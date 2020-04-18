import * as React from 'react';
import { Button, Form, Input, InputGroup, InputGroupAddon } from 'reactstrap';

export interface Props {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Auto-focusing input with confirm and cancel buttons
 */
export default class TextEditBox extends React.Component<Props, {}> {
  readonly input = React.createRef<HTMLInputElement>();

  componentDidMount() {
    if (this.input.current) {
      this.input.current.focus();
      this.input.current.select();
    }
  }

  inputKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.keyCode === 27) {
      // esc
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
            innerRef={this.input}
            value={value}
            onChange={(ev) => onChange(ev.target.value)}
            onKeyDown={this.inputKeyDown}
          />
          <InputGroupAddon addonType="append">
            <Button type="submit" color="success">
              <i className="fa fa-check" />
            </Button>
          </InputGroupAddon>
          <InputGroupAddon addonType="append">
            <Button color="danger" onClick={onCancel}>
              <i className="fa fa-times" />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </Form>
    );
  }
}
