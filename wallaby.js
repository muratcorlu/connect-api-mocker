module.exports = function (wallaby) {
    return {
        files: [
            'index.js',
            { pattern: 'test/mocks/**/*.js', instrument: false },
            { pattern: 'test/mocks/**/*.json', instrument: false },
            { pattern: 'test/mocks/**/*.xml', instrument: false }
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
