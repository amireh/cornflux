import React, { PropTypes } from 'react';
import warning from 'warning';
import invariant from 'invariant';

const ActionEmitter = (Component, { actions, propName = 'dispatch' }) => {
  invariant(Array.isArray(actions),
    `Missing required argument "actions" by ActionEmitter for component "${Component.displayName}}".`
  )

  class WithActions extends React.Component {
    componentWillMount() {
      // istanbul ignore else
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
    }

    render() {
      return (
        <Component
          {...this.props}
          {...{ [propName]: this.context.dispatch }}
        />
      )
    }
  };

  WithActions.displayName = `ActionEmitter(${Component.displayName})`;
  WithActions.contextTypes = {
    availableActions: PropTypes.arrayOf(PropTypes.string).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  return WithActions;
}

function stringifyList(list, indent = "") {
  return list.map(x => `${indent}- ${x}`).join('\n')
}

export default ActionEmitter;
