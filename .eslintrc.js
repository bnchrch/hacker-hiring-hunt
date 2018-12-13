module.exports = {
  env: {
    browser: true,
    es6: true,
    jquery: true,
  },
  extends: [
    "metalab",
    "metalab/react"
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  rules: {
    "metalab/prettier/prettier": 0,

    // disable no-unresolved as it does not work with webpack aliases
    "metalab/import/no-unresolved": 0,

    // disable this as it doesn't take into account form onSubmit
    "metalab/jsx-a11y/no-noninteractive-element-interactions": 0,

    "metalab/jsx-a11y/label-has-for": [2, {
      "required": {"some": ["nesting", "id"]},
    }],

    // disable for some rules to prevent indent rule conflict
    "metalab/react/jsx-closing-bracket-location": [
      "warning",
      {
        selfClosing: "line-aligned",
        nonEmpty: "after-props",
      }
    ],
    "require-jsdoc": [
      "error",
      {
        "require": {
          "FunctionDeclaration": true,
          "MethodDefinition": false,
          "ClassDeclaration": false,
          "ArrowFunctionExpression": true,
          "FunctionExpression": false
        }
      }
    ],
    "max-len": ["error", 120],
  }
};
