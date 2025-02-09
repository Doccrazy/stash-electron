import { PrivatebinOptions } from '@pixelfactory/privatebin';
import EntryPtr from '../../domain/EntryPtr';

export interface State {
  readonly sharing?: EntryPtr;
  readonly formState: ShareFormState;
  readonly pasteUrl?: string;
}

export interface ShareFormState {
  expire: PrivatebinOptions['expire'];
  burnAfterReading?: boolean;
}
