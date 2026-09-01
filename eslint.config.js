import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config({ ignores: ['node_modules/**', '.wrangler/**', 'web/**', 'app/**', 'scripts/**', 'eslint.config.js', 'worker-configuration.d.ts'] }, eslint.configs.recommended, ...tseslint.configs.recommendedTypeChecked, {
  files: ['worker/**/*.ts', 'test/**/*.ts'],
  languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
  rules: { '@typescript-eslint/no-explicit-any': 'error', '@typescript-eslint/no-floating-promises': 'error' }
});
