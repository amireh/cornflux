import React, { PropTypes } from 'react';
import warning from 'warning';
import invariant from 'invariant';
import createReactClass from 'create-react-class';

const ActionEmitter = (Component, { actions, propName = 'dispatch' }) => {
  invariant(Array.isArray(actions),
    `Missing required argument "actions" by ActionEmitter for component "${Component.displayName}}".`
  )

  return createReactClass({
    displayName: `ActionEmitter(${Component.displayName})`,

    contextTypes: {
      availableActions: PropTypes.arrayOf(PropTypes.string).isRequired,
      dispatch: PropTypes.func.isRequired,
    },

    componentWillMount() {
      if (process.env.NODE_ENV !== 'production') {
        const availableActions = this.context.availableActions;
        const unknownActions = actions.filter(action => {
          return availableActions.indexOf(action) === -1;
        });

        warning(unknownActions.length === 0,
          `The component "${Component.displayName}" may emit actions that are not ` +
          `known to be supported by any provider:\n` +
          stringifyList(unknownActions, "  ")
        );
      }
    },

    render() {
      return <Component {...this.props} {...{ [propName]: this.context.dispatch }} />
    }
  })
}

function stringifyList(list, indent = "") {
  return list.map(x => `${indent}- ${x}`).join('\n')
}

export default ActionEmitter;
