import { Op } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';

export const allowedConditions = [
  'gt',
  'gte',
  'lt',
  'lte',
  'ne',
  'eq',
  'like',
  'notLike',
  'startsWith',
  'endsWith',
  'contains',
  'iLike',
  'notILike',
  'regexp',
  'notRegexp',
  'iRegexp',
  'notIRegexp',
];
export const allowedConditionsArray = ['between', 'notBetween', 'in', 'notIn'];
export const conditionsParams = ['or', 'and'];

export interface WhereArgs<M extends Model> {
  readonly request: Record<string, any>;
  readonly model: ModelCtor<M>;
}

export default class WhereParser<M extends Model> {
  readonly request: Record<string, any>;
  readonly model: ModelCtor<M>;
  constructor(data: WhereArgs<M>) {
    this.request = data.request;
    this.model = data.model;
  }

  // getQuery Method
  readonly getQuery = () => {
    return this._getQuery(this.request);
  };

  private readonly _getQuery = (filterObj: Record<string, any>, query: Record<string | symbol, any> = {}) => {
    Object.keys(filterObj || {}).forEach((key) => {
      const fieldValue = filterObj[key];
      const fieldKey = this.getFieldKey(key);

      // 1. check and/or query.
      if (conditionsParams.includes(fieldKey)) {
        Object.assign(query, { [Op[fieldKey]]: this._getConditionalQuery(fieldValue) });
        // 2. check operator query.( Like, iLike, between, etc. )
      } else if (allowedConditions.includes(key) || allowedConditionsArray.includes(key)) {
        Object.assign(query, { [Op[key]]: this._getValue(key, fieldValue) });
        // 3. check normal eq query.
      } else if (typeof fieldValue !== 'object' || key === 'eq') {
        Object.assign(query, { [Op[key] || fieldKey]: this._getValue(key, fieldValue) });
        // 4. check for nested query.(mostly for and/or).
      } else if (typeof fieldValue === 'object') {
        Object.assign(query, { [fieldKey]: this._getQuery(fieldValue) });
      }
    });

    return query;
  };

  private readonly getTypedValues = (type: string, value: string) => {
    if (type === 'n') {
      return (value || '').split(',').map((val) => +val);
    } else {
      return (type || '').split(',');
    }
  };

  // gives value
  private readonly _getValue = (key: string, value: string) => {
    if (allowedConditionsArray.includes(key) && typeof value === 'string') {
      const [type, values] = value.split('|');
      const condValues = value === '' ? [null] : this.getTypedValues(type, values);
      return condValues;
    } else if (value === '') {
      return null;
    } else if (typeof value === 'string') {
      return this.checkedValue(value);
    }

    return value;
  };

  private readonly checkedValue = (value: string) => {
    const splitValue = value.split('|');
    if (splitValue?.length > 1) {
      return this.convertValue(splitValue[0], splitValue[1]);
    } else {
      return value;
    }
  };

  private readonly convertValue = (key, value) => {
    switch (key) {
      case 'n':
        return parseInt(value);
      case 'f':
        return parseFloat(value);
      case 'b':
        return value === 'true';
      default:
        return value;
    }
  };

  readonly getFieldKey = (key: string) => {
    let result = key;
    if (key.indexOf('.') !== -1) {
      result = `$${key}$`;
    }

    return result;
  };

  // check conditional Data.
  private readonly _getConditionalQuery = (value: Object) => {
    let arrFilter = [];
    if (Array.isArray(value)) {
      arrFilter = arrFilter.concat(value.map((_v) => this._getQuery(_v)));
    } else if (typeof value === 'object') {
      arrFilter = arrFilter.concat(this._getQuery(value));
    }

    return arrFilter;
  };
}
