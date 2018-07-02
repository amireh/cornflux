import ReactDOM from 'react-dom';
export { createSandbox } from 'sinon';
export { drill, m } from 'react-drill';
export { assert } from 'chai';

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