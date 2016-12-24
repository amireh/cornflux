import { assert } from 'chai';
import React, { PropTypes } from 'react';
import { render } from 'react-dom';
import { createContainer } from '../TestUtils';
import { drill, m } from 'react-drill';
import ActionProvider from '../ActionProvider';
import ActionEmitter from '../ActionEmitter';

describe('cornflux', function() {
  it('works', function() {
    const MyEmitter = ActionEmitter(React.createClass({
      propTypes: {
        dispatch: PropTypes.func.isRequired,
      },

      render() {
        return <button onClick={this.emitClick} children="Click me!" />
      },

      emitClick() {
        this.props.dispatch('speak', 'quack!');
      }
    }), { actions: [ 'speak' ] })

    const MyType = React.createClass({
      componentDidMount() {
        this.someInstanceVariable = 1;
      },

      render() {
        return (
          <div>
            <span>{this.props.name}</span>

            <MyEmitter />
          </div>
        );
      }
    });

    const calls = [];

    const handleAction = (container, type, payload) => {
      calls.push([container, type, payload]);
    }

    const MyActionProviderType = ActionProvider(MyType, {
      actions: { speak: handleAction },
    });

    createContainer(container => {
      const instance = render(<MyActionProviderType name="Booboo!" />,
        container
      );

      drill(instance).find('span', m.hasText('Booboo!'));

      drill(instance).find(MyEmitter).find('button').click();

      assert.equal(calls.length, 1);
      assert.equal(calls[0][0].someInstanceVariable, 1,
        "it provides me access to the decorated component"
      );

    });
  });

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
