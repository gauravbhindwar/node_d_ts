import { Model, Sequelize } from 'sequelize';
import { BASE_DIR } from '../settings';

// First, patch the model methods. These are the methods that we call in our
// code, and it's these methods that we want to know the source file+line of
// the call for. When we patch them, we make sure that we generate a query
// comment with the file+line where the method was called. This is not done
// inside the patch function because we want this to run only once. The effect
// is global, whereas the effect of the patching in the patch function is
// specific to the given sequelize instance.
[
  {
    name: 'findAll',
    optionsArgument: 0,
  },
  {
    name: 'findByPk',
    optionsArgument: 1,
  },
  {
    name: 'findOne',
    optionsArgument: 0,
  },
  {
    name: 'findOrCreate',
    optionsArgument: 0,
  },
].forEach(({ name, optionsArgument }) => {
  const old = Model[name];
  Model[name] = function (...args) { // eslint-disable-line func-names
    const options = args[optionsArgument] || {};
    if (!options.comment) {
      const err = new Error();
      const { stack } = err;
      options.comment = stack.split('\n')[2].replace(/(^.*\(|\).*$)/g, '').replace(BASE_DIR, '');
    }
    return old.apply(this, args);
  };
  Object.defineProperty(Model[name], 'name', {
    value: name,
    writable: false,
  });
});

export default function patchSequelizeForComments(sequelize: Sequelize) {
  // Finally, patch the query generator methods. These methods generate SQL
  // query strings, and it's these strings that we want to prefix the file+line
  // comments to.
  const { queryGenerator } = sequelize.getQueryInterface() as any;
  [
    {
      name: 'selectQuery',
      optionsArgument: 1,
    },
    {
      name: 'insertQuery',
      optionsArgument: 3,
    },
    {
      name: 'updateQuery',
      optionsArgument: 3,
    },
    {
      name: 'deleteQuery',
      optionsArgument: 2,
    },
    {
      name: 'bulkInsertQuery',
      optionsArgument: 2,
    },
    {
      name: 'bulkCreate',
      optionsArgument: 1,
    },
  ].forEach((method) => {
    const originalGeneratorMethod = queryGenerator[method.name];

    queryGenerator[method.name] = function proxyMethod(...args) {
      const options = args[method.optionsArgument];
      const baseFragment = originalGeneratorMethod.apply(this, args);

      if (!options.comment) {
        return baseFragment;
      }

      // Raw string queries
      if (typeof baseFragment === 'string') {
        return [
          '/* ',
          options.comment,
          ' */',
          ' ',
          baseFragment,
        ].join('');
      }

      // Sometimes Sequelize passes us an object (e.g. findOrCreate queries)
      // which contain a `query` attribute which is a raw query string.
      if (typeof baseFragment === 'object' && baseFragment.query) {
        baseFragment.query = [
          '/* ',
          options.comment,
          ' */',
          ' ',
          baseFragment.query,
        ].join('');
      }

      return baseFragment;
    };
  });
  return sequelize;
}
