import { PrivatebinOptions } from '@pixelfactory/privatebin';
import * as React from 'react';
import { Button, ButtonGroup, FormGroup, Input, Label } from 'reactstrap';
import { ShareFormState } from '../actions/types/share';
import ConfirmPopup from '../components/ConfirmPopup';
import { EntryNameLabel } from '../fileType/Components';
import Trans from '../utils/i18n/Trans';
import withTrans from '../utils/i18n/withTrans';

const EXPIRATION_OPTIONS: PrivatebinOptions['expire'][] = ['5min', '10min', '1hour', '1day', '1week', '1month', '1year', 'never'];

interface Props {
  open: boolean;
  entry?: string;
  privateBinSite: string;
  value: ShareFormState;
  onChange: (value: ShareFormState) => void;
  onShare: () => void;
  onClose: () => void;
}

export default withTrans<Props>('component.sharePrivateBinPopup')(
  ({ t, open, entry, privateBinSite, value, onChange, onShare, onClose }) => (
    <ConfirmPopup open={open} size="lg" title={t('.title')} onConfirm={onShare} onClose={onClose}>
      <div className="mb-3">
        <Trans id=".info" entry={<EntryNameLabel fileName={entry} />} siteLink={<a href={privateBinSite}>{privateBinSite}</a>} />
      </div>
      <FormGroup>
        <Label>{t('.field.expire')}</Label>
        <div>
          <ButtonGroup>
            {EXPIRATION_OPTIONS.map((duration) => (
              <Button key={duration} outline active={value.expire === duration} onClick={() => onChange({ ...value, expire: duration })}>
                {t(`.expire.${duration}`)}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </FormGroup>
      <FormGroup check>
        <Label check>
          <Input
            type="checkbox"
            checked={!!value.burnAfterReading}
            onChange={(ev) => onChange({ ...value, burnAfterReading: ev.target.checked })}
          />
          {t('.field.burnAfterReading')}
        </Label>
      </FormGroup>
    </ConfirmPopup>
  )
);
