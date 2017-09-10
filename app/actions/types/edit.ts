import EntryPtr from '../../domain/EntryPtr';

export interface State {
  ptr?: EntryPtr,
  typeId?: string,
  name?: string,
  initialContent?: any,
  parsedContent?: any,
  formState?: any,
  validationError?: string
}
