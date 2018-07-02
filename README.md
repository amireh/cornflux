# cornflux

A library for dispatching events in a React application using the react [context](https://facebook.github.io/react/docs/context.html) as a data bus.

The goal of this library is to achieve a layer of _data isolation_ where
application state is confined to "data components" that can only be interfaced
with by other components via action functions.

The longer version can be found in [this post on
medium](https://medium.com/@amireh/on-privacy-with-react-context-aa77ffd08509#.qz4awmpol)
if you have the patience.

## Installation

```shell
# make sure you have the dependencies first:
npm install --save react react-dom
npm install --save cornflux
```

The source code is not transpiled; you will need a transpiler like
[Babel.js](http://babeljs.io) to consume it. However, a built-version is
provided under `dist/` but it expects `React` and `ReactDOM` to be available on
`window`.

## Usage

There are two conceptual types provided by the library; action providers and
action emitters.

Action providers are components that perform actions, while action emitters
are ones that request an action be performed.

### Handling actions

Use the `ActionProvider` decorator to construct a version of the component that
is able to receive action requests and carry them out.

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

Use the `ActionEmitter` decorator to construct a version of a component that
needs to dispatch action requests. You must explicitly specify which actions
the component is allowed to dispatch.

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
  payload: ...Any,
  delegate: {
    dispatch: (String, Object) -> Any,
    propagate: () -> Any
  }
) -> Promise
```

The first argument, `state`, is either the reduced state of the container if
`reduce` was defined, otherwise it's the component instance itself.

The `payload` argument is the action payload that was provided when the action
was emitted. It is "spread out" to as many arguments the dispatch call was
provided by an emitter (vararg).

The last argument is an object containing two functions:

- `dispatch` to dispatch other events to the same provider. The signature is is
  similar to emitter's `dispatch`.
- `propagate` to yield (or "bubble") the action to a provider higher in the
  tree. Note that it accepts NO parameters; the action is yielded as-is.

#### ?reduce: `(component) -> Object`

Given the rendered component instance, generate the state to pass to action
handlers.

Defaults to: the identity function where the component instance itself is
passed through (which exposes `props`, `state`, `setState`, etc.)

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