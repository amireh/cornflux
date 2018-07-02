## 2.0.0

- ActionProvider now accepts (and defaults to) an option `passDispatchProp:
  Boolean` that will provide the decorated component with `dispatch` as a prop
  like ActionEmitters would.
- Action payload can now have an arbitrary arity (up from 1)
- Action aliasing has been removed, as a result the `ActionProxy` symbol is no
  longer exported
- ActionEmitter will now throw an error if initialized with missing `actions`
  argument or one that is not an array
- ActionEmitter's warning for unknown actions is removed in the production
  build now
- No longer using React.createClass, React 15.4.1+ is now required