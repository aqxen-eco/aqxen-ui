module.exports =  {
    env: {node: true, browser: true, es2021: true},
    settings: {
        react: {
            version: 'detect'
        }
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:prettier/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:tailwindcss/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        },
        project: './tsconfig.json'
    },
    plugins: [
        'react',
        'react-refresh',
        'react-hooks',
        'prettier',
        '@typescript-eslint',
        'simple-import-sort',
        'tailwindcss'
    ],
    rules: {
        'react-refresh/only-export-components': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react/prop-types': 'off',
        'tailwindcss/classnames-order': 'warn',
        'tailwindcss/no-contradicting-classname': 'error',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'tailwindcss/no-custom-classname': 'off'
    }
}
