import { Fixture, Given } from 'playwright-bdd/decorators.js';
import { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  @Given('TodoPage: step')
  async step() {}
}
