import * as React from 'react';
import { copyToClip } from '../../actions/currentEntry';
import HiddenText from '../../components/tools/HiddenText';
import { sanitizeUrl } from '../../utils/format';
import Trans from '../../utils/i18n/Trans';
import styles from './Panel.scss';

interface FieldProps {
  content: any;
  id: string;
  wide?: boolean;
  Renderer?: any;
}

interface RendererProps {
  value: string;
}

const DefRenderer = ({ value }: RendererProps) => <span>{value}</span>;

const Field = ({ content, id, wide, Renderer }: FieldProps) => {
  const C = Renderer || DefRenderer;
  const nameMsgId = `fileType.password.field.${id}`;
  return !content || content[id] ? (
    <div className={styles.field}>
      <Trans>
        {(t) => (
          <div
            className={`clickable ${styles.label}`}
            title={t('fileType.password.panel.copyToClip')}
            onClick={() => copyToClip(t(nameMsgId), content[id])}
          >
            <strong>
              {t(nameMsgId)} <i className="fa fa-copy" />
            </strong>
          </div>
        )}
      </Trans>
      <div className={styles.content}>{content ? <C value={content[id]} /> : <i className="fa fa-spinner" />}</div>
    </div>
  ) : (
    <div />
  );
};

const PreRenderer = ({ value }: RendererProps) => <span className={styles.pre}>{value}</span>;

const URLRenderer = ({ value }: RendererProps) => (
  <div className={styles.ellipsis}>
    <a href={sanitizeUrl(value)} title={sanitizeUrl(value)} target="_blank" rel="noreferrer">
      {value}
    </a>
  </div>
);

const PasswordRenderer = ({ value }: RendererProps) => (
  <strong>
    <HiddenText replacement="●●●●●●●●">{value}</HiddenText>
  </strong>
);

export interface Props {
  parsedContent: any;
}

const PasswordPanel = ({ parsedContent }: Props) => (
  <div>
    <Field id="description" wide content={parsedContent} Renderer={PreRenderer} />
    <div className={styles.row}>
      <Field id="username" content={parsedContent} />
      <Field id="url" content={parsedContent} Renderer={URLRenderer} />
    </div>
    <Field id="password" content={parsedContent} Renderer={PasswordRenderer} />
  </div>
);

export default PasswordPanel;
