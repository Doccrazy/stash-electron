import * as sinon from 'sinon';

export function withStubbed<T>(module: string, body: (stubbedModule: { [expKey: string]: sinon.SinonStub }) => T): T {
  const moduleExports = require(`../mocks/${module}`);
  for (const expKey of Object.keys(moduleExports)) {
    moduleExports[expKey].reset();
  }

  return body(moduleExports);
}
