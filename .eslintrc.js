module.exports = {
    "extends": "airbnb-base",
    "env": {
      node: true,
      mocha: true
    },
    "rules": {
        "max-len": "off",
        "func-names": "off",
        "no-useless-escape": "off",
        "global-require": "off",
        "import/no-dynamic-require": "off",
        "consistent-return": "off",
        "prefer-destructuring": "off",
        "camelcase": "off",
        "comma-dangle": ["error", "never"]
    }
};
