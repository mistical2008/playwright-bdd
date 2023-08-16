import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../../dist';

const testDir = defineBddConfig({
  paths: ['./features', '../root.feature', '../subdir'],
  require: ['steps.ts', '../steps.ts', '../subdir/*.ts'],
  outputDir: '../.features-gen',
  featuresRoot: '..',
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
