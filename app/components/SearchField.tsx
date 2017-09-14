import * as React from 'react';
import { Button, Form, Input, InputGroup, InputGroupButton } from 'reactstrap';
import * as Mousetrap from 'mousetrap';

export interface Props {
  className: string,
  limitedScope: boolean,
  value: string,
  onChange: (value: string) => void,
  onSearch: () => void,
  onToggleScope: () => void
}

export default class SearchField extends React.Component<Props, {}> {
  input: HTMLInputElement;

  componentDidMount() {
    Mousetrap.bind(['ctrl+f', 'meta+f'], () => {
      if (this.input) {
        this.input.focus();
      }
    });
  }

  componentWillUnmount() {
    Mousetrap.unbind(['ctrl+f', 'meta+f']);
  }

  keyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.keyCode === 13) {
      ev.preventDefault();
      this.props.onSearch();
    } else if (ev.keyCode === 9) {
      ev.preventDefault();
      this.props.onToggleScope();
    } else if (ev.keyCode === 27) {
      ev.preventDefault();
      this.props.onChange('');
    }
  };

  render() {
    const { className, limitedScope, value, onChange, onToggleScope } = this.props;
    return (<Form inline className={className}>
      <InputGroup>
        <Input
          getRef={input => { this.input = input; }}
          placeholder="Type to search, enter for fulltext"
          value={value}
          onChange={ev => onChange(ev.target.value)}
          onKeyDown={this.keyDown}
          onFocus={() => { if (this.input) { this.input.select(); } }}
        />
        <InputGroupButton>
          <Button onClick={onToggleScope}>{limitedScope ? 'within folder' : 'everywhere'}</Button>
        </InputGroupButton>
      </InputGroup>
    </Form>);
  }
}
