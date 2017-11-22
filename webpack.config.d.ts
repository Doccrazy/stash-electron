declare module '*.json' {
  const value: { [key: string]: any };
  export = value;
}

declare module 'fork-ts-checker-webpack-plugin';

declare module 'uglifyjs-webpack-plugin';

declare module 'git-revision-webpack-plugin';
