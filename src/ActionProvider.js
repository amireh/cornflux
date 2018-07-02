import React, { PropTypes } from 'react';
import invariant from 'invariant';

const Identity = x => x;
const ActionProvider = function(Component, { actions, reduce = Identity }) {
  const actionNames = Object.keys(actions);
  class WithActions extends React.Component {
    getChildContext() {
      return {
        availableActions: (this.context.availableActions || []).concat(actionNames),
        dispatch: this.bindings.dispatchAction,
      }
    }

    constructor() {
      super()

      this.unmounted = false;
      this.actionBuffer = [];
      this.bindings = {
        dispatchAction: this.dispatchAction.bind(this)
      };
    }

    componentDidMount() {
      this.flushQueuedActions();
    }

    componentWillUnmount() {
      this.bindings = null;
      this.unmounted = true;
      // TODO: possible leak here? what about pending promises?
      this.actionBuffer = null;
    }

    render() {
      return (
        <Component
          ref="component"
          dispatch={this.bindings.dispatchAction}
          {...this.props}
        />
      )
    }

    dispatchAction(type, ...payload) {
      // Not an action we provide? Propagate
      if (!actions.hasOwnProperty(type)) {
        return this.propagateAction(type, ...payload);
      }
      // Not ready yet? Queue it until we are. This happens if a child emitter
      // dispatches an action during the componentWillMount or componentDidMount
      // hook since *theirs* runs before *ours* so our container will not be
      // ready at that point yet.
      else if (!this.refs.component) {
        return this.dispatchActionWhenReady(type, payload);
      }
      else {
        const actionHandler = actions[type];
        const state = reduce(this.refs.component);

        // TODO: validate payload

        const returnValue = actionHandler(state, ...payload, {
          propagate: this.propagateAction.bind(this, type, ...payload),
          dispatch: this.bindings.dispatchAction,
        })

        invariant(returnValue && typeof returnValue.then === 'function',
          `Handler for action "${type}" yielded a non-Promise value`
        )

        return returnValue;
      }
    }

    dispatchActionWhenReady(type, payload) {
      return new Promise((resolve, reject) => {
        // possible race condition; child component dispatches an action while
        // the provider is being unmounted
        if (this.unmounted) {
          reject();
        }
        else {
          this.actionBuffer.push({ type, payload, promise: { resolve, reject } });
        }
      });
    }

    propagateAction(type, ...payload) {
      if (this.context.dispatch) {
        return this.context.dispatch(type, ...payload);
      }
      else {
        return Promise.reject(new Error(`Unknown action "${type}"`));
      }
    }

    flushQueuedActions() {
      this.actionBuffer.splice(0).forEach(({ type, payload, promise }) => {
        this.dispatchAction(type, ...payload).then(promise.resolve, promise.reject);
      });
    }
  };

  WithActions.displayName = `ActionProvider(${Component.displayName})`;
  WithActions.contextTypes = {
    availableActions: PropTypes.arrayOf(PropTypes.string),
    dispatch: PropTypes.func,
  };
  WithActions.childContextTypes = {
    availableActions: PropTypes.arrayOf(PropTypes.string),
    dispatch: PropTypes.func,
  };

  return WithActions;
}

export default ActionProvider;
