module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {targets: {browsers: '> 5%, not IE <= 11'}}
    ],
    '@babel/preset-typescript',
    '@babel/preset-react'
  ],
  plugins: [
    'react-hot-loader/babel',
    'babel-plugin-styled-components',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator'
  ]
};
