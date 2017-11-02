declare module 'font-awesome-filetypes';

declare module 'kdbxweb';

declare module 'natural-compare';

declare module 'electron-unhandled';

declare module '*.css' {
  interface IClassNames {
    [className: string]: string
  }
  const classNames: IClassNames;
  export = classNames;
}

declare module '*.scss' {
  interface IClassNames {
    [className: string]: string
  }
  const classNames: IClassNames;
  export = classNames;
}
