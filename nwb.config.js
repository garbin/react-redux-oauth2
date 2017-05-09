module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'ReactReduxOAuth2',
      externals: {
        react: 'React'
      }
    }
  }
}
