import * as React from 'react';
import { Button, Form, Input, InputGroup, InputGroupButton } from 'reactstrap';

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

  render() {
    const { className, limitedScope, value, onChange, onSearch, onToggleScope } = this.props;
    return (<Form inline className={className}>
      <InputGroup>
        <Input
          getRef={input => { this.input = input; }}
          placeholder="Type to search, enter for fulltext"
          value={value}
          onChange={ev => onChange(ev.target.value)}
          onKeyDown={ev => { if (ev.keyCode === 13) { onSearch(); } }}
          onFocus={() => { if (this.input) { this.input.select(); } }}
        />
        <InputGroupButton>
          <Button onClick={onToggleScope}>{limitedScope ? 'within folder' : 'everywhere'}</Button>
        </InputGroupButton>
      </InputGroup>
    </Form>);
  }
}
