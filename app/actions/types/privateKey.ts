import * as sshpk from 'sshpk';

export enum KeyError {
  FILE,
  ENCRYPTED,
  PASSPHRASE,
  CANCELLED
}

interface GenerateState {
  readonly open?: boolean,
  readonly working?: boolean,
  readonly passphrase?: string,
  readonly repeatPassphrase?: string
  readonly strength?: number
}

export interface State {
  readonly key?: sshpk.PrivateKey;
  readonly error?: KeyError,
  readonly username?: string,
  readonly encrypted?: boolean,
  readonly generate: GenerateState
}
