import * as React from 'react';
import { Input, InputProps } from 'reactstrap';

type Props = InputProps & { focused?: boolean };

export default class FocusingInput extends React.Component<Props, {}> {
  private inputRef: HTMLInputElement;

  componentDidMount() {
    this.tryFocus();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.disabled && !this.props.disabled) {
      this.tryFocus();
    }
  }

  tryFocus() {
    if (this.inputRef && this.props.focused) {
      setTimeout(() => {
        this.inputRef.focus();
        this.inputRef.select();
      });
    }
  }

  render() {
    const { focused, innerRef, ...innerProps } = this.props;
    return (
      <Input
        innerRef={(ref) => {
          this.inputRef = ref!;
          if (typeof innerRef === 'function') {
            innerRef(ref);
          }
        }}
        {...innerProps}
      />
    );
  }
}
