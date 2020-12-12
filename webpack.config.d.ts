declare module '*.json' {
  const value: { [key: string]: any };
  export = value;
}

declare module 'autodll-webpack-plugin';
