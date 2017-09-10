import EntryPtr from '../../domain/EntryPtr';

export interface State {
  ptr?: EntryPtr,
  parsedContent?: any,
  deleting?: boolean
}
