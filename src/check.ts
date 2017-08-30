/**
 * Type checker
 * @module fbp-types/check
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { CheckerMap, fragments, GenericsMap } from './types';

/** Check a value's datatype */
const check = (
  { type, data }: fragments.Any,
  value: any,
  genericsMap?: GenericsMap,
  checkerMap?: CheckerMap,
): boolean => {
  switch (type) {
    case 'literal':
      // Direct match
      return value === data;

    case 'primitive': {
      // Any type matches all non-null values
      if (data === 'any' && value !== null
        // Void type matches undefined
        || data === 'void' && value === undefined) return true;

      const valueType = typeof value;

      // Check primitive datatype matches
      return data === 'bool' && valueType === 'boolean'
        || data === 'char' && valueType === 'string' && value.length === 1
        || data === 'float' && valueType === 'number'
        || data === 'int' && valueType === 'number' && (value | 0) === value
        || data === 'string' && valueType === 'string';
    }

    case 'generic': {
      const { extends: extendsType, name } = (data as fragments.Generic['data']);

      // Generics are known -> check against specific type
      if (genericsMap) {
        const generic = genericsMap[name];
        if (generic) return check(generic, value, genericsMap, checkerMap);
      }

      // Generic is unknown -> check against possible type (if applicable)
      return !extendsType || check(extendsType, value, genericsMap, checkerMap);
    }

    case 'tuple': {
      // Tuple is represented as array
      if (!Array.isArray(value)) return false;

      const { length } = value;
      return data ?
        // Check tuple size
        length === data.length
          // Check contained values' types
          && !~(data as fragments.Any[]).findIndex((currentType, index) =>
            !check(currentType, value[index], genericsMap, checkerMap),
          )
        // No types given -> empty tuple
      : !length;
    }

    case 'array': {
      // Value has to be an array
      if (!Array.isArray(value)) return false;

      const { size, type: valueType } = data;

      // Check array size
      return value.length === size
        // Check contained values' types
        && !~value.findIndex((currentValue) =>
          !check(valueType, currentValue, genericsMap, checkerMap),
        );
    }

    case 'list':
      // Value has to be an array
      if (!Array.isArray(value)) return false;
      // Check contained values' types
      return !~value.findIndex((currentValue) =>
        !check(data, currentValue, genericsMap, checkerMap),
      );

    case 'struct': {
      // Value has to be an object
      if (typeof value !== 'object' || Array.isArray(value)) return false;

      // No types given (matches any object)
      return !data
        // Check contained types
        || !~Object.keys((data as fragments.Struct['data'])).findIndex((key) => {
          const pair = data[key];
          const currentValue = value[key];

          // Optional keys do not have to exist
          return !(pair.optional && currentValue === undefined
            // Check value type
            || check(pair.type, currentValue, genericsMap, checkerMap));
        });
    }

    case 'map': {
      // Value has to be an object
      if (typeof value !== 'object' || Array.isArray(value)) return false;

      const { keyType, type: valueType } = (data as fragments.MapFragment['data']);

      // Check contained types
      return !~Object.keys(value).findIndex((key) =>
        // Check key type
        !(check(keyType, key, genericsMap, checkerMap)
        // Check value type
        && check(valueType, value[key], genericsMap, checkerMap)),
      );
    }

    case 'named': {
      const { type: valueType } = (data as fragments.Named['data']);
      // If a datatype is specified, the given value has to match it
      if (valueType && !check(valueType, value, genericsMap, checkerMap)) return false;

      // Handle custom type checkers
      if (checkerMap) {
        const checker = checkerMap[data.name];
        return !checker || checker(value);
      }

      return true;
    }

    case 'nullable':
      // Value can be null or of the nullable datatype
      return value === null
        || check(data, value, genericsMap, checkerMap);

    case 'intersection':
      // Value has to match every type in intersection
      return check(data.type, value, genericsMap, checkerMap)
        && check(data.type2, value, genericsMap, checkerMap);

    case 'union':
      // Value has to match (at least) one value in union
      return check(data.type, value, genericsMap, checkerMap)
        || check(data.type2, value, genericsMap, checkerMap);
  }

  return false;
};

export default check;
