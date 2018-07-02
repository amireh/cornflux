import ReactDOM from 'react-dom';
import sinon, { createSandbox } from 'sinon';
import { assert } from 'chai';

sinon.assert.expose(assert, { prefix: "" })

export { drill, m } from 'react-drill';
export { createSandbox };
export { assert };

export function createSinonSandbox(mochaSuite) {
  let sandbox

  mochaSuite.beforeEach(() => {
    sandbox = createSandbox()
  })

  mochaSuite.afterEach(() => {
    sandbox.restore()
    sandbox = null
  })

  return { get: () => sandbox }
}

export function createContainer(fn, options = { attachToDOM: false }) {
  const container = document.createElement('div');
  const cleanup = () => {
    ReactDOM.unmountComponentAtNode(container);

    container.remove();
  };

  if (options && options.attachToDOM) {
    document.body.appendChild(container);
  }

  if (fn.length === 2) {
    fn(container, cleanup);
  }
  else {
    let raisedError;

    try {
      fn(container);
    }
    catch (e) {
      raisedError = e;
    }
    finally {
      cleanup();

      if (raisedError) {
        throw raisedError;
      }
    }
  }
}