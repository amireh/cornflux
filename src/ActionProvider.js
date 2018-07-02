import React, { PropTypes } from 'react';

const Identity = x => x;

const ActionProvider = function(Component, {
  actions,
  displayName,
  reducer = Identity,
  serviceWrapper = Identity,
  passDispatchProp = true,
}) {
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

      this.actionBuffer = [];
      this.bindings = {
        dispatchAction: this.dispatchAction.bind(this)
      };
    }

    componentDidMount() {
      this.flushQueuedActions();
    }

    componentDidUpdate() {
      this.flushQueuedActions();
    }

    componentWillUnmount() {
      // TODO: possible leak here? what about pending promises?
      this.actionBuffer = null;
    }

    render() {
      const decoratorProps = {};

      if (passDispatchProp) {
        decoratorProps.dispatch = this.bindings.dispatchAction;
      }

      return <Component ref="container" {...decoratorProps} {...this.props} />
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
      else if (!this.refs.container) {
        return this.dispatchActionWhenReady(type, payload);
      }
      else {
        const actionHandler = actions[type];
        const state = reducer(this.refs.container);

        // TODO: validate payload

        return serviceWrapper(
          actionHandler(state, ...payload, {
            propagate: this.propagateAction.bind(this, type, ...payload),
            dispatch: this.bindings.dispatchAction,
          })
        );
      }
    }

    dispatchActionWhenReady(type, payload) {
      return new Promise((resolve, reject) => {
        if (!this.isMounted()) {
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

  WithActions.displayName = displayName || `ActionProvider(${Component.displayName})`;
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
