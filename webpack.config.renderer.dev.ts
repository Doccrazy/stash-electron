/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import { Configuration, DefinePlugin, LoaderOptionsPlugin, HotModuleReplacementPlugin } from 'webpack';
import { mergeWithRules, CustomizeRule } from 'webpack-merge';
import { spawn } from 'child_process';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from './internals/scripts/CheckNodeEnv';

CheckNodeEnv('development');

const port = Number.parseInt(process.env.PORT || '1212', 10);

const rendererDevConfig: Configuration = {
  mode: 'development',
  devtool: 'inline-source-map',

  target: 'electron-renderer',

  entry: path.join(__dirname, 'app/index.tsx'),

  output: {
    path: path.join(__dirname, 'build', 'dist'),
    filename: 'renderer.dev.js'
  },

  externals: ['fsevents', 'crypto-browserify', '../build/Debug/nodegit.node'],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/react', '@babel/typescript'],
            plugins: ['@babel/proposal-class-properties', 'react-refresh/babel']
          }
        }
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      // Extract all .global.css to style.css as is, pipe other styles through css modules and append to style.css
      {
        test: /\.s?css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: /^((?!\.global).)*\.s?css$/,
                localIdentName: '[name]__[local]__[hash:base64:5]',
                exportLocalsConvention: 'camelCase'
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },

  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),

    new LoaderOptionsPlugin({
      debug: true
    }),

    new HotModuleReplacementPlugin(),
    new ReactRefreshPlugin() as any,
    new ForkTsCheckerWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'app/app.html')
    })
  ],

  optimization: {
    emitOnErrors: false
  },

  node: {
    __dirname: false,
    __filename: false
  },

  watchOptions: {
    aggregateTimeout: 300,
    ignored: /\.yarn|\.git/,
    poll: 100
  },
  stats: 'errors-only',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  devServer: {
    port,
    compress: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    onBeforeSetupMiddleware() {
      if (process.env.START_HOT) {
        console.log('Staring Main Process...');
        spawn('yarn', ['run', 'start-main-dev', '--', process.env.MAIN_ARGS || ''], {
          shell: true,
          env: { ...process.env, DEV_SERVER_ROOT: 'http://localhost:1212/' },
          stdio: 'inherit'
        })
          .on('close', (code) => process.exit(code))
          .on('error', (spawnError) => console.error(spawnError));
      }
    }
  } as any,
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename] // you may omit this when your CLI automatically adds it
    }
  }
};

export default mergeWithRules({
  module: {
    rules: {
      test: CustomizeRule.Match,
      use: CustomizeRule.Replace
    }
  }
})(baseConfig, rendererDevConfig);
