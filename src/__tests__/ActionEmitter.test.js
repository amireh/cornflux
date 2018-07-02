import React from 'react';
import { render } from 'react-dom';
import { assert, createContainer, createSandbox, drill } from './TestUtils';
import ActionProvider from '../ActionProvider';
import ActionEmitter from '../ActionEmitter';

describe('ActionEmitter', function() {
  let sinon

  beforeEach(() => {
    sinon = createSandbox()
  })

  afterEach(() => {
    sinon.restore()
    sinon = null
  })

  it('fails if no actions were provided', function() {
    assert.throws(() => {
      ActionEmitter(React.createClass({ render: () => null }), { actions: null })
    }, /Missing required argument "actions" by ActionEmitter for component/)
  });

  it('warns if there are unknown actions at that point in three', function() {
    const Emitter = ActionEmitter(React.createClass({
      displayName: 'MyEmitter',
      render() {
        return <div />
      }
    }), { actions: [ 'speak' ] })

    const Provider = ActionProvider(React.createClass({
      render() {
        return (
          <Emitter />
        );
      }
    }), {
      actions: {},
    });

    sinon.stub(console, 'error')

    createContainer(container => {
      render(<Provider />, container);

      sinon.assert.calledWith(console.error,
        sinon.match(
          "The component \"MyEmitter\" may emit actions that are not known to " +
          "be supported by any provider:\n" +
          "  - speak"
        )
      )
    });
  });

  it('passes the dispatch function', function() {
    const EmitterType = React.createClass({
      displayName: 'MyEmitter',
      render() {
        return <div />
      }
    })

    const Emitter = ActionEmitter(EmitterType, { actions: [] })
    const Provider = ActionProvider(React.createClass({
      render() {
        return (
          <Emitter />
        );
      }
    }), {
      actions: {},
    });

    createContainer(container => {
      const instance = render(<Provider />, container);

      assert.equal(
        typeof drill(instance).find(EmitterType).component.props.dispatch,
        'function'
      )

      assert.equal(
        drill(instance).find(EmitterType).component.props.dispatch,
        drill(instance).find(Emitter).component.context.dispatch
      )
    });
  });
})
