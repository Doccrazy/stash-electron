import React from 'react';
import { Button, Form, Input, InputGroup, InputGroupButton } from 'reactstrap';

export default function SearchField({ className, limitedScope, value, onChange, onSearch, onToggleScope }) {
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
