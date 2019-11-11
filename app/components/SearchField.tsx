import * as React from 'react';
import { Button, Form, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import * as Mousetrap from 'mousetrap';
import Trans from '../utils/i18n/Trans';

export interface Props {
  className?: string,
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
  readonly input = React.createRef<HTMLInputElement>();
  readonly button = React.createRef<HTMLButtonElement>();

  constructor(props: Props) {
    super(props);
    this.globalKeyPress = this.globalKeyPress.bind(this);
    this.keyDown = this.keyDown.bind(this);
  }

  componentDidMount() {
    Mousetrap.bind(['ctrl+f', 'meta+f'], ev => {
      if (this.input.current && !shouldIgnore(ev)) {
        this.input.current.focus();
        if (this.props.limitedScope) {
          this.props.onToggleScope();
        }
      }
    });

    document.documentElement!.addEventListener('keypress', this.globalKeyPress);
  }

  componentWillUnmount() {
    Mousetrap.unbind(['ctrl+f', 'meta+f']);
    document.documentElement!.removeEventListener('keypress', this.globalKeyPress);
  }

  globalKeyPress(ev: KeyboardEvent) {
    // when the user starts typing without a focused input field, start a search in current folder
    if (!shouldIgnore(ev) && /^\S$/.test(ev.key) && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
      if (this.input.current) {
        this.input.current.focus();
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
  }

  render() {
    const { className, limitedScope, value, onChange, onToggleScope, onShowResults } = this.props;
    return (<Form inline className={className}>
      <InputGroup className="w-100">
        <Trans>{t => <Input
          innerRef={this.input}
          placeholder={t('component.searchField.placeholder')}
          value={value}
          onChange={ev => onChange(ev.target.value)}
          onKeyDown={this.keyDown}
          onFocus={() => { if (this.input.current) { this.input.current.select(); onShowResults(); } this.forceUpdate(); }}
          onBlur={() => this.forceUpdate()}
        />}</Trans>
        <InputGroupAddon addonType="append">
          <Button
            innerRef={this.button}
            color={limitedScope && [this.input.current, this.button.current].includes(document.activeElement as any) ? 'info' : 'secondary'}
            onClick={onToggleScope}>
            <Trans id={`component.searchField.scope.${limitedScope ? 'limited' : 'full'}`}/>
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </Form>);
  }
}
