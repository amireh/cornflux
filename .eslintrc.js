module.exports = {
  "env": {
    "browser": true,
    "mocha": false,
    "node": false,
  },

  "plugins": [ "react" ],

  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 6,
    "ecmaFeatures": {
      "jsx": true,
      "modules": true,
    }
  },

  "rules": {
    "no-undef": 2,
    "no-unused-vars": 2,
    "no-shadow": 2,

    "react/jsx-uses-react": 2,
    "react/jsx-no-undef": 2,
    "react/jsx-uses-vars": 2,
    "react/react-in-jsx-scope": 2,
    "react/prop-types": 1,
  },

  "globals": {
    "Promise": false,
    "process": false
  },
  overrides: [
    {
      files: [ '**/*.test.js' ],
      env: {
        mocha: true
      },
      rules: {
        "react/prop-types": 0,
      }
    }
  ]
}