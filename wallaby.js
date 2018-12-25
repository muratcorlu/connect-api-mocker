module.exports = function w() {
  return {
    files: [
      'index.js',
      { pattern: 'test/mocks/**/*.js', instrument: false },
      { pattern: 'test/mocks/**/*.json', instrument: false },
      { pattern: 'test/mocks/**/*.xml', instrument: false },
      { pattern: 'examples/**/*.js', instrument: false },
      { pattern: 'examples/**/*.json', instrument: false },
      { pattern: 'examples/**/*.xml', instrument: false }
    ],
    tests: [
      'test/**/*.spec.js'
    ],
    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'mocha'
  };
};
