import { execSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import fs from 'node:fs';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';
import { expect } from '@playwright/test';

defineTestOnly(test);
export { test };

/**
 * Test name = test dir from 'test/<xxx>/test.mjs'
 */
export function getTestName(importMeta) {
  return importMeta.url.split('/').slice(-2)[0];
}

export const DEFAULT_CMD = 'node ../../dist/cli && npx playwright test';

function execPlaywrightTestInternal(dir, cmd) {
  dir = path.join('test', dir);
  cmd = cmd || DEFAULT_CMD;
  const stdout = execSync(cmd, { cwd: dir, stdio: 'pipe' });
  return stdout?.toString() || '';
}

export function execPlaywrightTest(dir, cmd) {
  try {
    const stdout = execPlaywrightTestInternal(dir, cmd);
    if (process.env.TEST_DEBUG) console.log('STDOUT:', stdout);
    return stdout;
  } catch (e) {
    // if playwright tests not passed -> output is in stdout
    // if playwright cmd exits -> output is in stderr
    // if test.mjs not passed -> output is in stderr
    // That's why always print stdout + stderr
    console.log(e.message);
    console.log(e.stdout?.toString());
    console.log(e.stderr?.toString());
    process.exit(1);
  }
}

export function execPlaywrightTestWithError(dir, error, cmd) {
  assert.throws(
    () => execPlaywrightTestInternal(dir, cmd),
    (e) => {
      const stderr = e.stderr.toString();
      const errors = Array.isArray(error) ? error : [error];
      errors.forEach((error) => {
        if (typeof error === 'string') {
          expect(stderr).toContain(error);
        } else {
          expect(stderr).toMatch(error);
        }
      });
      return true;
    },
  );
}

export function defineTestOnly(test) {
  test.only = (title, fn) => {
    if (process.env.FORBID_ONLY) throw new Error(`test.only is forbidden`);
    test(title, { only: true }, fn);
  };
}

export class TestDir {
  constructor(importMeta) {
    this.importMeta = importMeta;
  }

  /**
   * Test name = test dir from 'test/<xxx>/test.mjs'
   */
  get name() {
    return this.importMeta.url.split('/').slice(-2)[0];
  }

  getAbsPath(relativePath) {
    return new URL(relativePath, this.importMeta.url);
  }

  clearDir(relativePath) {
    const absPath = this.getAbsPath(relativePath);
    if (fs.existsSync(absPath)) fs.rmSync(absPath, { recursive: true });
  }

  isFileExists(relativePath) {
    const absPath = this.getAbsPath(relativePath);
    return fs.existsSync(absPath);
  }

  getFileContents(relativePath) {
    const absPath = this.getAbsPath(relativePath);
    return fs.readFileSync(absPath, 'utf8');
  }

  getAllFiles(relativePath) {
    const absPath = fileURLToPath(this.getAbsPath(relativePath));
    return fg.sync(path.join(absPath, '**')).map((file) => path.relative(absPath, file));
  }
}

export function getAbsPath(relativePath, importMeta) {
  return new URL(relativePath, importMeta.url);
}

export function clearDir(relativePath, importMeta) {
  const absPath = getAbsPath(relativePath, importMeta.url);
  if (fs.existsSync(absPath)) fs.rmSync(absPath, { recursive: true });
}

export function expectFileExists(importMeta, relPath) {
  const absPath = new URL(relPath, importMeta.url);
  assert(fs.existsSync(absPath), `Missing file: ${relPath}`);
}

export function expectFileNotExists(importMeta, relPath) {
  const absPath = new URL(relPath, importMeta.url);
  assert(!fs.existsSync(absPath), `Expect file to not exist: ${relPath}`);
}
