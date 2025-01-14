import { defineConfig } from '@playwright/test';
import { defineBddConfig } from '../../../dist';

const testDir = defineBddConfig({
  paths: ['.'],
  require: ['*.ts'],
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
