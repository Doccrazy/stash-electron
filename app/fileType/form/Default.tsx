import * as React from 'react';
import { FormGroup, Label, Input, Col } from 'reactstrap';
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
          <Label sm={2} for="name">Filename</Label>
          <Col sm={10}>
            <Input
              innerRef={this.nameInput}
              id="name"
              placeholder="Filename"
              value={name}
              onChange={ev => onChangeName(ev.target.value)}
            />
          </Col>
        </FormGroup>
      </div>
    );
  }
}
