import * as React from 'react';
import { FormGroup, Label, Input, Col } from 'reactstrap';
import Trans from '../../utils/i18n/Trans';
import { FormProps } from '../index';

export default class DefaultForm extends React.Component<FormProps<void, void>, {}> {
  readonly nameInput = React.createRef<HTMLInputElement>();

  componentDidMount() {
    setTimeout(() => {
      if (this.nameInput.current) {
        this.nameInput.current.focus();
      }
    });
  }

  render() {
    const { name, onChangeName } = this.props;
    return (
      <div>
        <FormGroup row>
          <Label sm={2} for="name">
            <Trans id="fileType.default.field.name" />
          </Label>
          <Col sm={10}>
            <Trans>
              {(t) => (
                <Input
                  innerRef={this.nameInput}
                  id="name"
                  placeholder={t('fileType.default.field.name')}
                  value={name}
                  onChange={(ev) => onChangeName(ev.target.value)}
                />
              )}
            </Trans>
          </Col>
        </FormGroup>
      </div>
    );
  }
}
