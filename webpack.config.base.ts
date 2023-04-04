/**
 * Base webpack config used across other specific configs
 */
// eslint-disable-next-line
/// <reference path="webpack.config.d.ts" />

import * as path from 'path';
import { Configuration, DefinePlugin } from 'webpack';
import GitRevisionPlugin from 'git-revision-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
// import { dependencies as externals } from './app/package.json';

const gitRevisionPlugin = new GitRevisionPlugin({ lightweightTags: true });

const baseConfig: Configuration = {
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
            mimetype: 'image/svg+xml',
            esModule: false
          }
        }
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: {
          loader: 'url-loader',
          options: { esModule: false }
        }
      },
      // Markdown
      {
        test: /\.md$/,
        use: [
          'html-loader',
          {
            loader: 'markdown-loader',
            options: {
              extensions: {
                renderers: {
                  link({ href, title, text }: { href: string; title: string; text: string }) {
                    // add target="_blank" to links
                    // TODO escaping
                    return `<a href="${href}" title="${title || ''}" target="_blank" rel="noreferrer">${text}</a>`;
                  }
                }
              }
            }
          }
        ]
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
    modules: [path.join(__dirname, 'app'), 'node_modules'],
    aliasFields: [],
    alias: {
      // stop webpack from complaining about these missing nodegit modules, as they are intentionally left out
      './deprecated/structs/DiffPatchidOptions': false,
      './deprecated/structs/Filter': false,
      './deprecated/structs/IndexEntry': false,
      './deprecated/structs/IndexTime': false,
      './deprecated/structs/RemoteCallbacks': false,
      './deprecated/structs/StashSaveOptions': false,
      './deprecated/structs/TreeUpdate': false,
      './deprecated/structs/WorktreeAddOptions': false,
      './deprecated/structs/WorktreePruneOptions': false
    }
  },

  plugins: [
    new DefinePlugin({
      GIT_VERSION: JSON.stringify(gitRevisionPlugin.version()),
      GIT_HASH: JSON.stringify(gitRevisionPlugin.commithash()),
      GIT_BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
      BUILD_DATE: JSON.stringify(new Date())
    })
  ],

  optimization: {
    moduleIds: 'named',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            reserved: ['Key', 'PrivateKey']
          }
        }
      })
    ]
  }
};

export default baseConfig;
