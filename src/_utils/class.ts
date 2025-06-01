const objectPrototype = Object.getPrototypeOf({});

/**
 * Retrieve all methods owned by the given class. Does not retrieve methods
 * owned by ancestral classes. Subclass-only.
 */
export function getOwnMethodNames(cls) {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(cls))
    .filter(method => (method !== 'constructor' && typeof cls[method] === 'function'));
}

/**
 * Retrieve all methods owned by the given class. Retrieves methods owned by
 * ancestral classes. Full hierarchy. Prioritises overriding methods, ignoring
 * overridden methods.
 */
export function getAllMethodNames(cls): string[] {
  let methods: string[] = [];
  let obj = cls;
  while (obj = Object.getPrototypeOf(obj)) { // eslint-disable-line no-cond-assign
    if (obj === objectPrototype) {
      break;
    }
    methods = methods.concat(Object.getOwnPropertyNames(obj)
      .filter((method) => (method !== 'constructor' && typeof cls[method] === 'function')));
  }
  return [...new Set(methods)];
}

/**
 * Utility for binding all class methods to the class scope so that the methods
 * may be passed around as function variables without the need for explicit
 * binding at time of use.
 */
export function bindMethods(cls) {
  return getAllMethodNames(cls).forEach((method) => {
    const meth = cls[method];
    if (!meth) {
      return;
    }
    const { name } = cls[method];
    cls[method] = cls[method].bind(cls); // eslint-disable-line no-param-reassign
    Object.defineProperty(cls[method], 'name', { value: `Bound ${name}` });
  });
}
