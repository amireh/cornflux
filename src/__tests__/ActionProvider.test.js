import React, { PropTypes } from 'react';
import { render } from 'react-dom';
import { assert, createContainer, createSinonSandbox, drill, m } from './TestUtils';
import ActionProvider from '../ActionProvider';
import ActionEmitter from '../ActionEmitter';

describe('ActionProvider', function() {
  const sinonSuite = createSinonSandbox(this)

  describe('dispatching', function() {
    let EmitterType, ProviderType
    let Emitter, Provider, actions

    beforeEach(() => {
      const sinon = sinonSuite.get()

      actions = {
        speak: sinon.spy(() => Promise.resolve())
      }

      EmitterType = React.createClass({
        propTypes: {
          dispatch: PropTypes.func.isRequired,
        },

        render() {
          return <button onClick={this.emitClick} children="Click me!" />
        },

        emitClick() {
          this.props.dispatch('speak', 'a', 'b', 1, 2);
        }
      })

      Emitter = ActionEmitter(EmitterType, {
        actions: [ 'speak' ]
      })

      ProviderType = React.createClass({
        componentDidMount() {
          this.someInstanceVariable = 1;
        },

        render() {
          return (
            <Emitter />
          );
        }
      })

      Provider = ActionProvider(ProviderType, { actions })
    })

    it('invokes action handlers', function() {
      createContainer(container => {
        const instance = render(<Provider />, container);

        drill(instance).find(Emitter).find('button').click();

        assert.calledOnce(actions.speak)
      });
    });

    it('it provides me access to component by default', function() {
      createContainer(container => {
        const instance = render(<Provider foo={1} />, container);

        drill(instance).find(Emitter).find('button').click();

        assert.equal(
          actions.speak.getCall(0).args[0],
          drill(instance).find(ProviderType).component
        );
      });
    });

    it('forwards arguments to action handlers', function() {
      createContainer(container => {
        const instance = render(<Provider />, container);
        const sinon = sinonSuite.get()

        drill(instance).find(Emitter).find('button').click();

        sinon.assert.calledWith(
          actions.speak,
          sinon.match.object, // component
          'a', 'b', 1, 2
        )
      });
    })

    it('provides "dispatch" and "propagate" to action handlers', function() {
      createContainer(container => {
        const instance = render(<Provider />, container);
        const sinon = sinonSuite.get()

        drill(instance).find(Emitter).find('button').click();

        sinon.assert.calledWithExactly(
          actions.speak,
          sinon.match.any, // component
          sinon.match.any, sinon.match.any, sinon.match.any, sinon.match.any, // args
          sinon.match({
            dispatch: sinon.match.func,
            propagate: sinon.match.func
          })
        )
      })
    })

    it('rejects dispatches made after the provider is unmounted', function() {
      let instance, emitter

      createContainer(container => {
        instance = render(<Provider />, container);
        emitter = drill(instance).find(EmitterType).component
      })

      emitter.props.dispatch('speak')
      assert.notCalled(actions.speak)
    })
  })

  describe('delayed dispatching', function() {
    let EmitterType, ProviderType
    let Emitter, Provider, actions

    beforeEach(() => {
      const sinon = sinonSuite.get()

      actions = {
        speak: sinon.spy(() => Promise.resolve())
      }

      EmitterType = React.createClass({
        propTypes: {
          dispatch: PropTypes.func.isRequired,
        },

        componentWillMount() {
          this.props.dispatch('speak', 'quack!');
        },

        render() {
          return <div />
        }
      })

      Emitter = ActionEmitter(EmitterType, {
        actions: [ 'speak' ]
      })

      ProviderType = React.createClass({
        render() {
          return (
            <Emitter />
          );
        }
      })

      Provider = ActionProvider(ProviderType, { actions })
    })

    it('accepts dispatches done during "componentWillMount"', function() {
      createContainer(container => {
        render(<Provider />, container);

        assert.calledOnce(actions.speak)
      });
    });
  });

  describe('propagating', function() {
    let EmitterType, SomeComponent
    let Emitter, Provider, actions
    let TopLevelProvider, TopLevelComponent, TopLevelActions

    beforeEach(() => {
      actions = {
        speak: () => Promise.resolve(),
      }

      TopLevelActions = {
        speak: () => Promise.resolve(),
      }

      EmitterType = React.createClass({
        propTypes: {
          dispatch: PropTypes.func.isRequired,
        },

        render() {
          return <div />
        }
      })

      Emitter = ActionEmitter(EmitterType, {
        actions: [ 'speak' ]
      })

      SomeComponent = React.createClass({
        render() {
          return (
            <Emitter />
          );
        }
      })

      Provider = ActionProvider(SomeComponent, { actions })

      TopLevelComponent = React.createClass({
        render() {
          return (
            <div>{this.props.children}</div>
          );
        }
      })

      TopLevelProvider = ActionProvider(TopLevelComponent, { actions: TopLevelActions })
    })

    it('lets me propagate the action to another provider up the tree', function() {
      const sinon = sinonSuite.get()

      sinon.stub(TopLevelActions, 'speak').callsFake(() => Promise.resolve())
      sinon.stub(actions, 'speak').callsFake((_, { propagate }) => propagate())

      return createContainer(container => {
        const instance = render(<TopLevelProvider><Provider /></TopLevelProvider>, container);

        return drill(instance).find(EmitterType).component.props.dispatch('speak').then(() => {
          assert.calledOnce(actions.speak)
          assert.calledOnce(TopLevelActions.speak)
        })
      });
    });

    it('rejects a propagate made for an unsupported action', function() {
      const sinon = sinonSuite.get()

      return createContainer(container => {
        const instance = render(<Provider />, container);
        const fake = sinon.spy((_state, _payload, { propagate }) => {
          return propagate()
        })

        sinon.stub(actions, 'speak').callsFake(fake)

        return drill(instance).find(EmitterType).component.props.dispatch('speak', 'some arg').then(() => {
          throw new Error('should not have passed')
        }, err => {
          assert.called(fake)
          assert.match(err.message, 'Unknown action "speak"')
        })
      })

    })
  })

  it('can be composed', function() {
    const calls = [];
    const handleAction = (container, type, payload) => {
      calls.push([container, type, payload]);
      return Promise.resolve()
    };

    const MyEmitter = ActionEmitter(React.createClass({
      propTypes: {
        dispatch: PropTypes.func.isRequired,
      },

      render() {
        return (
          <div>
            <button onClick={this.emitSpeak} children="Speak" />
            <button onClick={this.emitSpank} children="Spank" />
          </div>
        );
      },

      emitSpeak() {
        this.props.dispatch('speak', 'quack!');
      },

      emitSpank() {
        this.props.dispatch('spank', 'wooh!');
      },
    }), { actions: [ 'speak', 'spank' ] });

    const MySpeechProvider = React.createClass({
      render() {
        return (
          <div>
            <h2>Speak and you may enter</h2>

            <div>
              {this.props.children}
            </div>
          </div>
        );
      }
    });

    const MySpankingProvider = React.createClass({
      render() {
        return (
          <div>
            <h2>Speak or thou shalt be spanked</h2>

            <div>
              {this.props.children}
            </div>
          </div>
        );
      }
    });

    const MyDecoratedSpeechProvider = ActionProvider(MySpeechProvider, {
      actions: { speak: handleAction },
    });

    const MyDecoratedSpankingProvider = ActionProvider(MySpankingProvider, {
      actions: { spank: handleAction },
    });

    const MyTree = React.createClass({
      render() {
        return (
          <div>
            <MyDecoratedSpeechProvider>
              <div>
                <MyDecoratedSpankingProvider>
                  <div>
                    <MyEmitter />
                  </div>
                </MyDecoratedSpankingProvider>
              </div>
            </MyDecoratedSpeechProvider>
          </div>
        )
      }
    });

    createContainer(container => {
      const instance = render(<MyTree />, container);

      drill(instance)
        .find(MyEmitter)
          .find('button', m.hasText('Speak'))
            .click()
      ;

      assert.equal(calls.length, 1);
      assert.equal(calls[0][1], 'quack!');

      drill(instance)
        .find(MyEmitter)
          .find('button', m.hasText('Spank'))
            .click()
      ;

      assert.equal(calls.length, 2);
      assert.equal(calls[1][1], 'wooh!');
    });
  });
});
