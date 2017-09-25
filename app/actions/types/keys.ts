import * as sshpk from 'sshpk';

export interface FormState {
  readonly username?: string,
  readonly publicKey?: string,
  readonly keyName?: string
}

export interface State {
  readonly byUser: { [username: string]: sshpk.Key },
  readonly edited: { [username: string]: sshpk.Key },
  readonly modified?: boolean,
  readonly addOpen?: boolean,
  readonly formState: FormState,
  readonly valid?: boolean,
  readonly feedback?: string
}
