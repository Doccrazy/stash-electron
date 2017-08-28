import React from 'react';
import { Row, Col } from 'reactstrap';
import { clipboard } from 'electron';
import { toastr } from 'react-redux-toastr';
import HiddenText from '../../utils/HiddenText';
import utils from '../../utils/styles.css';
import styles from './Password.css';

function sanitizeUrl(url) {
  if (!url) {
    return '#';
  }
  if (!/^[a-z]+:/.test(url)) {
    return `http://${url}`;
  }
  return url;
}

function copyToClip(name, text) {
  clipboard.writeText(text);
  toastr.success(`${name} copied`);
}

const Field = ({ content, id, name, wide, Renderer }) => {
  const C = Renderer || DefRenderer;
  return (<Col xs={wide ? 12 : 6}>
    {(!content || content[id]) && <Row>
      <Col xs={wide ? 2 : 4} className={`${utils.clickable} ${styles.label}`} title="Copy to clipboard" onClick={() => copyToClip(name, content[id])}>
        <strong>{name} <i className="fa fa-copy" /></strong>
      </Col>
      <Col xs={wide ? 10 : 8}>{content ? <C value={content[id]} /> : <i className="fa fa-spinner" />}</Col>
    </Row>}
  </Col>);
};

const DefRenderer = ({ value }) => (
  <span>{value}</span>
);

const URLRenderer = ({ value }) => (<div className={styles.ellipsis}>
  <a href={sanitizeUrl(value)} title={sanitizeUrl(value)}>{value}</a>
</div>);

const PasswordRenderer = ({ value }) => (
  <strong><HiddenText replacement="●●●●●●●●">{value}</HiddenText></strong>
);

export default ({ parsedContent }) => (<Row>
  <Field id="description" name="Description" wide content={parsedContent} />
  <Field id="username" name="Username" content={parsedContent} />
  <Field id="url" name="URL" content={parsedContent} Renderer={URLRenderer} />
  <Field id="password" name="Password" content={parsedContent} Renderer={PasswordRenderer} />
</Row>);
