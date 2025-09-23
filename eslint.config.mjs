import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    unocss: true,
    stylistic: true,
    // TypeScript and Vue are auto-detected, you can also explicitly enable them:
    typescript: true,
    vue: {
      overrides: {
        'vue/operator-linebreak': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/no-v-model-argument': 'off',
        'vue/require-default-prop': 'off',
        'vue/require-prop-types': 'off',
        'vue/html-self-closing': 'off',
        'vue/quote-props': 'off',
        'vue/no-irregular-whitespace': 'off',
        'vue/prop-name-casing': 'off',
        'vue/html-indent': 'off',
        'vue/no-reserved-component-names': 'off',
      },
    },
  }),
  {
    rules: {
      // 禁用 "禁止使用箭头函数作为顶层函数" 的规则
      'antfu/top-level-function': 'off',
      'no-useless-return': 'off',
      'no-console': 'off',
      'no-alert': 'off',
      'unused-imports/no-unused-vars': 'off',
      'antfu/if-newline': 'off',
      'jsdoc/require-returns-description': 'off',
      'regexp/no-unused-capturing-group': 'off',
      'regexp/no-dupe-disjunctions': 'off',
      'object-curly-newline': ['error', { multiline: true, consistent: true }],
      'array-bracket-newline': ['error', 'consistent'],
      'comma-dangle': ['error', 'always-multiline'],
      'ts/no-unsafe-function-type': 'off',
      'node/prefer-global/process': 'off',
      'ts/no-use-before-define': 'off',
      'vue/no-side-effects-in-computed-properties': 'off',
    },
    ignores: ['**/*.d.ts'],
  },
)
