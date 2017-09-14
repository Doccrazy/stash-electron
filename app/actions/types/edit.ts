import EntryPtr from '../../domain/EntryPtr';

export interface State {
  readonly ptr?: EntryPtr,
  readonly typeId?: string,
  readonly name?: string,
  readonly initialContent?: any,
  readonly parsedContent?: any,
  readonly formState?: any,
  readonly validationError?: string
}
