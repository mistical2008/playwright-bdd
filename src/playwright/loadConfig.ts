/**
 * Loading Playwright config.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/configLoader.ts
 */
import path from 'node:path';
import fs from 'node:fs';
import { requirePlaywrightModule } from './utils';
import { requireTransform } from './transform';
import { exitWithMessage } from '../utils';

export async function loadConfig(cliConfigPath?: string) {
  const resolvedConfigFile = resolveConfigFile(cliConfigPath);
  assertConfigFileExists(resolvedConfigFile, cliConfigPath);
  await requireTransform().requireOrImport(resolvedConfigFile);
}

export function resolveConfigFile(cliConfigPath?: string): string | null {
  const { resolveConfigFile } = requirePlaywrightModule('lib/common/configLoader.js');
  const configFileOrDirectory = getConfigFilePath(cliConfigPath);
  return resolveConfigFile(configFileOrDirectory);
}

function getConfigFilePath(cliConfigPath?: string) {
  return cliConfigPath ? path.resolve(process.cwd(), cliConfigPath) : process.cwd();
}

function assertConfigFileExists(resolvedConfigFile: string | null, cliConfigPath?: string) {
  if (!resolvedConfigFile || !fs.existsSync(resolvedConfigFile)) {
    const configFilePath = getConfigFilePath(cliConfigPath);
    exitWithMessage(`Can't find Playwright config file in: ${configFilePath}`);
  }
}
