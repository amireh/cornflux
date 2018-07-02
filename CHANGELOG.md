## 1.1.0

- ActionProvider now accepts (and defaults to) an option `passDispatchProp:
  Boolean` that will provide the decorated component with `dispatch` as a prop
  like ActionEmitters would.
- ActionEmitter will now throw an error if initialized with missing `actions`
  argument or one that is not an array
- ActionEmitter's warning for unknown actions is removed in the production
  build now

