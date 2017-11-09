export interface Credentials {
  username?: string,
  password: string
}

export interface FormState {
  username?: string,
  password?: string,
  savePassword?: boolean
}

export interface State {
  open?: boolean,
  working?: boolean,
  context?: string,
  askUsername?: boolean,
  title?: string,
  text?: string,
  state: FormState,
  error?: string
}
