const TS_RULES = {
  '@typescript-eslint/ban-types': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
  '@typescript-eslint/restrict-template-expressions': 'off',
  '@typescript-eslint/unbound-method': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-misused-promises': [
    'error',
    {
      checksVoidReturn: false
    }
  ]
};

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018
  },
  env: {
    node: true,
    es2017: true
  },
  extends: ['eslint:recommended'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      excludedFiles: ['app/main.ts', 'app/menu.ts'],
      env: {
        browser: true
      },
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier/@typescript-eslint',
        'prettier/react',
        'plugin:prettier/recommended'
      ],
      plugins: ['react-hooks'],
      parserOptions: {
        project: `${__dirname}/tsconfig.json`,
        tsconfigRootDir: __dirname
      },
      rules: {
        ...TS_RULES,
        'react/prop-types': 'off',
        'react/jsx-fragments': 'warn',
        'react/no-unescaped-entities': 'off',
        'react/self-closing-comp': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn'
      },
      settings: {
        react: {
          version: 'detect'
        }
      }
    },
    {
      files: ['app/main.ts', 'app/menu.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended'
      ],
      parserOptions: {
        project: `${__dirname}/tsconfig.json`,
        tsconfigRootDir: __dirname
      },
      rules: {
        ...TS_RULES
      }
    },
    {
      files: ['test/**/*.js'],
      env: {
        mocha: true
      },
      rules: {}
    }
  ]
};
