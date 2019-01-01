/**
 * Base webpack config used across other specific configs
 */
// tslint:disable-next-line
/// <reference path="webpack.config.d.ts" />

import * as path from 'path';
import * as webpack from 'webpack';
import * as GitRevisionPlugin from 'git-revision-webpack-plugin';
import * as TerserPlugin from 'terser-webpack-plugin';
// import { dependencies as externals } from './app/package.json';

const gitRevisionPlugin = new GitRevisionPlugin();

const baseConfig: webpack.Configuration = {
  // externals: Object.keys(externals || {}),

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // disable type checker - we will use it in fork plugin
            transpileOnly: true
          }
        }
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream'
          }
        }
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader'
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml'
          }
        }
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader'
      },
      // Markdown
      {
        test: /\.md$/,
        use: ['html-loader', 'markdown-loader']
      },
      // YAML
      {
        test: /\.ya?ml$/,
        use: ['json-loader', 'yaml-loader']
      }
    ]
  },

  output: {
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: [
      path.join(__dirname, 'app'),
      'node_modules'
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      GIT_VERSION: JSON.stringify(gitRevisionPlugin.version()),
      GIT_HASH: JSON.stringify(gitRevisionPlugin.commithash()),
      GIT_BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
      BUILD_DATE: JSON.stringify(new Date())
    }),
    new webpack.NormalModuleReplacementPlugin(
      /[/\\]promisify-node[/\\]utils[/\\]args\.js$/,
      path.join(__dirname, 'app/utils/promisify-node-args-patch.js')
    )
  ],

  optimization: {
    namedModules: true,
    minimizer: [new TerserPlugin({
      sourceMap: true,
      terserOptions: {
        mangle: {
          reserved: ['Key', 'PrivateKey']
        }
      }
    })]
  }
};

export default baseConfig;
