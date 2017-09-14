import EntryPtr from '../../domain/EntryPtr';

export interface State {
  readonly ptr?: EntryPtr,
  readonly parsedContent?: any,
  readonly deleting?: boolean
}
