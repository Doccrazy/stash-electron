import * as React from 'react';
import { Button, Form, Input, InputGroup, InputGroupButton } from 'reactstrap';
import * as Mousetrap from 'mousetrap';

export interface Props {
  className: string,
  limitedScope: boolean,
  value: string,
  onChange: (value: string) => void,
  onSearch: () => void,
  onToggleScope: () => void,
  onShowResults: () => void
}

function shouldIgnore(ev: KeyboardEvent) {
  return document.body.matches('.modal-open') || (ev.target instanceof HTMLElement && (
    // copied from mousetrap
    ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT' || ev.target.tagName === 'TEXTAREA' || ev.target.isContentEditable
  ));
}

export default class SearchField extends React.Component<Props, {}> {
  input: HTMLInputElement;

  componentWillMount() {
    this.globalKeyPress = this.globalKeyPress.bind(this);
    this.keyDown = this.keyDown.bind(this);
  }

  componentDidMount() {
    Mousetrap.bind(['ctrl+f', 'meta+f'], ev => {
      if (this.input && !shouldIgnore(ev)) {
        this.input.focus();
        if (this.props.limitedScope) {
          this.props.onToggleScope();
        }
      }
    });

    document.documentElement.addEventListener('keypress', this.globalKeyPress);
  }

  componentWillUnmount() {
    Mousetrap.unbind(['ctrl+f', 'meta+f']);
    document.documentElement.removeEventListener('keypress', this.globalKeyPress);
  }

  globalKeyPress(ev: KeyboardEvent) {
    // when the user starts typing without a focused input field, start a search in current folder
    if (!shouldIgnore(ev) && /^\S$/.test(ev.key) && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
      if (this.input) {
        this.input.focus();
      }
      if (!this.props.limitedScope) {
        this.props.onToggleScope();
      }
    }
  }

  keyDown(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (ev.keyCode === 13) {  // search on enter
      ev.preventDefault();
      this.props.onSearch();
    } else if (ev.keyCode === 9) {  // toggle scope on tab
      ev.preventDefault();
      this.props.onToggleScope();
    } else if (ev.keyCode === 27) {  // clear on esc
      ev.preventDefault();
      this.props.onChange('');
    } else if (ev.key === 'f' && ev.ctrlKey && this.props.limitedScope) {  // set global scope on ctrl+f
      ev.preventDefault();
      this.props.onToggleScope();
    }
  };

  render() {
    const { className, limitedScope, value, onChange, onToggleScope, onShowResults } = this.props;
    return (<Form inline className={className}>
      <InputGroup>
        <Input
          innerRef={input => { this.input = input; }}
          placeholder="Type to search, enter for fulltext"
          value={value}
          onChange={ev => onChange(ev.target.value)}
          onKeyDown={this.keyDown}
          onFocus={() => { if (this.input) { this.input.select(); onShowResults(); } }}
        />
        <InputGroupButton>
          <Button onClick={onToggleScope}>{limitedScope ? 'within folder' : 'everywhere'}</Button>
        </InputGroupButton>
      </InputGroup>
    </Form>);
  }
}
