import React, { PropTypes } from 'react';
import Promise from 'Promise';
import ActionProxy from './ActionProxy';

const Identity = x => x;
const createActionProxy = alias => new ActionProxy(alias);

const ActionProvider = function(Component, {
  actions,
  displayName,
  reducer = Identity,
  serviceWrapper = Identity,
  verbose = false,
  passDispatchProp = true,
}) {
  const debugLog = verbose ? console.debug.bind(console) : Function.prototype;

  return React.createClass({
    displayName: displayName || `ActionProvider(${Component.displayName})`,

    contextTypes: {
      availableActions: PropTypes.arrayOf(PropTypes.string),
      dispatch: PropTypes.func,
    },

    childContextTypes: {
      availableActions: PropTypes.arrayOf(PropTypes.string),
      dispatch: PropTypes.func,
    },

    getChildContext() {
      return {
        availableActions: (this.context.availableActions || []).concat(Object.keys(actions)),
        dispatch: this.dispatchAction,
      }
    },

    componentWillMount() {
      this.actionBuffer = [];
    },

    componentDidMount() {
      this.flushQueuedActions();
    },

    componentDidUpdate() {
      this.flushQueuedActions();
    },

    componentWillUnmount() {
      // TODO: possible leak here? what about pending promises?
      this.actionBuffer = null;
    },

    render() {
      const decoratorProps = {};

      if (passDispatchProp) {
        decoratorProps.dispatch = this.dispatchAction;
      }

      return <Component ref="container" {...decoratorProps} {...this.props} />
    },

    dispatchAction(type, payload) {
      // Not an action we provide? Propagate
      if (!actions.hasOwnProperty(type)) {
        return this.propagateAction(type, payload);
      }
      // An alias? resolve it and re-dispatch
      else if (actions[type] instanceof ActionProxy) {
        return this.dispatchAction(actions[type].type, payload);
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

        debugLog(`Dispatching action "${type}":`, payload);

        // TODO: validate payload

        return serviceWrapper(
          actionHandler(state, payload, {
            propagate: this.propagateAction.bind(null, type, payload),
            dispatch: this.dispatchAction,
          })
        );
      }
    },

    dispatchActionWhenReady(type, payload) {
      debugLog(`Deferring action "${type}" until container is ready...`);

      return new Promise((resolve, reject) => {
        if (!this.isMounted()) {
          reject();
        }
        else {
          this.actionBuffer.push({ type, payload, promise: { resolve, reject } });
        }
      });
    },

    propagateAction(type, payload) {
      if (this.context.dispatch) {
        return this.context.dispatch(type, payload);
      }
      else {
        return Promise.reject(new Error(`Unknown action "${type}"`));
      }
    },

    flushQueuedActions() {
      this.actionBuffer.splice(0).forEach(({ type, payload, promise }) => {
        debugLog(`Dispatching deferred action "${type}".`);

        this.dispatchAction(type, payload).then(promise.resolve, promise.reject);
      });
    }
  })
}

ActionProvider.ActionProxy = createActionProxy;

export default ActionProvider;
export { createActionProxy as ActionProxy };
