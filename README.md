# cornflux (beta)

A library for dispatching events in a React application using the react [context](https://facebook.github.io/react/docs/context.html) as a data bus.

## Motivation

The TL;DR version: data isolation. Protect your application data and state 
storage in components that can only be interfaced with via _actions_.

The longer version can be found in [this post on medium](https://medium.com/@amireh/on-privacy-with-react-context-aa77ffd08509#.qz4awmpol)
if you have the patience.

## Installation

```shell
# make sure you have the dependencies first:
npm install --save react react-dom react-schema
npm install --save cornflux
```

## Usage

There are two conceptual types provided by the library; action providers and
action emitters.

Action providers are components that perform actions, while action emitters
are ones that request an action be performed.

### Handling actions

Construct an "acting" version of the component that should be performing 
side-effects with the `ActionProvider` decorator and define the action 
handlers:

```javascript
import { ActionProvider } from 'cornflux';
import DataConsumer from './DataConsumer';

const DataProvider = React.createClass({
  getInitialState() {
    return { count: 0 };
  },

  render() {
    return <DataConsumer count={this.state.count}
  }
});

const ActingDataProvider = ActionProvider(DataProvider, {
  actions: [
    ADJUST_COUNT(component, payload) {
      component.setState({ count: payload.count });
    }
  ]
});

export default MyActingComponent;
```

### Triggering actions

Construct an "emitting" version of the component that needs to request an 
action be performed with the `ActionEmitter` decorator. You must explicitly 
specify the list of action names that it will trigger.

```javascript
import { ActionEmitter } from 'cornflux';

const DataConsumer = React.createClass({
  render() {
    return React.createElement('button', {
      onClick: this.incrementCounter
    });
  },

  incrementCounter() {
    this.props.dispatch('ADJUST_COUNT', { count: this.props.count + 1 });
  }
});

const EmittingDataConsumer = ActionEmitter(DataConsumer, {
  actions: [
    'ADJUST_COUNT'
  ]
});

export default EmittingDataConsumer;
```

That's really it. What you use for _storing_ and _manipulating_ data is of no
relevance to cornflux. You can use Redux, Ember, Backbone, or whatever you 
want.

## API Reference

### ActionProvider: `(Component, options: Object) -> Component`

The options are as follows:

#### !actions: `Object.<{ String, Function }>`

The actions that are provided by the component. The keys are the action 
identifiers (and that's what emitters will be using to request it) and the
values are the actual handlers.

The handler signature is as such:

```javascript
(
  state: Object,
  payload: Object,
  Object.<{
    dispatch: (String, Object) -> Any,
    propagate: () -> Any
  }>
) -> Any
```

The first argument, `state`, is either the reduced state of the container
if a `reducer` was defined, otherwise it's the component instance itself.

The `payload` argument is the action payload that was provided when the action
was emitted.

The third argument is an object containing two functions:

- `dispatch` which lets your handler dispatch other events. The signature is
  is similar to emitter's `dispatch`.
- `propagate` is a callback for yielding (or "bubbling") the action to a 
  provider higher in the chain. Note that it accepts NO parameters, the action
  is yielded as-is.

#### ?displayName: `String`

A custom display name for the decorated component.

Defaults to: `ActionProvider($ORIGINAL_COMPONENT_DISPLAY_NAME)`

#### ?reducer: `(component) -> Object`

A funcion for "reducing" the component instance into some state that the action
handlers need.

This option gives you a greater degree of what the action handlers may end up
touching, if you're really paranoid.

Defaults to: `(x) -> x`. The identity function where the component instance 
itself is passed through.

#### ?serviceWrapper: `(Any) -> Any`

Compatibility option for applications that use promises or relied on earlier
dispatchers always generating promises (or something alike.)

The function will receive the return value of the action handler and can
augment it in any way it sees fit.

Defaults to: `(x) -> x`

#### ?verbose: `Boolean`

Turn this on if you want diagnostic messages be output to the console for 
debugging.

Defaults to: `false`

### ActionEmitter: `(Component, options: Object) -> Component`

#### !actions: `Array.<String>`

The list of actions that the component is expected to emit. At run-time, the
actions you list will be verified to be provided by some `ActionProvider` up
the tree, otherwise a warning will be logged.

#### ?propName: `String`

The name of the prop that will be passed down to the decorated component to
use for dispatching actions.

Defaults to: `dispatch`

## License

The MIT license.