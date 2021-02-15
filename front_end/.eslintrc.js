// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const path = require('path');
const rulesDirPlugin = require('eslint-plugin-rulesdir');
rulesDirPlugin.RULES_DIR = path.join(__dirname, '..', 'scripts', 'eslint_rules', 'lib');

module.exports = {
  'overrides': [
    {
      'files': ['*.ts'],
      'rules': {
        '@typescript-eslint/explicit-function-return-type': 2,

        'rulesdir/kebab_case_events': 2,
        'rulesdir/set_data_type_reference': 2,
        'rulesdir/lit_html_data_as_type': 2,
        'rulesdir/lit_no_style_interpolation': 2,
        '@typescript-eslint/naming-convention': [
          'error', {
            'selector': 'property',
            'modifiers': ['private', 'protected'],
            'format': ['camelCase'],
          },
          {
            'selector': 'method',
            'format': ['camelCase'],
          },
          {
            // Public methods are currently in transition and may still have leading underscores.
            'selector': 'method',
            'modifiers': ['public'],
            'format': ['camelCase'],
            'leadingUnderscore': 'allow',
          },
          {
            // Object literals may be constructed as arguments to external libraries which follow different styles.
            'selector': ['objectLiteralMethod', 'objectLiteralProperty'],
            'modifiers': ['public'],
            'format': null,
          },
          {
            'selector': 'accessor',
            'format': ['camelCase'],
          },
          {
            'selector': ['typeLike'],
            'format': ['PascalCase'],
          },
          {
            'selector': 'parameter',
            'format': ['camelCase'],
            'leadingUnderscore': 'allow',
          }
        ]
      }
    },
    {
      'files': ['*-meta.ts'],
      'rules': {
        '@typescript-eslint/naming-convention': [
          'error', {
            'selector': 'parameter',
            'format': ['camelCase', 'PascalCase'],
            'leadingUnderscore': 'allow',
          }
        ]
      }
    }
  ]
};
