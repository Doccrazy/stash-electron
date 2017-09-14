export interface State {
  readonly nodeId?: string,
  readonly specialId?: string,
  readonly renaming?: boolean,
  readonly creating?: boolean,
  readonly deleting?: boolean,
  readonly initialName?: string,
  readonly name?: string
}
