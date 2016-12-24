import React, { PropTypes } from 'react';
import warning from 'warning';

const ActionEmitter = (Component, { actions, propName = 'dispatch' }) => React.createClass({
  displayName: `ActionEmitter(${Component.displayName})`,

  contextTypes: {
    availableActions: PropTypes.arrayOf(PropTypes.string),
    dispatch: PropTypes.func.isRequired,
  },

  componentWillMount() {
    const availableActions = this.context.availableActions || [];
    const unknownActions = actions.filter(action => {
      return availableActions.indexOf(action) === -1;
    });

    warning(unknownActions.length === 0,
      `The component "${Component.displayName}" may emit actions that are not ` +
      `known to be supported by any provider.\n` +
      `These actions are:\n${stringifyList(unknownActions, "  ")}.`
    );
  },

  render() {
    const dispatchingProps = {};

    dispatchingProps[propName] = this.dispatch;

    return <Component {...this.props} {...dispatchingProps} />
  },

  dispatch(type, payload) {
    return this.context.dispatch(type, payload);
  }
});

function stringifyList(list, indent = "") {
  return list.map(x => `${indent}- ${x}`).join('\n')
}

export default ActionEmitter;
