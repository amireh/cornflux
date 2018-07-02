## 2.0.0

- ActionProvider now provides the decorated component with `dispatch` as a prop
  like ActionEmitters would
- **BREAKING** ActionProvider now requires every action handler to yield a
  Promise value. As a result, the option `serviceWrapper` has been removed.
- **BREAKING** ActionProvider option `reducer` has been renamed to `reduce`
- **BREAKING** ActionProvider option `verbose` has been removed
- **BREAKING** Action payload can now have an arbitrary arity (up from 1)
- **BREAKING** Action aliasing has been removed, as a result the `ActionProxy`
  symbol is no longer exported
- ActionEmitter will now throw an error if initialized with missing `actions`
  argument or one that is not an array
- ActionEmitter's warning for unknown actions is removed in the production
  build now
- No longer using React.createClass, React 15.4.1+ is now required