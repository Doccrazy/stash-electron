import * as React from 'react';
import { copyToClip } from '../../actions/currentEntry';
import HiddenText from '../../components/tools/HiddenText';
import { sanitizeUrl } from '../../utils/format';
import * as styles from './Panel.scss';

interface FieldProps {
  content: any,
  id: string,
  name: string,
  wide?: boolean,
  Renderer?: any
}

interface RendererProps {
  value: string
}

const Field = ({ content, id, name, wide, Renderer }: FieldProps) => {
  const C = Renderer || DefRenderer;
  return (!content || content[id]) ? (<div className={styles.field}>
    <div className={`clickable ${styles.label}`} title="Copy to clipboard" onClick={() => copyToClip(name, content[id])}>
      <strong>{name} <i className="fa fa-copy" /></strong>
    </div>
    <div className={styles.content}>{content ? <C value={content[id]} /> : <i className="fa fa-spinner" />}</div>
  </div>) : <div />;
};

const DefRenderer = ({ value }: RendererProps) => (
  <span>{value}</span>
);

const URLRenderer = ({ value }: RendererProps) => (<div className={styles.ellipsis}>
  <a href={sanitizeUrl(value)} title={sanitizeUrl(value)}>{value}</a>
</div>);

const PasswordRenderer = ({ value }: RendererProps) => (
  <strong><HiddenText replacement="●●●●●●●●">{value}</HiddenText></strong>
);

export interface Props {
  parsedContent: any
}

export default ({ parsedContent }: Props) => (<div>
  <Field id="description" name="Description" wide content={parsedContent} />
  <div className={styles.row}>
    <Field id="username" name="Username" content={parsedContent} />
    <Field id="url" name="URL" content={parsedContent} Renderer={URLRenderer} />
  </div>
  <Field id="password" name="Password" content={parsedContent} Renderer={PasswordRenderer} />
</div>);
