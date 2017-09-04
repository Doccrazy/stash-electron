// @flow
import React from 'react';
import { FormGroup, Label, Input, Col } from 'reactstrap';

type Props = {
  name: string,
  onChangeName: string => void
};

export default class DefaultForm extends React.Component<void, Props, void> {
  nameInput: ?HTMLInputElement;

  componentDidMount() {
    setTimeout(() => {
      if (this.nameInput) {
        this.nameInput.focus();
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
              getRef={c => { this.nameInput = c; }}
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
