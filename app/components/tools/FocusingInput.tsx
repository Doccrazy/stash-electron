import * as React from 'react';
import { Input, InputProps } from 'reactstrap';

export default class FocusingInput extends React.Component<InputProps & { focused: boolean }, {}> {
  private inputRef: HTMLInputElement;

  setRef = (ref: HTMLInputElement) => {
    if (!this.inputRef && this.props.focused) {
      this.inputRef = ref;
      setTimeout(() => { ref.focus(); ref.select(); });
    }
  }

  render() {
    const { focused, ...innerProps } = this.props;
    return <Input innerRef={this.setRef} {...innerProps} />;
  }
}
