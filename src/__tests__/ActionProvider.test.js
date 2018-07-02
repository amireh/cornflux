import React, { PropTypes } from 'react';
import { render } from 'react-dom';
import { assert, createContainer, createSinonSandbox, drill, m } from '../TestUtils';
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
        speak: sinon.stub()
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

    it('it provides me access to the decorated component', function() {
      createContainer(container => {
        const instance = render(<Provider />, container);

        drill(instance).find(Emitter).find('button').click();

        assert.equal(actions.speak.getCall(0).args[0].someInstanceVariable, 1);
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
  })

  it('can be composed', function() {
    const calls = [];
    const handleAction = (container, type, payload) => {
      calls.push([container, type, payload]);
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
