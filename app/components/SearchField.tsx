import * as React from 'react';
import { Form, Input, InputGroup } from 'reactstrap';
import * as Mousetrap from 'mousetrap';
import Trans from '../utils/i18n/Trans';

export interface Props {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  onShowResults: () => void;
}

function shouldIgnore(ev: KeyboardEvent) {
  return (
    document.body.matches('.modal-open') ||
    (ev.target instanceof HTMLElement &&
      // copied from mousetrap
      (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT' || ev.target.tagName === 'TEXTAREA' || ev.target.isContentEditable))
  );
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
    Mousetrap.bind('mod+f', (ev) => {
      if (this.input.current && !shouldIgnore(ev)) {
        this.input.current.focus();
      }
    });

    document.documentElement.addEventListener('keypress', this.globalKeyPress);
  }

  componentWillUnmount() {
    Mousetrap.unbind('mod+f');
    document.documentElement.removeEventListener('keypress', this.globalKeyPress);
  }

  globalKeyPress(ev: KeyboardEvent) {
    // when the user starts typing without a focused input field, start a search in current folder
    if (!shouldIgnore(ev) && /^\S$/.test(ev.key) && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
      if (this.input.current) {
        this.input.current.focus();
      }
    }
  }

  keyDown(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (ev.keyCode === 27) {
      // clear on esc
      ev.preventDefault();
      this.props.onChange('');
    }
  }

  render() {
    const { className, value, onChange, onShowResults } = this.props;
    return (
      <Form inline className={className}>
        <InputGroup className="w-100">
          <Trans>
            {(t) => (
              <Input
                innerRef={this.input}
                className="mousetrap"
                placeholder={t('component.searchField.placeholder')}
                value={value}
                onChange={(ev) => onChange(ev.target.value)}
                onKeyDown={this.keyDown}
                onFocus={() => {
                  if (this.input.current) {
                    this.input.current.select();
                    onShowResults();
                  }
                  this.forceUpdate();
                }}
                onBlur={() => this.forceUpdate()}
              />
            )}
          </Trans>
        </InputGroup>
      </Form>
    );
  }
}
